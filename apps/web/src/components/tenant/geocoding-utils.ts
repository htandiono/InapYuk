import { PROVINCES, getCitiesByProvinceId, getProvinceIdByName } from '@/data/indonesia-regions';
import { api } from '@/lib/api-client';

export const matchCity = (provinceId: string, cityName: string): string | undefined => {
  if (!cityName || !provinceId) return undefined;
  const cities = getCitiesByProvinceId(provinceId);
  const name = cityName
    .toLowerCase()
    .replace(/^(kota|kabupaten)\s+/i, '')
    .trim();

  return cities.find((c) => {
    const cName = c
      .toLowerCase()
      .replace(/^(kota|kabupaten)\s+/i, '')
      .trim();
    return cName === name || cName.includes(name) || name.includes(cName);
  });
};

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ formatted: string; province?: string; city?: string } | null> {
  try {
    const searchParams = new URLSearchParams({ lat: lat.toString(), lng: lng.toString() });
    return await api.get(`/geo/reverse?${searchParams.toString()}`);
  } catch {
    return null;
  }
}

export async function autocompleteAddress(
  query: string,
  province?: string,
  city?: string,
): Promise<{ formatted: string; lat: number; lng: number }[]> {
  const searchParams = new URLSearchParams({ q: query });
  if (province) searchParams.append('province', province);
  if (city) searchParams.append('city', city);
  return api.get(`/geo/autocomplete?${searchParams.toString()}`);
}

export function findProvinceId(provinceName: string): string | undefined {
  return (
    getProvinceIdByName(provinceName) ||
    PROVINCES.find(
      (p) =>
        p.name.toLowerCase().includes(provinceName.toLowerCase()) ||
        provinceName.toLowerCase().includes(p.name.toLowerCase()),
    )?.id
  );
}
