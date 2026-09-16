'use client';

import { useEffect, useState } from 'react';
import type { PropertyReportDay, PropertyReportResponse } from '@inapyuk/types';
import { ApiError } from '@/lib/api-client';
import { NeedTenantLogin } from './AuthGate';
import { bookingGet, withQuery } from './booking-api';
import { useSession } from './session';

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function OccupancyReportView() {
  const session = useSession();
  const [month, setMonth] = useState(currentMonth);
  const [propertyId, setPropertyId] = useState('');
  const [data, setData] = useState<PropertyReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    void loadOccupancy(month, propertyId, setData, setError, setPropertyId);
  }, [session, month, propertyId]);

  if (!session) return <NeedTenantLogin />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={propertyId}
          onChange={(event) => setPropertyId(event.target.value)}
          className="h-10 rounded-lg border border-input px-2 text-sm"
        >
          {(data?.availableProperties ?? []).map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="h-10 rounded-lg border border-input px-2 text-sm"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Legend />
      <RoomCalendars data={data} />
    </div>
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
  if (data.rooms.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Properti ini belum punya kamar.
      </p>
    );
  }
  return (
    <div className="space-y-6">
      {data.rooms.map((room) => (
        <section key={room.roomId} className="space-y-2">
          <h2 className="font-medium">{room.roomName}</h2>
          <div className="overflow-x-auto">
            <div className="grid min-w-[20rem] grid-cols-7 gap-1">
              {room.days.map((day) => (
                <DayCell key={day.date} day={day} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function DayCell({ day }: { day: PropertyReportDay }) {
  return (
    <div className={`rounded-md p-1 text-center text-[11px] leading-tight ${tone(day)}`}>
      <p>{day.date.slice(-2)}</p>
      <p>
        {day.bookedUnits}/{day.totalUnits}
      </p>
    </div>
  );
}

function tone(day: PropertyReportDay) {
  if (day.isBlocked) return 'bg-destructive/70 text-primary-foreground';
  if (day.bookedUnits > 0) return 'bg-primary/80 text-primary-foreground';
  return 'bg-secondary text-secondary-foreground';
}

async function loadOccupancy(
  month: string,
  propertyId: string,
  setData: (data: PropertyReportResponse) => void,
  setError: (message: string | null) => void,
  setPropertyId: (id: string) => void,
) {
  try {
    setError(null);
    const data = await bookingGet<PropertyReportResponse>(
      withQuery('/tenant/reports/property', { month, propertyId: propertyId || undefined }),
    );
    setData(data);
    if (!propertyId && data.propertyId) setPropertyId(data.propertyId);
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memuat kalender');
  }
}
