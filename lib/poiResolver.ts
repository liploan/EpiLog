// lib/poiResolver.ts
import { GeoCoordinate } from '@/types/epilog';

export interface VenueCandidate {
  name: string;
  type: string; // restaurant, cafe, pub, museum, viewpoint, historic, etc.
  coords: GeoCoordinate;
  address?: string;
  distanceFromLatMeters?: number;
}

const poiCache = new Map<string, VenueCandidate[]>();

/**
 * Queries OpenStreetMap Overpass API for venues (restaurants, cafes, attractions)
 * along a narrow latitude band and approximate longitude window
 */
export async function queryCorridorVenues(
  lat: number,
  approxLng: number,
  searchRadiusKm = 2.0
): Promise<VenueCandidate[]> {
  const cacheKey = `${lat.toFixed(4)},${approxLng.toFixed(2)}`;
  if (poiCache.has(cacheKey)) {
    return poiCache.get(cacheKey)!;
  }

  // Calculate bounding box around approxLng and lat +/- 0.001 (~110m north/south)
  const latDelta = 0.002; // ~220m latitude strip
  const lngDelta = searchRadiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  const minLat = (lat - latDelta).toFixed(5);
  const maxLat = (lat + latDelta).toFixed(5);
  const minLng = (approxLng - lngDelta).toFixed(5);
  const maxLng = (approxLng + lngDelta).toFixed(5);

  const query = `
[out:json][timeout:10];
(
  node["amenity"~"restaurant|cafe|bar|pub|fast_food|ice_cream|marketplace"](${minLat},${minLng},${maxLat},${maxLng});
  node["tourism"~"attraction|museum|viewpoint|hotel|gallery"](${minLat},${minLng},${maxLat},${maxLng});
  node["historic"~"monument|castle|memorial|archaeological_site|ruins|church"](${minLat},${minLng},${maxLat},${maxLng});
  way["amenity"~"restaurant|cafe|bar|pub|marketplace"](${minLat},${minLng},${maxLat},${maxLng});
  way["tourism"~"attraction|museum"](${minLat},${minLng},${maxLat},${maxLng});
  way["historic"](${minLat},${minLng},${maxLat},${maxLng});
);
out center 40;
`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'EpiLog-Journal/1.0',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      const elements = data.elements || [];
      const candidates: VenueCandidate[] = [];

      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:en'] || tags['name:es'] || tags.brand;
        if (!name) continue;

        const elLat = el.lat || el.center?.lat;
        const elLng = el.lon || el.center?.lon;
        if (typeof elLat !== 'number' || typeof elLng !== 'number') continue;

        const type = tags.amenity || tags.tourism || tags.historic || 'place';
        const street = tags['addr:street'] || '';
        const houseNum = tags['addr:housenumber'] || '';
        const address = [street, houseNum].filter(Boolean).join(' ') || undefined;

        const dLatMeters = Math.abs(elLat - lat) * 111132;

        candidates.push({
          name,
          type,
          coords: {
            lat: Number(elLat.toFixed(6)),
            lng: Number(elLng.toFixed(6)),
          },
          address,
          distanceFromLatMeters: Number(dLatMeters.toFixed(1)),
        });
      }

      // Sort by closeness to target latitude
      candidates.sort((a, b) => (a.distanceFromLatMeters || 0) - (b.distanceFromLatMeters || 0));

      poiCache.set(cacheKey, candidates);
      return candidates;
    }
  } catch (err) {
    console.warn('Overpass POI query failed or timed out:', err);
  }

  // Fallback to Photon Komoot reverse POI search
  try {
    const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${approxLng}`, {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      const features = data.features || [];
      const candidates: VenueCandidate[] = features
        .filter((f: any) => f.properties && f.properties.name)
        .map((f: any) => ({
          name: f.properties.name,
          type: f.properties.osm_value || 'landmark',
          coords: {
            lat: Number(f.geometry.coordinates[1].toFixed(6)),
            lng: Number(f.geometry.coordinates[0].toFixed(6)),
          },
          address: [f.properties.street, f.properties.housenumber].filter(Boolean).join(' ') || undefined,
          distanceFromLatMeters: Math.abs(f.geometry.coordinates[1] - lat) * 111132,
        }));

      poiCache.set(cacheKey, candidates);
      return candidates;
    }
  } catch (err) {
    console.warn('Photon POI search fallback failed:', err);
  }

  return [];
}

/**
 * Fuzzy matches a Gemini Vision detected venue name against candidate POIs in the corridor
 */
export function matchVenueFromCandidates(
  detectedName: string,
  candidates: VenueCandidate[]
): VenueCandidate | null {
  if (!detectedName || candidates.length === 0) return null;

  const cleanDetected = detectedName.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const cand of candidates) {
    const cleanCand = cand.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanCand === cleanDetected) {
      return cand;
    }
    if (cleanCand.includes(cleanDetected) || cleanDetected.includes(cleanCand)) {
      return cand;
    }
  }

  // Levenshtein similarity check for slight OCR typos
  let bestCand: VenueCandidate | null = null;
  let bestScore = 0;

  for (const cand of candidates) {
    const cleanCand = cand.name.toLowerCase();
    const cleanDet = detectedName.toLowerCase();
    const score = stringSimilarity(cleanDet, cleanCand);
    if (score > 0.65 && score > bestScore) {
      bestScore = score;
      bestCand = cand;
    }
  }

  return bestCand;
}

function stringSimilarity(s1: string, s2: string): number {
  let longer = s1.length > s2.length ? s1 : s2;
  let shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshtein(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
