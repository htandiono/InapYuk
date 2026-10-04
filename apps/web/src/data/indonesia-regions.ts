import data from './indonesia-regions.json';

export interface Region {
  id: string;
  name: string;
}

export const PROVINCES: Region[] = data.PROVINCES;

export function getCitiesByProvinceId(provinceId: string): string[] {
  return (data.CITIES as Record<string, string[]>)[provinceId] ?? [];
}

export function getProvinceIdByName(name: string): string | undefined {
  return PROVINCES.find((p) => p.name.toLowerCase() === name.toLowerCase())?.id;
}
