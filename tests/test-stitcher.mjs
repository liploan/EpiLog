import assert from 'node:assert';

const EARTH_RADIUS_METERS = 6371000;

function calculateHaversineDistance(coord1, coord2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
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

function calculateCentroid(coords) {
  if (coords.length === 0) return { lat: 0, lng: 0 };
  const sum = coords.reduce(
    (acc, cur) => ({ lat: acc.lat + cur.lat, lng: acc.lng + cur.lng }),
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
}

function matchOrphansToAnchors(photos, maxWindowSeconds = 180) {
  const anchors = photos.filter((p) => p.isAnchor && p.coords !== null);
  const orphans = photos.filter((p) => !p.isAnchor || p.coords === null);
  let matchedOrphansCount = 0;

  const processedPhotos = photos.map((photo) => {
    if (photo.isAnchor && photo.coords) return photo;

    const photoTime = new Date(photo.timestamp).getTime();
    let bestAnchor = null;
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

function clusterPhotosIntoStops(photos, options = {}) {
  const maxTimeGapSec = (options.maxTimeGapHours ?? 2) * 3600;
  const maxDistanceMeters = options.maxDistanceMeters ?? 300;

  const geotaggedPhotos = photos
    .filter((p) => p.coords !== null)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (geotaggedPhotos.length === 0) return [];

  const clusters = [];
  let currentCluster = [geotaggedPhotos[0]];

  for (let i = 1; i < geotaggedPhotos.length; i++) {
    const currentPhoto = geotaggedPhotos[i];
    const previousPhoto = geotaggedPhotos[i - 1];

    const prevTime = new Date(previousPhoto.timestamp).getTime();
    const currTime = new Date(currentPhoto.timestamp).getTime();
    const timeGapSec = (currTime - prevTime) / 1000;

    const clusterCentroid = calculateCentroid(currentCluster.map((p) => p.coords));
    const distFromCentroid = calculateHaversineDistance(clusterCentroid, currentPhoto.coords);

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

  return clusters.map((cluster, index) => ({
    id: `stop-${index + 1}`,
    stopIndex: index + 1,
    startTime: new Date(cluster[0].timestamp),
    endTime: new Date(cluster[cluster.length - 1].timestamp),
    centerCoords: calculateCentroid(cluster.map((p) => p.coords)),
    photos: cluster,
  }));
}

function computeTotalDistanceKm(stops) {
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

console.log('--- Running EpiLog Spatiotemporal Algorithm Suite ---');

// 1. Haversine Test
const tokyo = { lat: 35.6895, lng: 139.6917 };
const kyoto = { lat: 35.0116, lng: 135.7681 };
const distance = calculateHaversineDistance(tokyo, kyoto);
console.log(`Tokyo -> Kyoto Haversine Distance: ${(distance / 1000).toFixed(2)} km`);
assert(distance > 360000 && distance < 380000);

// 2. Centroid Test
const centroid = calculateCentroid([{ lat: 10, lng: 20 }, { lat: 20, lng: 40 }]);
assert.strictEqual(centroid.lat, 15);
assert.strictEqual(centroid.lng, 30);
console.log('✓ Centroid calculation verified');

// 3. Orphan Matching Test (±180s window)
const baseTime = new Date('2024-11-14T10:00:00Z').getTime();
const samplePhotos = [
  {
    id: 'phone-1',
    timestamp: new Date(baseTime),
    coords: { lat: 35.0116, lng: 135.7681 },
    cameraModel: 'iPhone 15 Pro',
    isAnchor: true,
  },
  {
    id: 'dslr-1',
    timestamp: new Date(baseTime + 70 * 1000), // +70s -> matches
    coords: null,
    cameraModel: 'Sony A7 IV',
    isAnchor: false,
  },
  {
    id: 'dslr-2',
    timestamp: new Date(baseTime + 500 * 1000), // +500s -> outside window
    coords: null,
    cameraModel: 'Leica Q3',
    isAnchor: false,
  },
];

const matchResult = matchOrphansToAnchors(samplePhotos, 180);
assert.strictEqual(matchResult.anchorsCount, 1);
assert.strictEqual(matchResult.orphansCount, 2);
assert.strictEqual(matchResult.matchedOrphansCount, 1);
assert.strictEqual(matchResult.unmatchedOrphansCount, 1);

const matchedDslr = matchResult.photos.find((p) => p.id === 'dslr-1');
assert(matchedDslr.coords !== null);
assert.strictEqual(matchedDslr.matchedAnchorId, 'phone-1');
assert.strictEqual(matchedDslr.timeDiffSeconds, 70);
console.log('✓ Spatiotemporal orphan matching verified (±3 min window)');

// 4. Clustering Test (2h / 300m threshold)
const clusterPhotos = [
  { id: 'p1', timestamp: new Date(baseTime), coords: { lat: 35.0001, lng: 135.7001 }, isAnchor: true },
  { id: 'p2', timestamp: new Date(baseTime + 15 * 60 * 1000), coords: { lat: 35.0002, lng: 135.7002 }, isAnchor: true },
  { id: 'p3', timestamp: new Date(baseTime + 3 * 3600 * 1000), coords: { lat: 35.045, lng: 135.75 }, isAnchor: true },
];

const stops = clusterPhotosIntoStops(clusterPhotos, { maxTimeGapHours: 2, maxDistanceMeters: 300 });
assert.strictEqual(stops.length, 2);
assert.strictEqual(stops[0].photos.length, 2);
assert.strictEqual(stops[1].photos.length, 1);
console.log('✓ Spatiotemporal stop clustering verified (2h / 300m thresholds)');

// 5. Distance Metric
const totalDist = computeTotalDistanceKm(stops);
console.log(`✓ Total route distance: ${totalDist} km`);
assert(totalDist > 6 && totalDist < 9);

console.log('All tests passed with 100% success! 🎉');
