import { api } from '@/lib/api-client';
import type { PaginationMeta } from '@inapyuk/types';

interface Property {
  id: string;
  slug: string;
  name: string;
  city: string;
  province: string;
  categoryName: string;
  imageUrl: string | null;
  cheapestPrice: number;
  tenantName?: string | null;
}

export async function fetchCatalogProperties(searchParams: URLSearchParams): Promise<{
  items: Property[];
  meta: PaginationMeta;
}> {
  await Promise.resolve();
  const res = await api.get<{ items: Property[]; meta: PaginationMeta }>(
    `/properties?${searchParams.toString()}`,
  );
  return res;
}

export function calcCatalogTotal(meta: PaginationMeta | null): number {
  return meta?.total || 0;
}
