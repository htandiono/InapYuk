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

function buildBaseQuery(): string {
  if (!env.OPENCAGE_API_KEY) {
    logger.warn('OPENCAGE_API_KEY is not set. Skipping geocoding.');
    return '';
  }
  return `https://api.opencagedata.com/geocode/v1/json?key=${env.OPENCAGE_API_KEY}`;
}

export async function geocodeAddress(address: string, city: string, state: string, country: string): Promise<GeocodeResult | null> {
  const base = buildBaseQuery();
  if (!base) return null;
  const query = encodeURIComponent(`${address}, ${city}, ${state}, ${country}`);
  try {
    const res = await fetch(`${base}&q=${query}`);
    const data = (await res.json()) as { results?: { geometry: { lat: number; lng: number } }[] };
    if (data.results && data.results.length > 0) return data.results[0].geometry;
    return null;
  } catch (error) {
    logger.error('OpenCage geocoding failed', error);
    return null;
  }
}

export async function searchAddress(query: string, province?: string, city?: string): Promise<AddressSuggestion[]> {
  const base = buildBaseQuery();
  if (!base) return [];
  const ctx = [query, city, province, 'Indonesia'].filter(Boolean).join(', ');
  try {
    const res = await fetch(`${base}&q=${encodeURIComponent(ctx)}&limit=5&countrycode=id`);
    const data = (await res.json()) as { results?: { formatted: string; geometry: { lat: number; lng: number } }[] };
    if (data.results && data.results.length > 0)
      return data.results.map((r) => ({ formatted: r.formatted, lat: r.geometry.lat, lng: r.geometry.lng }));
    return [];
  } catch (error) {
    logger.error('OpenCage geosearch failed', error);
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const base = buildBaseQuery();
  if (!base) return null;
  try {
    const res = await fetch(`${base}&q=${lat}+${lng}`);
    const data = (await res.json()) as { results?: { formatted: string }[] };
    if (data.results && data.results.length > 0) return data.results[0].formatted;
    return null;
  } catch (error) {
    logger.error('OpenCage reverse geocoding failed', error);
    return null;
  }
}
