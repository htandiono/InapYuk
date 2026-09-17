import { useState, useEffect } from 'react';
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

const fetchCatalogData = async (searchParams: URLSearchParams, isMounted: { current: boolean }, setProperties: React.Dispatch<React.SetStateAction<Property[]>>, setMeta: React.Dispatch<React.SetStateAction<PaginationMeta | null>>, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  await Promise.resolve(); setIsLoading(true);
  try {
    const res = await api.get<{ items: Property[]; meta: PaginationMeta }>(`/properties?${searchParams.toString()}`);
    if (isMounted.current) { setProperties(res.items); setMeta(res.meta); }
  } catch { /* silent */ } finally { if (isMounted.current) setIsLoading(false); }
};

export function useCatalogData(searchParams: URLSearchParams, debouncedName: string) {
  const [properties, setProperties] = useState<Property[]>([]), [meta, setMeta] = useState<PaginationMeta | null>(null), [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const isMounted = { current: true };
    fetchCatalogData(searchParams, isMounted, setProperties, setMeta, setIsLoading);
    return () => { isMounted.current = false; };
  }, [searchParams, debouncedName]);
  return { properties, meta, isLoading };
}
