import { GeoCoordinate, TravelStop } from '@/types/epilog';

// In-memory caches to prevent redundant external API hits
const geoCache = new Map<string, { poiName: string; neighborhood?: string; city: string; country: string }>();
const wikimediaCache = new Map<string, { dateStr: string; headline: string; sourceUrl?: string }>();

/**
 * High-reliability client-side reverse geocoder using BigDataCloud API + Photon OSM fallback
 * (100% free, fast, zero CORS issues, designed for browser web apps)
 */
export async function reverseGeocode(
  coords: GeoCoordinate
): Promise<{ poiName: string; neighborhood?: string; city: string; country: string }> {
  const cacheKey = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
  if (geoCache.has(cacheKey)) {
    return geoCache.get(cacheKey)!;
  }

  // Strategy 1: BigDataCloud Client Reverse Geocode API (Fastest, zero rate limit)
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      
      const locality = data.locality || data.principalSubdivision || '';
      const city = data.city || data.locality || data.principalSubdivision || 'Travel Stop';
      const neighborhood = data.locality && data.city && data.locality !== data.city ? data.locality : undefined;
      const country = data.countryName || '';

      const poiName = locality ? `${locality}` : `Stop @ ${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`;

      const result = {
        poiName,
        neighborhood,
        city,
        country,
      };

      geoCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('BigDataCloud geocode failed, trying Photon OSM fallback:', err);
  }

  // Strategy 2: Photon Komoot OSM API (Free open-source geocoding with detailed POIs)
  try {
    const url = `https://photon.komoot.io/reverse?lat=${coords.lat}&lon=${coords.lng}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      const feature = data.features?.[0]?.properties;
      if (feature) {
        const poiName = feature.name || feature.street || feature.district || feature.city || 'Travel Stop';
        const city = feature.city || feature.state || feature.county || 'Local Stop';
        const country = feature.country || '';
        const neighborhood = feature.district || feature.suburb || undefined;

        const result = { poiName, neighborhood, city, country };
        geoCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Photon geocode fallback failed:', err);
  }

  // Strategy 3: Coordinates fallback
  const fallback = {
    poiName: `Stop @ ${coords.lat.toFixed(3)}°N, ${coords.lng.toFixed(3)}°E`,
    city: 'Exploring...',
    country: '',
  };
  geoCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Fetches notable historical events for a given calendar date (month/day) using Wikimedia API
 */
export async function fetchOnThisDay(
  date: Date
): Promise<{ dateStr: string; headline: string; sourceUrl?: string } | null> {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const cacheKey = `${month}-${day}`;

  if (wikimediaCache.has(cacheKey)) {
    return wikimediaCache.get(cacheKey)!;
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}`;

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${month}/${day}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      const events = data.selected || data.events;

      if (events && events.length > 0) {
        const event = events[0];
        const headline = `${event.year}: ${event.text}`;
        const sourceUrl = event.pages?.[0]?.content_urls?.desktop?.page;

        const result = { dateStr, headline, sourceUrl };
        wikimediaCache.set(cacheKey, result);
        return result;
      }
    }
    return null;
  } catch (err) {
    console.warn('Wikimedia on-this-day fetch failed or timed out:', err);
    return null;
  }
}

/**
 * Enriches a travel stop with both reverse geocoding and historical context concurrently
 */
export async function enrichStop(stop: TravelStop): Promise<TravelStop> {
  const [geoData, historyData] = await Promise.all([
    reverseGeocode(stop.centerCoords),
    fetchOnThisDay(stop.startTime),
  ]);

  return {
    ...stop,
    poiName: geoData.poiName || stop.poiName,
    locationContext: {
      neighborhood: geoData.neighborhood,
      city: geoData.city,
      country: geoData.country,
    },
    worldOnThisDay: historyData || undefined,
  };
}
