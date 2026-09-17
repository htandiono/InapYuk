'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { type Property } from './PropertyCard';
export type { Property } from './PropertyCard';

type UsePropertiesResult = {
  properties: Property[];
  totalPages: number;
  loading: boolean;
  fetchProps: (p: number) => Promise<void>;
};

export function useProperties(page: number): UsePropertiesResult {
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

export async function delProp(id: string) {
  const res = await fetch(`/api/properties/tenant/properties/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json()).message);
}

export function useFullProperty(p: Property | null) {
  const [fullProp, setFullProp] = useState<Property | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  useEffect(() => {
    if (!p) return;
    const c = new AbortController();
    (async () => {
      await Promise.resolve();
      setLoadingFull(true);
      try {
        const r = await fetch(`/api/properties/tenant/properties/${p.id}?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' },
          signal: c.signal,
        });
        setFullProp((await r.json()).data || p);
      } catch {
        if (!c.signal.aborted) setFullProp(p);
      } finally {
        if (!c.signal.aborted) setLoadingFull(false);
      }
    })();
    return () => c.abort();
  }, [p]);
  return { fullProp, loadingFull };
}
