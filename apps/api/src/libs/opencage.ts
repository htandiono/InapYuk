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

export async function geocodeAddress(address: string, city: string, state: string, country: string): Promise<GeocodeResult | null> {
  const query = encodeURIComponent(`${address}, ${city}, ${state}, ${country}`);

  if (!env.OPENCAGE_API_KEY) {
    logger.info('OPENCAGE_API_KEY is not set. Using Nominatim fallback for geocoding.');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'InapYukApp/1.0' } });
      const data = await res.json() as any[];
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (error) {
      logger.error('Nominatim geocoding failed', error);
      return null;
    }
  }

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
    return null;
  }
}

export async function searchAddress(query: string, province?: string, city?: string): Promise<AddressSuggestion[]> {
  const contextualQuery = [query, city, province, 'Indonesia'].filter(Boolean).join(', ');

  if (!env.OPENCAGE_API_KEY) {
    logger.info('OPENCAGE_API_KEY is not set. Using Nominatim fallback for geosearch.');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(contextualQuery)}&limit=5&countrycodes=id`;
      const res = await fetch(url, { headers: { 'User-Agent': 'InapYukApp/1.0' } });
      const data = await res.json() as any[];
      if (data && data.length > 0) {
        return data.map((r: any) => ({
          formatted: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        }));
      }
      return [];
    } catch (error) {
      logger.error('Nominatim geosearch failed', error);
      return [];
    }
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(contextualQuery)}&key=${env.OPENCAGE_API_KEY}&limit=5&countrycode=id`;
  try {
    const res = await fetch(url);
    const data = (await res.json()) as { results?: { formatted: string; geometry: { lat: number; lng: number } }[] };
    
    if (data.results && data.results.length > 0) {
      return data.results.map(r => ({
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
    logger.info('OPENCAGE_API_KEY is not set. Using Nominatim fallback for reverse geocoding.');
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'InapYukApp/1.0' } });
      const data = await res.json() as any;
      if (data && data.display_name) {
        return data.display_name;
      }
      return null;
    } catch (error) {
      logger.error('Nominatim reverse geocoding failed', error);
      return null;
    }
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
