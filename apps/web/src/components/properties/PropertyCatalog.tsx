'use client';
import { api } from '@/lib/api-client';
import type { PaginationMeta } from '@inapyuk/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { SearchForm } from '../home/SearchForm';
import { PaginationControls } from './PaginationControls';
import { PropertyCard } from './PropertyCard';

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

function useCatalogSearch(searchParams: URLSearchParams, router: ReturnType<typeof useRouter>) {
  const [name, setName] = useState(searchParams.get('name') || '');
  const [debouncedName, setDebouncedName] = useState(name);
  useEffect(() => {
    const h = setTimeout(() => setDebouncedName(name), 300);
    return () => clearTimeout(h);
  }, [name]);
  const updateSearch = useCallback(
    (newD: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newD) params.set('name', newD);
      else params.delete('name');
      if (searchParams.get('name') !== newD && (newD || searchParams.has('name')))
        router.push(`/properties?${params.toString()}`);
    },
    [searchParams, router],
  );
  useEffect(() => {
    updateSearch(debouncedName);
  }, [debouncedName, updateSearch]);
  return { name, setName, debouncedName };
}

function useCatalogData(searchParams: URLSearchParams, debouncedName: string) {
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

function CatalogHeader({ meta }: { meta: PaginationMeta | null }) {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-foreground">Katalog Penginapan</h1>
      <p className="text-sm text-muted-foreground mt-1">{meta?.total || 0} properti ditemukan</p>
    </div>
  );
}

function CategorySelect({
  searchParams,
  router,
}: {
  searchParams: URLSearchParams;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <select
      className="w-full sm:w-auto rounded-xl border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set('category', e.target.value);
        else params.delete('category');
        params.set('page', '1');
        router.push(`/properties?${params.toString()}`);
      }}
      value={searchParams.get('category') || ''}
    >
      <option value="">Semua Kategori</option>
      <option value="hotel">Hotel</option>
      <option value="villa">Villa</option>
      <option value="apartemen">Apartemen</option>
      <option value="guest-house">Guest House</option>
      <option value="homestay">Homestay</option>
    </select>
  );
}

function SortSelect({
  searchParams,
  router,
}: {
  searchParams: URLSearchParams;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <select
      className="w-full sm:w-auto rounded-xl border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
      onChange={(e) => {
        const [sortBy, sortOrder] = e.target.value.split('-');
        const params = new URLSearchParams(searchParams.toString());
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
        params.set('page', '1');
        router.push(`/properties?${params.toString()}`);
      }}
      value={`${searchParams.get('sortBy') || 'name'}-${searchParams.get('sortOrder') || 'asc'}`}
    >
      <option value="name-asc">Nama (A-Z)</option>
      <option value="name-desc">Nama (Z-A)</option>
      <option value="price-asc">Harga (Termurah)</option>
      <option value="price-desc">Harga (Termahal)</option>
    </select>
  );
}

function CatalogFilters({
  name,
  setName,
  searchParams,
  router,
}: {
  name: string;
  setName: (v: string) => void;
  searchParams: URLSearchParams;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <input
        type="text"
        placeholder="Cari nama properti..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full sm:w-64 rounded-xl border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
      />
      <CategorySelect searchParams={searchParams} router={router} />
      <SortSelect searchParams={searchParams} router={router} />
    </div>
  );
}

function CatalogGrid({
  properties,
  searchParams,
}: {
  properties: Property[];
  searchParams: URLSearchParams;
}) {
  if (properties.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl bg-muted/30">
        <p className="text-lg font-medium">Tidak ada properti yang ditemukan</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
          Coba ganti kata kunci pencarian, atau ubah filter tanggal dan kota di halaman utama.
        </p>
      </div>
    );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {properties.map((prop) => (
        <PropertyCard key={prop.id} {...prop} queryString={searchParams.toString()} />
      ))}
    </div>
  );
}

export function PropertyCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { name, setName, debouncedName } = useCatalogSearch(searchParams, router);
  const { properties, meta, isLoading } = useCatalogData(searchParams, debouncedName);
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/properties?${params.toString()}`);
  };
  return (
    <div className="w-full">
      <div className="mb-10 w-full max-w-5xl mx-auto">
        <SearchForm compact />
      </div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <CatalogHeader meta={meta} />
        <CatalogFilters name={name} setName={setName} searchParams={searchParams} router={router} />
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20">
          <p className="text-muted-foreground text-sm animate-pulse">Mencari penginapan...</p>
        </div>
      ) : (
        <>
          <CatalogGrid properties={properties} searchParams={searchParams} />
          {meta && <PaginationControls meta={meta} onPageChange={handlePageChange} />}
        </>
      )}
    </div>
  );
}
