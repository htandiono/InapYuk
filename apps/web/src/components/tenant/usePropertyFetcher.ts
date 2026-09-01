'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Property } from './PropertyCard';

export function usePropertyFetcher(page: number) {
  const [state, setState] = useState({
    properties: [] as Property[],
    totalPages: 1,
    loading: true,
  });

  const fetchProps = useCallback(async (p: number) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(
        `/api/properties/tenant/properties?page=${p}&limit=10&t=${Date.now()}`,
        {
          headers: { 'Cache-Control': 'no-cache' },
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setState({
        properties: json.data.items || json.data,
        totalPages: json.data.meta?.totalPages || 1,
        loading: false,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal');
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchProps(page));
  }, [page, fetchProps]);

  return { ...state, fetchProps };
}
