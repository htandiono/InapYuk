'use client';

import type { SalesReportQuery, SalesReportResponse, SalesReportRow } from '@inapyuk/types';
import { formatRupiah } from '@/lib/format';

const GROUPS: Array<{ value: SalesReportQuery['groupBy']; label: string }> = [
  { value: 'property', label: 'Properti' },
  { value: 'transaction', label: 'Transaksi' },
  { value: 'user', label: 'Tamu' },
];

export type SalesFilters = {
  groupBy: SalesReportQuery['groupBy'];
  setGroupBy: (value: SalesReportQuery['groupBy']) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  sortBy: 'date' | 'total';
  setSortBy: (value: 'date' | 'total') => void;
};

type Group = (typeof GROUPS)[number];

export function Filters({ filters }: { filters: SalesFilters }) {
  return (
    <div className="space-y-3">
      <GroupButtons groupBy={filters.groupBy} onGroup={filters.setGroupBy} />
      <FilterFields filters={filters} />
    </div>
  );
}

function GroupButtons({ groupBy, onGroup }: { groupBy: SalesFilters['groupBy']; onGroup: SalesFilters['setGroupBy'] }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {GROUPS.map((group) => <GroupButton key={group.value} group={group} active={groupBy === group.value} onGroup={onGroup} />)}
    </div>
  );
}

function GroupButton({ group, active, onGroup }: { group: Group; active: boolean; onGroup: SalesFilters['setGroupBy'] }) {
  const tone = active ? 'bg-primary text-primary-foreground' : 'border border-border';
  return (
    <button type="button" onClick={() => onGroup(group.value)} className={`h-10 shrink-0 rounded-full px-4 text-sm ${tone}`}>
      {group.label}
    </button>
  );
}

function FilterFields({ filters }: { filters: SalesFilters }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <DateBox value={filters.dateFrom} onChange={filters.setDateFrom} />
      <DateBox value={filters.dateTo} onChange={filters.setDateTo} />
      <SortBox sortBy={filters.sortBy} onSort={filters.setSortBy} />
    </div>
  );
}

function DateBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border border-input px-2 text-sm" />
  );
}

function SortBox({ sortBy, onSort }: { sortBy: SalesFilters['sortBy']; onSort: SalesFilters['setSortBy'] }) {
  const pick = (value: string) => onSort(value as SalesFilters['sortBy']);
  return (
    <select value={sortBy} onChange={(event) => pick(event.target.value)} className="col-span-2 h-10 rounded-lg border border-input px-2 text-sm sm:col-span-1">
      <option value="total">Urutkan total</option>
      <option value="date">Urutkan tanggal</option>
    </select>
  );
}

export function SalesTable({ data }: { data: SalesReportResponse | null }) {
  if (!data) return null;
  if (data.rows.length === 0) return <EmptySales />;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <SalesHead />
        <SalesBody rows={data.rows} />
      </table>
    </div>
  );
}

function EmptySales() {
  return (
    <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      Belum ada penjualan di rentang ini.
    </p>
  );
}

function SalesHead() {
  return (
    <thead className="bg-muted text-muted-foreground">
      <tr>
        <th className="px-3 py-2 font-medium">Nama</th>
        <th className="px-3 py-2 font-medium">Pesanan</th>
        <th className="px-3 py-2 font-medium">Malam</th>
        <th className="px-3 py-2 font-medium">Total</th>
      </tr>
    </thead>
  );
}

function SalesBody({ rows }: { rows: SalesReportRow[] }) {
  return <tbody>{rows.map((row) => <SalesRow key={row.key} row={row} />)}</tbody>;
}

function SalesRow({ row }: { row: SalesReportRow }) {
  return (
    <tr className="border-t border-border">
      <td className="px-3 py-2">{row.label}</td>
      <td className="px-3 py-2">{row.bookingCount}</td>
      <td className="px-3 py-2">{row.nightCount}</td>
      <td className="px-3 py-2">{formatRupiah(row.totalRevenue)}</td>
    </tr>
  );
}
