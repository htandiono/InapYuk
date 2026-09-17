'use client';

import { useEffect, useState } from 'react';
import type { SalesReportQuery, SalesReportResponse } from '@inapyuk/types';
import { formatRupiah } from '@/lib/format';
import { ApiError } from '@/lib/api-client';
import { NeedTenantLogin } from './AuthGate';
import { bookingGet, withQuery } from './booking-api';
import { useSession } from './session';

const GROUPS: Array<{ value: SalesReportQuery['groupBy']; label: string }> = [
  { value: 'property', label: 'Properti' },
  { value: 'transaction', label: 'Transaksi' },
  { value: 'user', label: 'Tamu' },
];

export function SalesReportView() {
  const session = useSession();
  const [groupBy, setGroupBy] = useState<SalesReportQuery['groupBy']>('property');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('total');
  const [data, setData] = useState<SalesReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    void loadSales({ groupBy, dateFrom, dateTo, sortBy }, setData, setError);
  }, [session, groupBy, dateFrom, dateTo, sortBy]);

  if (!session) return <NeedTenantLogin />;

  return (
    <div className="space-y-6">
      <Filters
        groupBy={groupBy}
        dateFrom={dateFrom}
        dateTo={dateTo}
        sortBy={sortBy}
        onGroup={setGroupBy}
        onFrom={setDateFrom}
        onTo={setDateTo}
        onSort={setSortBy}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Summary data={data} />
      <SalesTable data={data} />
    </div>
  );
}

function Filters({
  groupBy,
  dateFrom,
  dateTo,
  sortBy,
  onGroup,
  onFrom,
  onTo,
  onSort,
}: {
  groupBy: SalesReportQuery['groupBy'];
  dateFrom: string;
  dateTo: string;
  sortBy: 'date' | 'total';
  onGroup: (value: SalesReportQuery['groupBy']) => void;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  onSort: (value: 'date' | 'total') => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto">
        {GROUPS.map((group) => (
          <button
            key={group.value}
            type="button"
            onClick={() => onGroup(group.value)}
            className={`h-10 shrink-0 rounded-full px-4 text-sm ${
              groupBy === group.value ? 'bg-primary text-primary-foreground' : 'border border-border'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <input type="date" value={dateFrom} onChange={(event) => onFrom(event.target.value)} className="h-10 rounded-lg border border-input px-2 text-sm" />
        <input type="date" value={dateTo} onChange={(event) => onTo(event.target.value)} className="h-10 rounded-lg border border-input px-2 text-sm" />
        <select
          value={sortBy}
          onChange={(event) => onSort(event.target.value as 'date' | 'total')}
          className="col-span-2 h-10 rounded-lg border border-input px-2 text-sm sm:col-span-1"
        >
          <option value="total">Urutkan total</option>
          <option value="date">Urutkan tanggal</option>
        </select>
      </div>
    </div>
  );
}

function Summary({ data }: { data: SalesReportResponse | null }) {
  if (!data) return <p className="text-sm text-muted-foreground">Memuat laporan...</p>;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Stat label="Total penjualan" value={formatRupiah(data.summary.totalRevenue)} />
      <Stat label="Jumlah pesanan" value={String(data.summary.totalBookings)} />
      <Stat label="Rata-rata per pesanan" value={formatRupiah(data.summary.averageBookingValue)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading mt-1 text-xl text-primary">{value}</p>
    </div>
  );
}

function SalesTable({ data }: { data: SalesReportResponse | null }) {
  if (!data) return null;
  if (data.rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Belum ada penjualan di rentang ini.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Nama</th>
            <th className="px-3 py-2 font-medium">Pesanan</th>
            <th className="px-3 py-2 font-medium">Malam</th>
            <th className="px-3 py-2 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={row.key} className="border-t border-border">
              <td className="px-3 py-2">{row.label}</td>
              <td className="px-3 py-2">{row.bookingCount}</td>
              <td className="px-3 py-2">{row.nightCount}</td>
              <td className="px-3 py-2">{formatRupiah(row.totalRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function loadSales(
  query: { groupBy: SalesReportQuery['groupBy']; dateFrom: string; dateTo: string; sortBy: 'date' | 'total' },
  setData: (data: SalesReportResponse) => void,
  setError: (message: string | null) => void,
) {
  try {
    setError(null);
    setData(
      await bookingGet<SalesReportResponse>(
        withQuery('/tenant/reports/sales', { ...query, sortOrder: 'desc' }),
      ),
    );
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memuat laporan');
  }
}
