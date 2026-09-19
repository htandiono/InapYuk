'use client';
import { useEffect, useState } from 'react';
import type { Property } from './PropertyCard';

export function useFullProperty(p: Property | null) {
  const [fullProp, setFullProp] = useState<Property | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);

  useEffect(() => {
    if (!p) {
      Promise.resolve().then(() => setFullProp(null));
      return;
    }
    const controller = new AbortController();
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoadingFull(true);
    fetch(`/api/properties/tenant/properties/${p.id}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        if (!controller.signal.aborted) setFullProp(json.data || p);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFullProp(p);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingFull(false);
      });
    return () => controller.abort();
  }, [p]);

  return { fullProp, loadingFull };
}
