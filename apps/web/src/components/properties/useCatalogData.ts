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

export function useCatalogData(searchParams: URLSearchParams, debouncedName: string) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await Promise.resolve();
      setIsLoading(true);
      try {
        const res = await api.get<{ items: Property[]; meta: PaginationMeta }>(
          `/properties?${searchParams.toString()}`,
        );
        if (isMounted) {
          setProperties(res.items);
          setMeta(res.meta);
        }
      } catch {
        // silent
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [searchParams, debouncedName]);

  return { properties, meta, isLoading };
}
