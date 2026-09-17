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
 * Matches DSLR orphan photos (lacking GPS) to the nearest GPS anchor photo within ±windowSeconds (default 180s / 3 min)
 */
export function matchOrphansToAnchors(
  photos: PhotoAsset[],
  maxWindowSeconds: number = 180
): {
  photos: PhotoAsset[];
  anchorsCount: number;
  orphansCount: number;
  matchedOrphansCount: number;
  unmatchedOrphansCount: number;
} {
  const anchors = photos.filter((p) => p.isAnchor && p.coords !== null);
  const orphans = photos.filter((p) => !p.isAnchor || p.coords === null);

  let matchedOrphansCount = 0;

  const processedPhotos: PhotoAsset[] = photos.map((photo) => {
    // If it's already an anchor with coords, return as is
    if (photo.isAnchor && photo.coords) {
      return photo;
    }

    // Search for closest anchor within ±maxWindowSeconds
    const photoTime = new Date(photo.timestamp).getTime();
    let bestAnchor: PhotoAsset | null = null;
    let minTimeDiffSec = Infinity;

    for (const anchor of anchors) {
      const anchorTime = new Date(anchor.timestamp).getTime();
      const diffSec = Math.abs(photoTime - anchorTime) / 1000;

      if (diffSec <= maxWindowSeconds && diffSec < minTimeDiffSec) {
        minTimeDiffSec = diffSec;
        bestAnchor = anchor;
      }
    }

    if (bestAnchor && bestAnchor.coords) {
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
  maxTimeGapHours?: number; // default: 2 hours (7200 seconds)
  maxDistanceMeters?: number; // default: 300 meters
}

/**
 * Spatiotemporal Clustering:
 * Clusters sorted geo-located photos into distinct TravelStops.
 * Photos are grouped together if consecutive photos are within maxTimeGapHours (2h)
 * AND within maxDistanceMeters (300m) of the active stop's centroid.
 */
export function clusterPhotosIntoStops(
  photos: PhotoAsset[],
  options: ClusterOptions = {}
): TravelStop[] {
  const maxTimeGapSec = (options.maxTimeGapHours ?? 2) * 3600;
  const maxDistanceMeters = options.maxDistanceMeters ?? 300;

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

    // Pick hero photo (default to the first or highest-detail anchor)
    const hero = cluster.find((p) => p.isAnchor) || cluster[0];

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
