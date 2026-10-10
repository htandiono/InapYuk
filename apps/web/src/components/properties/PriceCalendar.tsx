'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';
import type { NightlyRate } from './PriceCalendarGrid';
import { CalendarGrid } from './CalendarGrid';
import { CalendarNav } from './CalendarNav';

interface PriceCalendarProps {
  slug: string;
  roomId: string;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onNightDataChange: (
    data: { price: number; isAvailable: boolean; checkOut?: string } | null,
  ) => void;
}

export function PriceCalendar({
  slug,
  roomId,
  selectedDate,
  onSelectDate,
  onNightDataChange,
}: PriceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(selectedDate || Date.now());
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [nights, setNights] = useState<NightlyRate[]>([]);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const onNightDataChangeRef = useRef(onNightDataChange);

  useEffect(() => {
    onNightDataChangeRef.current = onNightDataChange;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<NightlyRate[]>(
        `/properties/${slug}/calendar?roomId=${roomId}&month=${month}&year=${year}`,
      );
      setNights(data);
    } catch {
      /* Silent fail */
    } finally {
      setIsLoading(false);
    }
  }, [slug, roomId, month, year]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void fetchCalendar();
  }, [fetchCalendar]);

  useEffect(() => {
    onNightDataChangeRef.current(stayQuote(selectedDate, checkOut, nights));
  }, [selectedDate, checkOut, nights]);

  const pickDate = (day: string | null) => {
    if (!day || !selectedDate || checkOut || day <= selectedDate) {
      onSelectDate(day);
      setCheckOut(null);
      return;
    }
    setCheckOut(day);
  };

  const handlePrevMonth = () => {
    setCurrentDate((p) => {
      const d = new Date(p);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };
  const handleNextMonth = () => {
    setCurrentDate((p) => {
      const d = new Date(p);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(price);
  const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const realCurrentDate = new Date();
  const isPrevDisabled =
    year === realCurrentDate.getFullYear() && month === realCurrentDate.getMonth() + 1;
  const isNextDisabled =
    year > realCurrentDate.getFullYear() ||
    (year === realCurrentDate.getFullYear() && month >= realCurrentDate.getMonth() + 12);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const blanks = Array.from({ length: firstDay });

  return (
    <div className="w-full rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5 mb-6">
        <h3 className="font-heading text-xl font-bold text-foreground">Cek Ketersediaan</h3>
        <CalendarNav
          monthName={monthName}
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
      </div>
      <DayHeaders />
      {isLoading ? (
        <LoadingState />
      ) : (
        <CalendarGrid
          blanks={blanks}
          nights={nights}
          checkIn={selectedDate?.split('T')[0] ?? null}
          checkOut={checkOut}
          onSelectDate={pickDate}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
}

function stayQuote(checkIn: string | null, checkOut: string | null, nights: NightlyRate[]) {
  if (!checkIn) return null;
  const start = checkIn.split('T')[0];
  const end = checkOut ?? addDay(start);
  const stay = nights.filter((night) => {
    const day = night.date.split('T')[0];
    return day >= start && day < end;
  });
  if (stay.length === 0) return null;
  const price = stay.reduce((sum, night) => sum + night.finalPrice, 0);
  const isAvailable = stay.every((night) => night.isAvailable);
  return { price, isAvailable, checkOut: checkOut ? end : undefined };
}

function addDay(day: string) {
  const next = new Date(`${day}T00:00:00`);
  next.setDate(next.getDate() + 1);
  return next.toISOString().split('T')[0];
}

function DayHeaders() {
  return (
    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-muted-foreground uppercase">
      {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
        <div key={d}>{d}</div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <span className="text-sm text-muted-foreground animate-pulse">Memuat kalender...</span>
    </div>
  );
}
