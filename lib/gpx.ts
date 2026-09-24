// lib/gpx.ts
import { GeoCoordinate } from '@/types/epilog';

export interface TrackPoint {
  timestamp: Date;
  lat: number;
  lng: number;
  altitude?: number;
}

/**
 * Parses GPX, KML, or Google Takeout JSON files into an array of timestamped GPS trackpoints
 */
export function parseTrackFile(fileContent: string): TrackPoint[] {
  const points: TrackPoint[] = [];

  // 1. Try parsing as GPX XML
  if (fileContent.includes('<gpx') || fileContent.includes('<trkpt')) {
    const trkptRegex = /<trkpt\s+lat=["']([-0-9.]+)["']\s+lon=["']([-0-9.]+)["'][^>]*>([\s\S]*?)<\/trkpt>/gi;
    const timeRegex = /<time>([^<]+)<\/time>/i;
    const eleRegex = /<ele>([^<]+)<\/ele>/i;

    let match;
    while ((match = trkptRegex.exec(fileContent)) !== null) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      const body = match[3];

      const timeMatch = timeRegex.exec(body);
      const eleMatch = eleRegex.exec(body);

      if (timeMatch) {
        const time = new Date(timeMatch[1]);
        if (!isNaN(time.getTime())) {
          points.push({
            timestamp: time,
            lat,
            lng,
            altitude: eleMatch ? parseFloat(eleMatch[1]) : undefined,
          });
        }
      }
    }

    if (points.length > 0) {
      return points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
  }

  // 2. Try parsing as Google Location History JSON (Records.json / Timeline)
  try {
    const json = JSON.parse(fileContent);
    const locations = json.locations || json.rawSignals || [];
    for (const loc of locations) {
      const lat = loc.latitudeE7 ? loc.latitudeE7 / 1e7 : loc.latitude;
      const lng = loc.longitudeE7 ? loc.longitudeE7 / 1e7 : loc.longitude;
      const timeStr = loc.timestamp || loc.timestampMs || loc.time;

      if (typeof lat === 'number' && typeof lng === 'number' && timeStr) {
        const time = new Date(timeStr);
        if (!isNaN(time.getTime())) {
          points.push({
            timestamp: time,
            lat,
            lng,
            altitude: loc.altitude,
          });
        }
      }
    }
    if (points.length > 0) {
      return points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
  } catch {
    // Not JSON
  }

  return points;
}

/**
 * Linearly interpolates exact (lat, lng) position for a photo timestamp from a GPS track
 */
export function interpolateTrackCoords(
  photoTime: Date,
  track: TrackPoint[],
  maxGapSeconds = 600 // 10 minutes max interpolation window
): GeoCoordinate | null {
  if (track.length === 0) return null;

  const targetMs = photoTime.getTime();

  // Binary search for closest points
  let low = 0;
  let high = track.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midMs = track[mid].timestamp.getTime();

    if (midMs === targetMs) {
      return {
        lat: Number(track[mid].lat.toFixed(6)),
        lng: Number(track[mid].lng.toFixed(6)),
        altitude: track[mid].altitude,
      };
    }
    if (midMs < targetMs) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // low is index of first element > targetMs, low - 1 is last element < targetMs
  const prevIdx = Math.max(0, low - 1);
  const nextIdx = Math.min(track.length - 1, low);

  const p1 = track[prevIdx];
  const p2 = track[nextIdx];

  const t1 = p1.timestamp.getTime();
  const t2 = p2.timestamp.getTime();

  // If closest point is within 60 seconds, snap directly
  const delta1 = Math.abs(targetMs - t1) / 1000;
  const delta2 = Math.abs(targetMs - t2) / 1000;

  if (delta1 < 60) {
    return { lat: Number(p1.lat.toFixed(6)), lng: Number(p1.lng.toFixed(6)), altitude: p1.altitude };
  }
  if (delta2 < 60) {
    return { lat: Number(p2.lat.toFixed(6)), lng: Number(p2.lng.toFixed(6)), altitude: p2.altitude };
  }

  // Linear interpolation between p1 and p2 if within max gap
  const totalGap = (t2 - t1) / 1000;
  if (totalGap <= maxGapSeconds && t2 > t1) {
    const factor = (targetMs - t1) / (t2 - t1);
    const lat = p1.lat + (p2.lat - p1.lat) * factor;
    const lng = p1.lng + (p2.lng - p1.lng) * factor;
    const altitude = p1.altitude && p2.altitude ? p1.altitude + (p2.altitude - p1.altitude) * factor : p1.altitude;

    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      altitude: altitude ? Number(altitude.toFixed(1)) : undefined,
    };
  }

  return null;
}
