'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyCard } from './PropertyCard';
import { PaginationControls } from './PaginationControls';
import { SearchForm } from '../home/SearchForm';
import { CatalogFilters } from './CatalogFilters';
import { useCatalogSearch } from './useCatalogSearch';
import { useCatalogData } from './useCatalogData';
import type { Property } from './useCatalogData';
import type { PaginationMeta } from '@inapyuk/types';

function CatalogHeader({ meta }: { meta: PaginationMeta | null }) {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-foreground">Katalog Penginapan</h1>
      <p className="text-sm text-muted-foreground mt-1">{meta?.total || 0} properti ditemukan</p>
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
