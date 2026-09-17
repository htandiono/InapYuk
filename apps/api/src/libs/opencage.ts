import { env } from '../config/env';
import { logger } from './logger';

interface GeocodeResult {
  lat: number;
  lng: number;
}

export interface AddressSuggestion {
  formatted: string;
  lat: number;
  lng: number;
}

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  country: string,
): Promise<GeocodeResult | null> {
  if (!env.OPENCAGE_API_KEY) {
    logger.warn('OPENCAGE_API_KEY is not set. Skipping geocoding.');
    return null;
  }

  const query = encodeURIComponent(`${address}, ${city}, ${state}, ${country}`);
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${env.OPENCAGE_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as { results?: { geometry: { lat: number; lng: number } }[] };
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    logger.error('OpenCage geocoding failed', error);
    return null; // Fallback without lat/lng
  }
}

export async function searchAddress(
  query: string,
  province?: string,
  city?: string,
): Promise<AddressSuggestion[]> {
  if (!env.OPENCAGE_API_KEY) {
    logger.warn('OPENCAGE_API_KEY is not set. Skipping geosearch.');
    return [];
  }

  // If province/city are provided, we bias the search by appending them to the query
  const contextualQuery = [query, city, province, 'Indonesia'].filter(Boolean).join(', ');
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(contextualQuery)}&key=${env.OPENCAGE_API_KEY}&limit=5&countrycode=id`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      results?: { formatted: string; geometry: { lat: number; lng: number } }[];
    };

    if (data.results && data.results.length > 0) {
      return data.results.map((r) => ({
        formatted: r.formatted,
        lat: r.geometry.lat,
        lng: r.geometry.lng,
      }));
    }
    return [];
  } catch (error) {
    logger.error('OpenCage geosearch failed', error);
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!env.OPENCAGE_API_KEY) {
    logger.warn('OPENCAGE_API_KEY is not set. Skipping reverse geocoding.');
    return null;
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${env.OPENCAGE_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as { results?: { formatted: string }[] };

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted;
    }
    return null;
  } catch (error) {
    logger.error('OpenCage reverse geocoding failed', error);
    return null;
  }
}
