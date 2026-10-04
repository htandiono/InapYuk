'use client';

import { useEffect, useState } from 'react';
import type { SalesReportQuery, SalesReportResponse } from '@inapyuk/types';
import { formatRupiah } from '@/lib/format';
import { ApiError } from '@/lib/api-client';
import { NeedTenantLogin } from './AuthGate';
import { bookingGet, withQuery } from './booking-api';
import { Filters, SalesTable, type SalesFilters } from './sales-report-panels';
import { useSession } from './session';

type Session = ReturnType<typeof useSession>;
type SalesQuery = { groupBy: SalesReportQuery['groupBy']; dateFrom: string; dateTo: string; sortBy: 'date' | 'total' };
type SetSales = (data: SalesReportResponse) => void;
type SetError = (message: string | null) => void;
type ReportBag = { data: SalesReportResponse | null; error: string | null };

export function SalesReportView() {
  const session = useSession();
  const filters = useSalesFilters();
  const report = useSalesReport(session, filters);
  if (!session) return <NeedTenantLogin />;
  return <SalesScreen filters={filters} report={report} />;
}

function useSalesFilters(): SalesFilters {
  const [groupBy, setGroupBy] = useState<SalesReportQuery['groupBy']>('property');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('total');
  return { groupBy, setGroupBy, dateFrom, setDateFrom, dateTo, setDateTo, sortBy, setSortBy };
}

function useSalesReport(session: Session, filters: SalesFilters): ReportBag {
  const { groupBy, dateFrom, dateTo, sortBy } = filters;
  const [data, setData] = useState<SalesReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!session) return;
    void loadSales({ groupBy, dateFrom, dateTo, sortBy }, setData, setError);
  }, [session, groupBy, dateFrom, dateTo, sortBy]);
  return { data, error };
}

function SalesScreen({ filters, report }: { filters: SalesFilters; report: ReportBag }) {
  return (
    <div className="space-y-6">
      <Filters filters={filters} />
      {report.error ? <p className="text-sm text-destructive">{report.error}</p> : null}
      <Summary data={report.data} />
      <SalesTable data={report.data} />
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

async function loadSales(query: SalesQuery, setData: SetSales, setError: SetError) {
  try {
    setError(null);
    setData(await bookingGet<SalesReportResponse>(salesPath(query)));
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memuat laporan');
  }
}

function salesPath(query: SalesQuery) {
  return withQuery('/tenant/reports/sales', { ...query, sortOrder: 'desc' });
}
