'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Paginated, PaginationMeta, TenantBookingListItemDto } from '@inapyuk/types';
import { ApiError } from '@/lib/api-client';
import { NeedTenantLogin } from './AuthGate';
import { bookingGet, withQuery } from './booking-api';
import { OrderFilters, type OrderFiltersValue } from './OrderFilters';
import { OrderPager } from './OrderPager';
import { TenantOrderDialog } from './TenantOrderDialog';
import { GuestSearch, Results } from './tenant-transaction-ui';
import { useSession } from './session';

type Session = ReturnType<typeof useSession>;
type TenantQuery = OrderFiltersValue & { page: string; guestName: string };
type ItemSetter = (items: TenantBookingListItemDto[]) => void;
type MetaSetter = (meta: PaginationMeta) => void;
type ErrorSetter = (message: string | null) => void;
type ListBag = {
  items: TenantBookingListItemDto[] | null;
  setItems: ItemSetter;
  meta: PaginationMeta | null;
  setMeta: MetaSetter;
  error: string | null;
  setError: ErrorSetter;
};
type ScreenProps = {
  router: ReturnType<typeof useRouter>;
  params: ReturnType<typeof useSearchParams>;
  query: string;
  list: ListBag;
  openOrder: string | null;
  setOpenOrder: (order: string | null) => void;
};

export function TenantTransactionsView() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.toString();
  const session = useSession();
  const list = useTenantOrders(session, query);
  const [openOrder, setOpenOrder] = useState(params.get('order'));
  if (!session) return <NeedTenantLogin />;
  return <TxnScreen router={router} params={params} query={query} list={list} openOrder={openOrder} setOpenOrder={setOpenOrder} />;
}

function useTenantOrders(session: Session, query: string): ListBag {
  const [items, setItems] = useState<TenantBookingListItemDto[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!session) return;
    void fetchOrders(readFilters(new URLSearchParams(query)), setItems, setMeta, setError);
  }, [session, query]);
  return { items, setItems, meta, setMeta, error, setError };
}

function TxnScreen({ router, params, query, list, openOrder, setOpenOrder }: ScreenProps) {
  const filters = readFilters(params);
  return (
    <div className="space-y-6">
      <OrderFilters value={filters} onChange={(next) => applyFilters(router, params, next)} />
      <GuestSearch value={params.get('guestName') ?? ''} onApply={(guestName) => applyFilters(router, params, { guestName })} />
      {list.error ? <p className="text-sm text-destructive">{list.error}</p> : null}
      <Results items={list.items} onOpen={setOpenOrder} />
      <TxnPager meta={list.meta} onPage={(page) => applyFilters(router, params, { page: String(page) })} />
      <OpenDialog openOrder={openOrder} query={query} list={list} setOpenOrder={setOpenOrder} />
    </div>
  );
}

function TxnPager({ meta, onPage }: { meta: PaginationMeta | null; onPage: (page: number) => void }) {
  if (!meta) return null;
  return <OrderPager meta={meta} onPage={onPage} />;
}

function OpenDialog({ openOrder, query, list, setOpenOrder }: Pick<ScreenProps, 'openOrder' | 'query' | 'list' | 'setOpenOrder'>) {
  if (!openOrder) return null;
  return (
    <TenantOrderDialog
      orderNumber={openOrder}
      onClose={() => setOpenOrder(null)}
      onDone={() => doneOrder(query, list, setOpenOrder)}
    />
  );
}

function doneOrder(query: string, list: ListBag, setOpenOrder: (order: string | null) => void) {
  setOpenOrder(null);
  void fetchOrders(readFilters(new URLSearchParams(query)), list.setItems, list.setMeta, list.setError);
}

function readFilters(params: URLSearchParams): TenantQuery {
  return {
    status: params.get('status') ?? '',
    orderNumber: params.get('orderNumber') ?? '',
    dateFrom: params.get('dateFrom') ?? '',
    dateTo: params.get('dateTo') ?? '',
    guestName: params.get('guestName') ?? '',
    page: params.get('page') ?? '1',
  };
}

function applyFilters(router: ReturnType<typeof useRouter>, params: URLSearchParams, patch: Record<string, string>) {
  const next = new URLSearchParams(params.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  if (!('page' in patch)) next.delete('page');
  const qs = next.toString();
  router.replace(qs ? `/tenant/transactions?${qs}` : '/tenant/transactions');
}

async function fetchOrders(filters: TenantQuery, setItems: ItemSetter, setMeta: MetaSetter, setError: ErrorSetter) {
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

function listPath(filters: TenantQuery) {
  return withQuery('/tenant/bookings', {
    status: filters.status,
    orderNumber: filters.orderNumber,
    guestName: filters.guestName,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page: filters.page,
  });
}
