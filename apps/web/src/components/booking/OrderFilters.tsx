'use client';

import { useState } from 'react';
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

export function OrderFilters({
  value,
  onChange,
}: {
  value: OrderFiltersValue;
  onChange: (patch: Partial<OrderFiltersValue>) => void;
}) {
  return (
    <div className="space-y-4">
      <StatusTabs current={value.status} onChange={(status) => onChange({ status })} />
      <DateRange value={value} onChange={onChange} />
      <OrderNumberSearch
        key={value.orderNumber}
        value={value.orderNumber}
        onApply={(orderNumber) => onChange({ orderNumber })}
      />
    </div>
  );
}

function StatusTabs({ current, onChange }: { current: string; onChange: (status: string) => void }) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {TABS.map((tab) => (
        <Button
          key={tab.value || 'all'}
          type="button"
          size="sm"
          variant={current === tab.value ? 'default' : 'outline'}
          className="shrink-0 rounded-full"
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

function DateRange({
  value,
  onChange,
}: {
  value: OrderFiltersValue;
  onChange: (patch: Partial<OrderFiltersValue>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <DateInput
        id="dateFrom"
        label="Check-in dari"
        value={value.dateFrom}
        onChange={(dateFrom) => onChange({ dateFrom })}
      />
      <DateInput
        id="dateTo"
        label="Check-in sampai"
        value={value.dateTo}
        onChange={(dateTo) => onChange({ dateTo })}
      />
    </div>
  );
}

function DateInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function OrderNumberSearch({
  value,
  onApply,
}: {
  value: string;
  onApply: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft.trim());
      }}
    >
      <Label htmlFor="orderNumber">Nomor pesanan</Label>
      <div className="flex gap-2">
        <Input
          id="orderNumber"
          value={draft}
          placeholder="INP-20260824-0001"
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" variant="outline" className="rounded-full">
          Cari
        </Button>
      </div>
    </form>
  );
}
