import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildQueries, geocodePlace, isInIndonesia } from '../prisma/backfill/geocode';

const place = {
  id: '1',
  name: 'Bantul Sunset Homestay',
  address: 'Jl. Parangtritis KM 24, Bantul',
  city: 'Bantul',
  province: 'DI Yogyakarta',
};

function stubFetch(responses: { lat: string; lon: string }[][]) {
  const fetchMock = vi.fn();
  responses.forEach((body) => fetchMock.mockResolvedValueOnce({ json: async () => body }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('backfill geocoding', () => {
  it('orders queries from the street address down to the province', () => {
    expect(buildQueries(place).map((q) => q.source)).toEqual([
      'address',
      'address',
      'city',
      'province',
    ]);
  });

  it('accepts only points inside Indonesia', () => {
    expect(isInIndonesia({ lat: -7.8, lng: 110.3 })).toBe(true);
    expect(isInIndonesia({ lat: 48.8, lng: 2.3 })).toBe(false);
  });

  it('returns the first query that resolves', async () => {
    const fetchMock = stubFetch([[], [], [{ lat: '-7.89', lon: '110.38' }]]);
    const match = await geocodePlace(place, 0);
    expect(match).toEqual({ point: { lat: -7.89, lng: 110.38 }, source: 'city' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('rejects a result outside Indonesia and gives up when nothing matches', async () => {
    stubFetch([[{ lat: '48.8', lon: '2.3' }], [], [], []]);
    expect(await geocodePlace(place, 0)).toBeNull();
  });
});
