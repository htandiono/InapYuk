'use client';
import { useRouter } from 'next/navigation';

type RouterType = ReturnType<typeof useRouter>;

interface SelectProps {
  searchParams: URLSearchParams;
  router: RouterType;
}

export function CategorySelect({ searchParams, router }: SelectProps) {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set('category', e.target.value);
    else params.delete('category');
    params.set('page', '1');
    router.push(`/properties?${params.toString()}`);
  };
  return (
    <select
      className="w-full sm:w-auto rounded-xl border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
      onChange={onChange}
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

export function SortSelect({ searchParams, router }: SelectProps) {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('page', '1');
    router.push(`/properties?${params.toString()}`);
  };
  return (
    <select
      className="w-full sm:w-auto rounded-xl border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
      onChange={onChange}
      value={`${searchParams.get('sortBy') || 'name'}-${searchParams.get('sortOrder') || 'asc'}`}
    >
      <option value="name-asc">Nama (A-Z)</option>
      <option value="name-desc">Nama (Z-A)</option>
      <option value="price-asc">Harga (Termurah)</option>
      <option value="price-desc">Harga (Termahal)</option>
    </select>
  );
}
