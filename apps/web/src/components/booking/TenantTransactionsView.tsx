'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  Paginated,
  PaginationMeta,
  TenantBookingListItemDto,
} from '@inapyuk/types';
import { ApiError } from '@/lib/api-client';
import { NeedTenantLogin } from './AuthGate';
import { bookingGet, withQuery } from './booking-api';
import { OrderFilters, type OrderFiltersValue } from './OrderFilters';
import { OrderPager } from './OrderPager';
import { TenantOrderCard } from './TenantOrderCard';
import { TenantOrderDialog } from './TenantOrderDialog';
import { useSession } from './session';

export function TenantTransactionsView() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.toString();
  const filters = readFilters(params);
  const session = useSession();
  const [items, setItems] = useState<TenantBookingListItemDto[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openOrder, setOpenOrder] = useState(params.get('order'));

  useEffect(() => {
    if (!session) return;
    void fetchOrders(readFilters(new URLSearchParams(query)), setItems, setMeta, setError);
  }, [session, query]);

  if (!session) return <NeedTenantLogin />;

  return (
    <div className="space-y-6">
      <OrderFilters value={filters} onChange={(patch) => applyFilters(router, params, patch)} />
      <GuestSearch
        value={params.get('guestName') ?? ''}
        onApply={(guestName) => applyFilters(router, params, { guestName })}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Results
        items={items}
        onOpen={(orderNumber) => setOpenOrder(orderNumber)}
      />
      {meta ? (
        <OrderPager meta={meta} onPage={(page) => applyFilters(router, params, { page: String(page) })} />
      ) : null}
      {openOrder ? (
        <TenantOrderDialog
          orderNumber={openOrder}
          onClose={() => setOpenOrder(null)}
          onDone={() => {
            setOpenOrder(null);
            void fetchOrders(readFilters(new URLSearchParams(query)), setItems, setMeta, setError);
          }}
        />
      ) : null}
    </div>
  );
}

function Results({
  items,
  onOpen,
}: {
  items: TenantBookingListItemDto[] | null;
  onOpen: (orderNumber: string) => void;
}) {
  if (items === null) return <p className="text-sm text-muted-foreground">Memuat transaksi...</p>;
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Belum ada pesanan yang cocok. Coba ganti filter atau cari nama tamu.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <TenantOrderCard item={item} onOpen={() => onOpen(item.orderNumber)} />
        </li>
      ))}
    </ul>
  );
}

function readFilters(
  params: URLSearchParams,
): OrderFiltersValue & { page: string; guestName: string } {
  return {
    status: params.get('status') ?? '',
    orderNumber: params.get('orderNumber') ?? '',
    dateFrom: params.get('dateFrom') ?? '',
    dateTo: params.get('dateTo') ?? '',
    guestName: params.get('guestName') ?? '',
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
  router.replace(qs ? `/tenant/transactions?${qs}` : '/tenant/transactions');
}

async function fetchOrders(
  filters: OrderFiltersValue & { page: string; guestName: string },
  setItems: (items: TenantBookingListItemDto[]) => void,
  setMeta: (meta: PaginationMeta) => void,
  setError: (message: string | null) => void,
) {
  try {
    setError(null);
    const data = await bookingGet<Paginated<TenantBookingListItemDto>>(listPath(filters));
    setItems(data.items);
    setMeta(data.meta);
  } catch (error) {
    setItems([]);
    setError(error instanceof ApiError ? error.message : 'Gagal memuat transaksi');
  }
}

function listPath(filters: OrderFiltersValue & { page: string; guestName: string }) {
  return withQuery('/tenant/bookings', {
    status: filters.status,
    orderNumber: filters.orderNumber,
    guestName: filters.guestName,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page: filters.page,
  });
}

function GuestSearch({
  value,
  onApply,
}: {
  value: string;
  onApply: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft.trim());
      }}
    >
      <input
        value={draft}
        placeholder="Cari nama tamu"
        className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm"
        onChange={(event) => setDraft(event.target.value)}
      />
      <button type="submit" className="rounded-full border border-border px-4 text-sm">
        Cari tamu
      </button>
    </form>
  );
}
