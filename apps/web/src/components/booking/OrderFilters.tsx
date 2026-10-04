'use client';

import { useState, type FormEvent } from 'react';
import { BOOKING_STATUS_LABEL } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface OrderFiltersValue {
  status: string;
  orderNumber: string;
  dateFrom: string;
  dateTo: string;
}

const TABS = [
  { value: '', label: 'Semua' },
  { value: 'WAITING_PAYMENT', label: 'Bayar' },
  { value: 'WAITING_CONFIRMATION', label: 'Cek bukti' },
  { value: 'PROCESSED', label: BOOKING_STATUS_LABEL.PROCESSED },
  { value: 'COMPLETED', label: BOOKING_STATUS_LABEL.COMPLETED },
  { value: 'CANCELLED', label: 'Batal' },
] as const;

type FiltersProps = {
  value: OrderFiltersValue;
  onChange: (patch: Partial<OrderFiltersValue>) => void;
};
type TabsProps = { current: string; onChange: (status: string) => void };
type TabItem = (typeof TABS)[number];
type TabProps = { tab: TabItem; current: string; onChange: (status: string) => void };
type DateProps = { id: string; label: string; value: string; onChange: (value: string) => void };
type SearchProps = { value: string; onApply: (value: string) => void };
type RowProps = { draft: string; onDraft: (value: string) => void };

export function OrderFilters({ value, onChange }: FiltersProps) {
  return (
    <div className="space-y-4">
      <StatusTabs current={value.status} onChange={(status) => onChange({ status })} />
      <DateRange value={value} onChange={onChange} />
      <OrderNumberSearch key={value.orderNumber} value={value.orderNumber} onApply={(orderNumber) => onChange({ orderNumber })} />
    </div>
  );
}

function StatusTabs({ current, onChange }: TabsProps) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {TABS.map((tab) => <StatusTab key={tab.value || 'all'} tab={tab} current={current} onChange={onChange} />)}
    </div>
  );
}

function StatusTab({ tab, current, onChange }: TabProps) {
  return (
    <Button type="button" size="sm" variant={current === tab.value ? 'default' : 'outline'} className="h-10 shrink-0 rounded-full px-4" onClick={() => onChange(tab.value)}>
      {tab.label}
    </Button>
  );
}

function DateRange({ value, onChange }: FiltersProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <DateInput id="dateFrom" label="Check-in dari" value={value.dateFrom} onChange={(dateFrom) => onChange({ dateFrom })} />
      <DateInput id="dateTo" label="Check-in sampai" value={value.dateTo} onChange={(dateTo) => onChange({ dateTo })} />
    </div>
  );
}

function DateInput({ id, label, value, onChange }: DateProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function OrderNumberSearch({ value, onApply }: SearchProps) {
  const [draft, setDraft] = useState(value);
  return <NumberForm draft={draft} onDraft={setDraft} onApply={() => onApply(draft.trim())} />;
}

function NumberForm({ draft, onDraft, onApply }: RowProps & { onApply: () => void }) {
  return (
    <form className="space-y-2" onSubmit={applyNumber(onApply)}>
      <Label htmlFor="orderNumber">Nomor pesanan</Label>
      <NumberRow draft={draft} onDraft={onDraft} />
    </form>
  );
}

function applyNumber(onApply: () => void) {
  return (event: FormEvent) => {
    event.preventDefault();
    onApply();
  };
}

function NumberRow({ draft, onDraft }: RowProps) {
  return (
    <div className="flex gap-2">
      <Input id="orderNumber" value={draft} placeholder="INP-20260824-0001" onChange={(event) => onDraft(event.target.value)} />
      <Button type="submit" variant="outline" className="rounded-full">Cari</Button>
    </div>
  );
}
