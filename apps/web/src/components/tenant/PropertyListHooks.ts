'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { type Property } from './PropertyCard';
export type { Property } from './PropertyCard';

type UsePropertiesResult = { properties: Property[]; totalPages: number; loading: boolean; fetchProps: (p: number) => Promise<void>; };

async function fetchPropsData(p: number) {
  const res = await fetch(`/api/properties/tenant/properties?page=${p}&limit=10&t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
}

export function useProperties(page: number): UsePropertiesResult {
  const [state, setState] = useState({ properties: [] as Property[], totalPages: 1, loading: true });
  const fetchProps = useCallback(async (p: number) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const json = await fetchPropsData(p);
      setState({ properties: json.data.items || json.data, totalPages: json.data.meta?.totalPages || 1, loading: false });
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Gagal'); setState((s) => ({ ...s, loading: false })); }
  }, []);
  useEffect(() => { void Promise.resolve().then(() => fetchProps(page)); }, [page, fetchProps]);
  return { ...state, fetchProps };
}

export async function delProp(id: string) {
  const res = await fetch(`/api/properties/tenant/properties/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json()).message);
}

async function fetchFullPropData(p: Property, c: AbortController, setFullProp: React.Dispatch<React.SetStateAction<Property | null>>, setLoadingFull: React.Dispatch<React.SetStateAction<boolean>>) {
  setLoadingFull(true);
  try {
    const r = await fetch(`/api/properties/tenant/properties/${p.id}?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' }, signal: c.signal });
    setFullProp((await r.json()).data || p);
  } catch {
    if (!c.signal.aborted) setFullProp(p);
  } finally {
    if (!c.signal.aborted) setLoadingFull(false);
  }
}

export function useFullProperty(p: Property | null) {
  const [fullProp, setFullProp] = useState<Property | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  useEffect(() => {
    if (!p) return;
    const c = new AbortController();
    (async () => { await Promise.resolve(); await fetchFullPropData(p, c, setFullProp, setLoadingFull); })();
    return () => c.abort();
  }, [p]);
  return { fullProp, loadingFull };
}
