'use client';
import { useRouter } from 'next/navigation';

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

export function CatalogFilters({
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
