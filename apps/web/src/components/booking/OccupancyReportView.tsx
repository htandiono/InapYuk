'use client';

import { useEffect, useState } from 'react';
import type { PropertyReportDay, PropertyReportResponse, PropertyReportRoom } from '@inapyuk/types';
import { ApiError } from '@/lib/api-client';
import { NeedTenantLogin } from './AuthGate';
import { bookingGet, withQuery } from './booking-api';
import { useSession } from './session';

type Session = ReturnType<typeof useSession>;
type ReportSetter = (data: PropertyReportResponse) => void;
type ErrorSetter = (message: string | null) => void;
type IdSetter = (id: string) => void;
type OccupancyBag = {
  month: string;
  setMonth: (month: string) => void;
  propertyId: string;
  setPropertyId: IdSetter;
  data: PropertyReportResponse | null;
  error: string | null;
};

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function OccupancyReportView() {
  const session = useSession();
  const report = useOccupancy(session);
  if (!session) return <NeedTenantLogin />;
  return <OccupancyScreen report={report} />;
}

function useOccupancy(session: Session): OccupancyBag {
  const [month, setMonth] = useState(currentMonth);
  const [propertyId, setPropertyId] = useState('');
  const [data, setData] = useState<PropertyReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!session) return;
    void loadOccupancy(month, propertyId, setData, setError, setPropertyId);
  }, [session, month, propertyId]);
  return { month, setMonth, propertyId, setPropertyId, data, error };
}

function OccupancyScreen({ report }: { report: OccupancyBag }) {
  return (
    <div className="space-y-6">
      <OccupancyFilters report={report} />
      {report.error ? <p className="text-sm text-destructive">{report.error}</p> : null}
      <Legend />
      <RoomCalendars data={report.data} />
    </div>
  );
}

function OccupancyFilters({ report }: { report: OccupancyBag }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <PropertySelect data={report.data} propertyId={report.propertyId} onChange={report.setPropertyId} />
      <MonthInput month={report.month} onChange={report.setMonth} />
    </div>
  );
}

function PropertySelect({ data, propertyId, onChange }: { data: PropertyReportResponse | null; propertyId: string; onChange: IdSetter }) {
  const properties = data?.availableProperties ?? [];
  return (
    <select value={propertyId} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border border-input px-2 text-sm">
      {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
    </select>
  );
}

function MonthInput({ month, onChange }: { month: string; onChange: (month: string) => void }) {
  return (
    <input type="month" value={month} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border border-input px-2 text-sm" />
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      <li className="flex items-center gap-1"><Swatch className="bg-primary/80" /> Terisi</li>
      <li className="flex items-center gap-1"><Swatch className="bg-secondary" /> Kosong</li>
      <li className="flex items-center gap-1"><Swatch className="bg-destructive/70" /> Ditutup</li>
    </ul>
  );
}

function Swatch({ className }: { className: string }) {
  return <span className={`inline-block h-3 w-3 rounded-sm ${className}`} />;
}

function RoomCalendars({ data }: { data: PropertyReportResponse | null }) {
  if (!data) return <p className="text-sm text-muted-foreground">Memuat kalender...</p>;
  if (data.rooms.length === 0) return <EmptyRooms />;
  return <div className="space-y-6">{data.rooms.map((room) => <RoomCalendar key={room.roomId} room={room} />)}</div>;
}

function EmptyRooms() {
  return (
    <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      Properti ini belum punya kamar.
    </p>
  );
}

function RoomCalendar({ room }: { room: PropertyReportRoom }) {
  return (
    <section className="space-y-2">
      <h2 className="font-medium">{room.roomName}</h2>
      <div className="overflow-x-auto">
        <DayGrid days={room.days} />
      </div>
    </section>
  );
}

function DayGrid({ days }: { days: PropertyReportDay[] }) {
  return (
    <div className="grid min-w-[20rem] grid-cols-7 gap-1">
      {days.map((day) => <DayCell key={day.date} day={day} />)}
    </div>
  );
}

function DayCell({ day }: { day: PropertyReportDay }) {
  return (
    <div className={`rounded-md p-1 text-center text-[11px] leading-tight ${tone(day)}`}>
      <p>{day.date.slice(-2)}</p>
      <p>{day.bookedUnits}/{day.totalUnits}</p>
    </div>
  );
}

function tone(day: PropertyReportDay) {
  if (day.isBlocked) return 'bg-destructive/70 text-primary-foreground';
  if (day.bookedUnits > 0) return 'bg-primary/80 text-primary-foreground';
  return 'bg-secondary text-secondary-foreground';
}

async function loadOccupancy(month: string, propertyId: string, setData: ReportSetter, setError: ErrorSetter, setPropertyId: IdSetter) {
  try {
    setError(null);
    const data = await fetchOccupancy(month, propertyId);
    setData(data);
    if (!propertyId && data.propertyId) setPropertyId(data.propertyId);
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memuat kalender');
  }
}

function fetchOccupancy(month: string, propertyId: string) {
  return bookingGet<PropertyReportResponse>(withQuery('/tenant/reports/property', { month, propertyId: propertyId || undefined }));
}
