import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useCatalogSearch(searchParams: URLSearchParams) {
  const router = useRouter();
  const [name, setName] = useState(searchParams.get('name') || '');
  const [debouncedName, setDebouncedName] = useState(name);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedName(name), 300);
    return () => clearTimeout(h);
  }, [name]);

  return { name, setName, debouncedName, router };
}

export function useCatalogNavigate(searchParams: URLSearchParams) {
  const router = useRouter();
  return useCallback(
    (newName: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newName) params.set('name', newName);
      else params.delete('name');
      if (searchParams.get('name') !== newName && (newName || searchParams.has('name')))
        router.push(`/properties?${params.toString()}`);
    },
    [searchParams, router],
  );
}

export function usePageNavigate(searchParams: URLSearchParams) {
  const router = useRouter();
  return (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/properties?${params.toString()}`);
  };
}
