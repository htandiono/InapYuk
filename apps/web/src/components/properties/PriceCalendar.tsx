'use client';

import { api } from '@/lib/api-client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { PriceCalendarGrid, type NightlyRate } from './PriceCalendarGrid';

interface PriceCalendarProps {
  slug: string;
  roomId: string;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onNightDataChange: (data: { price: number; isAvailable: boolean } | null) => void;
}

export function PriceCalendar({
  slug,
  roomId,
  selectedDate,
  onSelectDate,
  onNightDataChange,
}: PriceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) {
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
      }
    }
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [nights, setNights] = useState<NightlyRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12

  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<NightlyRate[]>(
        `/properties/${slug}/calendar?roomId=${roomId}&month=${month}&year=${year}`,
      );
      setNights(data);
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [slug, roomId, month, year]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCalendar();
  }, [fetchCalendar]);

  useEffect(() => {
    if (!selectedDate) {
      onNightDataChange(null);
      return;
    }

    if (nights.length > 0) {
      const night = nights.find((n) => n.date.split('T')[0] === selectedDate?.split('T')[0]);
      if (night) {
        onNightDataChange({ price: night.finalPrice, isAvailable: night.isAvailable });
      }
    }
  }, [selectedDate, nights, onNightDataChange]);

  const handlePrevMonth = () => {
    if (isPrevDisabled) return;
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    if (isNextDisabled) return;
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  // Generate blank cells for days before the 1st of the month
  // Threshold logic
  const realCurrentDate = new Date();
  const isPrevDisabled = year === realCurrentDate.getFullYear() && month === realCurrentDate.getMonth() + 1;
  const isNextDisabled = year > realCurrentDate.getFullYear() || (year === realCurrentDate.getFullYear() && month >= realCurrentDate.getMonth() + 12);

  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  const blanks = Array.from({ length: firstDay });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(price);
  };

  return (
    <div className="w-full rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5 mb-6">
        <h3 className="font-heading text-xl font-bold text-foreground">Cek Ketersediaan</h3>

        <div className="flex items-center justify-between w-full">
          <button
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              isPrevDisabled 
                ? 'opacity-30 cursor-not-allowed text-muted-foreground' 
                : 'hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer'
            }`}
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="font-semibold text-foreground text-center">{monthName}</span>

          <button
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              isNextDisabled 
                ? 'opacity-30 cursor-not-allowed text-muted-foreground' 
                : 'hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer'
            }`}
            aria-label="Bulan selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-muted-foreground uppercase">
        <div>Min</div>
        <div>Sen</div>
        <div>Sel</div>
        <div>Rab</div>
        <div>Kam</div>
        <div>Jum</div>
        <div>Sab</div>
      </div>

      <PriceCalendarGrid
        isLoading={isLoading}
        blanks={blanks}
        nights={nights}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        formatPrice={formatPrice}
      />
    </div>
  );
}
