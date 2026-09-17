'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCatalogSearch, usePageNavigate } from './useCatalogSearch';
import { useCatalogData } from './useCatalogData';
import { SearchForm } from '../home/SearchForm';
import { PaginationControls } from './PaginationControls';
import { PropertyCard } from './PropertyCard';
import { CategorySelect, SortSelect } from './CatalogSelects';

function CatalogLoading() {
  return (
    <div className="flex justify-center py-20">
      <p className="text-muted-foreground text-sm animate-pulse">Mencari penginapan...</p>
    </div>
  );
}

function CatalogEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl bg-muted/30">
      <p className="text-lg font-medium">Tidak ada properti yang ditemukan</p>
      <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
        Coba ganti kata kunci pencarian, atau ubah filter tanggal dan kota di halaman utama.
      </p>
    </div>
  );
}

function CatalogGrid({
  properties,
  searchParams,
}: {
  properties: {
    id: string;
    slug: string;
    name: string;
    city: string;
    province: string;
    categoryName: string;
    imageUrl: string | null;
    cheapestPrice: number;
    tenantName?: string | null;
  }[];
  searchParams: URLSearchParams;
}) {
  if (properties.length === 0) return <CatalogEmpty />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {properties.map((prop) => (
        <PropertyCard key={prop.id} {...prop} queryString={searchParams.toString()} />
      ))}
    </div>
  );
}

function CatalogHeader({ meta }: { meta: { total?: number } | null }) {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-foreground">Katalog Penginapan</h1>
      <p className="text-sm text-muted-foreground mt-1">{meta?.total || 0} properti ditemukan</p>
    </div>
  );
}

function CatalogFilters({
  name,
  setName,
  searchParams,
}: {
  name: string;
  setName: (v: string) => void;
  searchParams: URLSearchParams;
}) {
  const router = useRouter();
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

export function PropertyCatalogContent() {
  const searchParams = useSearchParams();
  const { name, setName, debouncedName } = useCatalogSearch(searchParams);
  const pageNavigate = usePageNavigate(searchParams);
  const { properties, meta, isLoading } = useCatalogData(searchParams, debouncedName);

  return (
    <>
      <div className="mb-10 w-full max-w-5xl mx-auto">
        <SearchForm compact />
      </div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <CatalogHeader meta={meta} />
        <CatalogFilters name={name} setName={setName} searchParams={searchParams} />
      </div>
      {isLoading ? (
        <CatalogLoading />
      ) : (
        <>
          <CatalogGrid properties={properties} searchParams={searchParams} />
          {meta && <PaginationControls meta={meta} onPageChange={pageNavigate} />}
        </>
      )}
    </>
  );
}

export function PropertyCatalog() {
  return (
    <div className="w-full">
      <PropertyCatalogContent />
    </div>
  );
}
