export type Place = { id: string; name: string; address: string; city: string; province: string };
export type Point = { lat: number; lng: number };
export type Source = 'address' | 'city' | 'province';
export type Match = { point: Point; source: Source };

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
// Nominatim's usage policy allows at most one request per second.
const DELAY_MS = 1100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function isInIndonesia(p: Point): boolean {
  return p.lat >= -11.5 && p.lat <= 6.5 && p.lng >= 94.5 && p.lng <= 141.5;
}

/** Most specific first; seed data sometimes has a city that disagrees with the street. */
export function buildQueries(p: Place): { source: Source; query: string }[] {
  return [
    { source: 'address', query: `${p.address}, ${p.city}, ${p.province}, Indonesia` },
    { source: 'address', query: `${p.address}, ${p.province}, Indonesia` },
    { source: 'city', query: `${p.city}, ${p.province}, Indonesia` },
    { source: 'province', query: `${p.province}, Indonesia` },
  ];
}

export async function search(query: string): Promise<Point | null> {
  const url = `${NOMINATIM}?format=json&limit=1&countrycodes=id&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'InapYukBackfill/1.0' } });
  const data = (await res.json()) as { lat: string; lon: string }[];
  const first = data[0];
  const point = first ? { lat: Number(first.lat), lng: Number(first.lon) } : null;
  return point && isInIndonesia(point) ? point : null;
}

export async function geocodePlace(place: Place, wait = DELAY_MS): Promise<Match | null> {
  for (const { source, query } of buildQueries(place)) {
    const point = await search(query);
    await sleep(wait);
    if (point) return { point, source };
  }
  return null;
}
