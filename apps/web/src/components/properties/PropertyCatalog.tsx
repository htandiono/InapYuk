'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { PropertyCard } from './PropertyCard';
import { PaginationControls } from './PaginationControls';
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
}

import { SearchForm } from '../home/SearchForm';

export function PropertyCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [properties, setProperties] = useState<Property[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState(searchParams.get('name') || '');
  const [debouncedName, setDebouncedName] = useState(name);

  // Debounce the name search (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(name);
    }, 300);
    return () => clearTimeout(handler);
  }, [name]);

  // Sync state to URL and fetch
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedName) {
        params.set('name', debouncedName);
      } else {
        params.delete('name');
      }

      if (searchParams.get('name') !== debouncedName && (debouncedName || searchParams.has('name'))) {
        router.push(`/properties?${params.toString()}`);
      }

      const res = await api.get<{ items: Property[]; meta: PaginationMeta }>(`/properties?${params.toString()}`);
      setProperties(res.items);
      setMeta(res.meta);
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, debouncedName, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProperties();
  }, [fetchProperties]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('page', '1');
    router.push(`/properties?${params.toString()}`);
  };

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
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Katalog Penginapan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {meta?.total || 0} properti ditemukan
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari nama properti..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
          />
          
          <select
            className="w-full sm:w-auto rounded-xl border border-border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
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

          <select
            className="w-full sm:w-auto rounded-xl border border-border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
            onChange={handleSortChange}
            value={`${searchParams.get('sortBy') || 'name'}-${searchParams.get('sortOrder') || 'asc'}`}
          >
            <option value="name-asc">Nama (A-Z)</option>
            <option value="name-desc">Nama (Z-A)</option>
            <option value="price-asc">Harga (Termurah)</option>
            <option value="price-desc">Harga (Termahal)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <p className="text-muted-foreground text-sm animate-pulse">Mencari penginapan...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-3xl bg-muted/30">
          <p className="text-lg font-medium text-foreground">Tidak ada properti yang ditemukan</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
            Coba ganti kata kunci pencarian, atau ubah filter tanggal dan kota di halaman utama.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} {...prop} queryString={searchParams.toString()} />
            ))}
          </div>
          
          {meta && <PaginationControls meta={meta} onPageChange={handlePageChange} />}
        </>
      )}
    </div>
  );
}
