'use client';
import { useRouter } from 'next/navigation';

type RouterType = ReturnType<typeof useRouter>;

interface SelectProps {
  searchParams: URLSearchParams;
  router: RouterType;
}

const CAT_OPTS = [{ value: '', label: 'Semua Kategori' }, { value: 'hotel', label: 'Hotel' }, { value: 'villa', label: 'Villa' }, { value: 'apartemen', label: 'Apartemen' }, { value: 'guest-house', label: 'Guest House' }, { value: 'homestay', label: 'Homestay' }];

export function CategorySelect({ searchParams, router }: SelectProps) {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set('category', e.target.value); else params.delete('category');
    params.set('page', '1');
    router.push(`/properties?${params.toString()}`);
  };
  return (
    <select className="w-full sm:w-auto rounded-xl border bg-background px-4 py-2 text-sm outline-none" onChange={onChange} value={searchParams.get('category') || ''}>
      {CAT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

const SORT_OPTS = [{ value: 'name-asc', label: 'Nama (A-Z)' }, { value: 'name-desc', label: 'Nama (Z-A)' }, { value: 'price-asc', label: 'Harga (Termurah)' }, { value: 'price-desc', label: 'Harga (Termahal)' }];

export function SortSelect({ searchParams, router }: SelectProps) {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-'), params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy); params.set('sortOrder', sortOrder); params.set('page', '1');
    router.push(`/properties?${params.toString()}`);
  };
  return (
    <select className="w-full sm:w-auto rounded-xl border bg-background px-4 py-2 text-sm outline-none" onChange={onChange} value={`${searchParams.get('sortBy') || 'name'}-${searchParams.get('sortOrder') || 'asc'}`}>
      {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
