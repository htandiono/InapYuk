'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { BookingListItemDto, Paginated, PaginationMeta } from '@inapyuk/types';
import { ApiError } from '@/lib/api-client';
import { NeedLogin } from './AuthGate';
import { bookingGet, withQuery } from './booking-api';
import { OrderCard } from './OrderCard';
import { OrderFilters, type OrderFiltersValue } from './OrderFilters';
import { OrderPager } from './OrderPager';
import { useSession } from './session';

export function OrderListView() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.toString();
  const filters = readFilters(params);
  const session = useSession();
  const [items, setItems] = useState<BookingListItemDto[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters live in the URL so every change hits GET /bookings, not a local list.
  useEffect(() => {
    if (!session) return;
    void fetchOrders(readFilters(new URLSearchParams(query)), setItems, setMeta, setError);
  }, [session, query]);

  if (!session) return <NeedLogin />;

  return (
    <div className="space-y-6">
      <OrderFilters value={filters} onChange={(patch) => applyFilters(router, params, patch)} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <OrderResults items={items} />
      {meta ? (
        <OrderPager meta={meta} onPage={(page) => applyFilters(router, params, { page: String(page) })} />
      ) : null}
    </div>
  );
}

function OrderResults({ items }: { items: BookingListItemDto[] | null }) {
  if (items === null) return <p className="text-sm text-muted-foreground">Memuat pesanan...</p>;
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Belum ada pesanan yang cocok. Coba ganti filter atau cari nomor lain.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <OrderCard item={item} />
        </li>
      ))}
    </ul>
  );
}

function readFilters(params: URLSearchParams): OrderFiltersValue & { page: string } {
  return {
    status: params.get('status') ?? '',
    orderNumber: params.get('orderNumber') ?? '',
    dateFrom: params.get('dateFrom') ?? '',
    dateTo: params.get('dateTo') ?? '',
    page: params.get('page') ?? '1',
  };
}

function applyFilters(
  router: ReturnType<typeof useRouter>,
  params: URLSearchParams,
  patch: Record<string, string>,
) {
  const next = new URLSearchParams(params.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  if (!('page' in patch)) next.delete('page');
  const qs = next.toString();
  router.replace(qs ? `/orders?${qs}` : '/orders');
}

async function fetchOrders(
  filters: OrderFiltersValue & { page: string },
  setItems: (items: BookingListItemDto[]) => void,
  setMeta: (meta: PaginationMeta) => void,
  setError: (message: string | null) => void,
) {
  try {
    setError(null);
    const data = await bookingGet<Paginated<BookingListItemDto>>(listPath(filters));
    setItems(data.items);
    setMeta(data.meta);
  } catch (error) {
    setItems([]);
    setError(error instanceof ApiError ? error.message : 'Gagal memuat pesanan');
  }
}

function listPath(filters: OrderFiltersValue & { page: string }) {
  return withQuery('/bookings', {
    status: filters.status,
    orderNumber: filters.orderNumber,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page: filters.page,
  });
}
