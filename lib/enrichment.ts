import { GeoCoordinate, TravelStop } from '@/types/epilog';

// Simple in-memory cache to prevent redundant external API hits
const nominatimCache = new Map<string, { poiName: string; neighborhood?: string; city: string; country: string }>();
const wikimediaCache = new Map<string, { dateStr: string; headline: string; sourceUrl?: string }>();

/**
 * Reverse geocodes coordinates to a human-readable POI, neighborhood, city, and country using OpenStreetMap Nominatim.
 */
export async function reverseGeocode(
  coords: GeoCoordinate
): Promise<{ poiName: string; neighborhood?: string; city: string; country: string }> {
  const cacheKey = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
  if (nominatimCache.has(cacheKey)) {
    return nominatimCache.get(cacheKey)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EpiLog-Travel-App/1.0 (contact: support@epilog.app)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.statusText}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    const poiName =
      addr.tourism ||
      addr.historic ||
      addr.amenity ||
      addr.leisure ||
      addr.attraction ||
      addr.building ||
      addr.road ||
      addr.suburb ||
      data.name ||
      'Travel Stop';

    const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.district;
    const city = addr.city || addr.town || addr.village || addr.county || 'Unknown Location';
    const country = addr.country || '';

    const result = { poiName, neighborhood, city, country };
    nominatimCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Reverse geocoding failed, falling back to coordinates:', err);
    return {
      poiName: `Stop @ ${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`,
      city: 'Unknown City',
      country: '',
    };
  }
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
        'User-Agent': 'EpiLog-Travel-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Wikimedia API error: ${response.statusText}`);
    }

    const data = await response.json();
    const events = data.selected || data.events;

    if (events && events.length > 0) {
      // Pick a compelling event
      const event = events[0];
      const headline = `${event.year}: ${event.text}`;
      const sourceUrl = event.pages?.[0]?.content_urls?.desktop?.page;

      const result = { dateStr, headline, sourceUrl };
      wikimediaCache.set(cacheKey, result);
      return result;
    }

    return null;
  } catch (err) {
    console.warn('Wikimedia on-this-day fetch failed:', err);
    return null;
  }
}

/**
 * Enriches a travel stop with both reverse geocoding and historical context
 */
export async function enrichStop(stop: TravelStop): Promise<TravelStop> {
  const [geoData, historyData] = await Promise.all([
    reverseGeocode(stop.centerCoords),
    fetchOnThisDay(stop.startTime),
  ]);

  return {
    ...stop,
    poiName: geoData.poiName,
    locationContext: {
      neighborhood: geoData.neighborhood,
      city: geoData.city,
      country: geoData.country,
    },
    worldOnThisDay: historyData || undefined,
  };
}
