'use client';

import { useState, type FormEvent } from 'react';
import type { TenantBookingListItemDto } from '@inapyuk/types';
import { TenantOrderCard } from './TenantOrderCard';

type ResultsProps = { items: TenantBookingListItemDto[] | null; onOpen: (orderNumber: string) => void };
type SearchProps = { value: string; onApply: (value: string) => void };

export function Results({ items, onOpen }: ResultsProps) {
  if (items === null) return <p className="text-sm text-muted-foreground">Memuat transaksi...</p>;
  if (items.length === 0) return <EmptyTxns />;
  return (
    <ul className="space-y-3">
      {items.map((item) => <TxnItem key={item.id} item={item} onOpen={onOpen} />)}
    </ul>
  );
}

function EmptyTxns() {
  return (
    <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      Belum ada pesanan yang cocok. Coba ganti filter atau cari nama tamu.
    </p>
  );
}

function TxnItem({ item, onOpen }: { item: TenantBookingListItemDto; onOpen: ResultsProps['onOpen'] }) {
  return (
    <li>
      <TenantOrderCard item={item} onOpen={() => onOpen(item.orderNumber)} />
    </li>
  );
}

export function GuestSearch({ value, onApply }: SearchProps) {
  const [draft, setDraft] = useState(value);
  return (
    <form className="flex gap-2" onSubmit={submitGuest(draft, onApply)}>
      <GuestInput draft={draft} onDraft={setDraft} />
      <button type="submit" className="rounded-full border border-border px-4 text-sm">Cari tamu</button>
    </form>
  );
}

function submitGuest(draft: string, onApply: (value: string) => void) {
  return (event: FormEvent) => {
    event.preventDefault();
    onApply(draft.trim());
  };
}

function GuestInput({ draft, onDraft }: { draft: string; onDraft: (value: string) => void }) {
  return (
    <input
      value={draft}
      placeholder="Cari nama tamu"
      className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm"
      onChange={(event) => onDraft(event.target.value)}
    />
  );
}
