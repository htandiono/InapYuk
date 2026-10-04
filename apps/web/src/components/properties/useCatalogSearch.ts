'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useCatalogSearch(
  searchParams: URLSearchParams,
  router: ReturnType<typeof useRouter>,
) {
  const [name, setName] = useState(searchParams.get('name') || '');
  const [debouncedName, setDebouncedName] = useState(name);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedName(name), 300);
    return () => clearTimeout(handler);
  }, [name]);

  const updateSearch = useCallback(
    (newDebounced: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newDebounced) params.set('name', newDebounced);
      else params.delete('name');
      if (searchParams.get('name') !== newDebounced && (newDebounced || searchParams.has('name'))) {
        router.push(`/properties?${params.toString()}`);
      }
    },
    [searchParams, router],
  );

  useEffect(() => {
    updateSearch(debouncedName);
  }, [debouncedName, updateSearch]);

  return { name, setName, debouncedName };
}
