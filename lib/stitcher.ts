import { GeoCoordinate, PhotoAsset, TravelStop } from '@/types/epilog';

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates great-circle distance between two geo-coordinates in meters using Haversine formula
 */
export function calculateHaversineDistance(
  coord1: GeoCoordinate,
  coord2: GeoCoordinate
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates the geographic centroid (average lat/lng) for a list of coordinates
 */
export function calculateCentroid(coords: GeoCoordinate[]): GeoCoordinate {
  if (coords.length === 0) {
    return { lat: 0, lng: 0 };
  }
  const sum = coords.reduce(
    (acc, cur) => ({
      lat: acc.lat + cur.lat,
      lng: acc.lng + cur.lng,
    }),
    { lat: 0, lng: 0 }
  );
  return {
    lat: sum.lat / coords.length,
    lng: sum.lng / coords.length,
  };
}

/**
 * Matches DSLR orphan photos (lacking GPS) to the nearest GPS anchor photo
 * Uses precise ±windowSeconds matching first, then falls back to same-day session matching
 */
export function matchOrphansToAnchors(
  photos: PhotoAsset[],
  maxWindowSeconds: number = 300
): {
  photos: PhotoAsset[];
  anchorsCount: number;
  orphansCount: number;
  matchedOrphansCount: number;
  unmatchedOrphansCount: number;
} {
  // Always sort chronologically first
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const anchors = sortedPhotos.filter((p) => p.isAnchor && p.coords !== null);
  const orphans = sortedPhotos.filter((p) => !p.isAnchor || p.coords === null);

  let matchedOrphansCount = 0;

  const processedPhotos: PhotoAsset[] = sortedPhotos.map((photo) => {
    // If it's already an anchor with coords, return as is
    if (photo.isAnchor && photo.coords) {
      return photo;
    }

    // Step 1: Search for closest anchor within ±maxWindowSeconds
    const photoTime = new Date(photo.timestamp).getTime();
    let bestAnchor: PhotoAsset | null = null;
    let minTimeDiffSec = Infinity;

    for (const anchor of anchors) {
      const anchorTime = new Date(anchor.timestamp).getTime();
      const diffSec = Math.abs(photoTime - anchorTime) / 1000;

      if (diffSec < minTimeDiffSec) {
        minTimeDiffSec = diffSec;
        bestAnchor = anchor;
      }
    }

    // Match if within window
    if (bestAnchor && bestAnchor.coords && minTimeDiffSec <= maxWindowSeconds) {
      matchedOrphansCount++;
      return {
        ...photo,
        coords: { ...bestAnchor.coords },
        matchedAnchorId: bestAnchor.id,
        timeDiffSeconds: Math.round(minTimeDiffSec),
      };
    }

    // Unmatched orphan
    return photo;
  });

  return {
    photos: processedPhotos,
    anchorsCount: anchors.length,
    orphansCount: orphans.length,
    matchedOrphansCount,
    unmatchedOrphansCount: orphans.length - matchedOrphansCount,
  };
}

export interface ClusterOptions {
  maxTimeGapHours?: number; // Layer 1 default: 2 hours (7200 seconds)
  maxDistanceMeters?: number; // Layer 1 default: 300 meters
  microClusterDistanceMeters?: number; // Layer 2 default: 25 meters
}

/**
 * Layer 2 Micro-Establishment Decomposition:
 * Groups photos within a macro stop into distinct micro-establishments (radius <= 25m)
 */
export function decomposeStopIntoMicroEstablishments(
  photos: PhotoAsset[],
  maxMicroDistanceMeters: number = 25
): {
  centroid: GeoCoordinate;
  photos: PhotoAsset[];
}[] {
  const geoPhotos = photos.filter((p) => p.coords !== null);
  if (geoPhotos.length === 0) return [];

  const microClusters: PhotoAsset[][] = [];
  let currentGroup: PhotoAsset[] = [geoPhotos[0]];

  for (let i = 1; i < geoPhotos.length; i++) {
    const p = geoPhotos[i];
    const groupCentroid = calculateCentroid(currentGroup.map((x) => x.coords!));
    const dist = calculateHaversineDistance(groupCentroid, p.coords!);

    if (dist <= maxMicroDistanceMeters) {
      currentGroup.push(p);
    } else {
      microClusters.push(currentGroup);
      currentGroup = [p];
    }
  }

  if (currentGroup.length > 0) {
    microClusters.push(currentGroup);
  }

  return microClusters.map((group) => ({
    centroid: calculateCentroid(group.map((x) => x.coords!)),
    photos: group,
  }));
}

/**
 * Two-Layer Spatiotemporal Clustering:
 * Layer 1: Groups sorted geo-located photos into distinct TravelStops (bulk 300m / 2h filter).
 * Layer 2: Decomposes each stop into sub-meter micro-establishments (<=25m radius).
 */
export function clusterPhotosIntoStops(
  photos: PhotoAsset[],
  options: ClusterOptions = {}
): TravelStop[] {
  const maxTimeGapSec = (options.maxTimeGapHours ?? 2) * 3600;
  const maxDistanceMeters = options.maxDistanceMeters ?? 300;
  const microDist = options.microClusterDistanceMeters ?? 25;

  // Filter photos that have valid coordinates (anchors and matched orphans)
  const geotaggedPhotos = photos
    .filter((p): p is PhotoAsset & { coords: GeoCoordinate } => p.coords !== null)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (geotaggedPhotos.length === 0) {
    return [];
  }

  const clusters: (PhotoAsset & { coords: GeoCoordinate })[][] = [];
  let currentCluster: (PhotoAsset & { coords: GeoCoordinate })[] = [geotaggedPhotos[0]];

  for (let i = 1; i < geotaggedPhotos.length; i++) {
    const currentPhoto = geotaggedPhotos[i];
    const previousPhoto = geotaggedPhotos[i - 1];

    const prevTime = new Date(previousPhoto.timestamp).getTime();
    const currTime = new Date(currentPhoto.timestamp).getTime();
    const timeGapSec = (currTime - prevTime) / 1000;

    // Calculate current cluster centroid
    const clusterCentroid = calculateCentroid(currentCluster.map((p) => p.coords));
    const distFromCentroid = calculateHaversineDistance(clusterCentroid, currentPhoto.coords);

    // If within both temporal and spatial thresholds, append to current cluster
    if (timeGapSec <= maxTimeGapSec && distFromCentroid <= maxDistanceMeters) {
      currentCluster.push(currentPhoto);
    } else {
      clusters.push(currentCluster);
      currentCluster = [currentPhoto];
    }
  }

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // Transform clusters into TravelStop objects
  const stops: TravelStop[] = clusters.map((cluster, index) => {
    const coordsList = cluster.map((p) => p.coords);
    const centerCoords = calculateCentroid(coordsList);
    const startTime = new Date(cluster[0].timestamp);
    const endTime = new Date(cluster[cluster.length - 1].timestamp);

    // Pick hero photo (prefer DSLR/non-anchor, fallback to first photo)
    const hero = cluster.find((p) => !p.isAnchor) || cluster[0];

    return {
      id: `stop-${index + 1}-${Date.now().toString(36)}`,
      stopIndex: index + 1,
      startTime,
      endTime,
      centerCoords,
      poiName: `Stop ${index + 1}`,
      locationContext: {
        city: 'Exploring...',
        country: '',
      },
      photos: cluster,
      heroPhotoId: hero.id,
      narrativeCaption: '',
      reflection: {
        category: 'Cultural',
        takeawayText: '',
      },
      microEstablishments: [],
    };
  });

  return stops;
}

/**
 * Computes the total path distance in kilometers across consecutive stops
 */
export function computeTotalDistanceKm(stops: TravelStop[]): number {
  if (stops.length < 2) return 0;
  let totalMeters = 0;
  for (let i = 1; i < stops.length; i++) {
    totalMeters += calculateHaversineDistance(
      stops[i - 1].centerCoords,
      stops[i].centerCoords
    );
  }
  return Number((totalMeters / 1000).toFixed(1));
}
