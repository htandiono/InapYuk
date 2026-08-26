'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

interface NightlyRate {
  date: string;
  basePrice: number;
  finalPrice: number;
  isAvailable: boolean;
  availableUnits: number;
}

interface PriceCalendarProps {
  slug: string;
  roomId: string;
}

export function PriceCalendar({ slug, roomId }: PriceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
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
        `/api/properties/${slug}/calendar?roomId=${roomId}&month=${month}&year=${year}`
      );
      setNights(data);
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [slug, roomId, month, year]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  // Generate blank cells for days before the 1st of the month
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl font-bold text-foreground">Kalender Harga</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            &larr;
          </button>
          <span className="font-semibold text-foreground min-w-30 text-center">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            &rarr;
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

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-sm text-muted-foreground animate-pulse">Memuat kalender...</span>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square rounded-xl bg-transparent" />
          ))}
          {nights.map((night, i) => {
            const dateObj = new Date(night.date);
            const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
            
            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-center aspect-square rounded-xl border p-1 transition-all ${
                  isPast
                    ? 'bg-muted/30 border-transparent opacity-50'
                    : night.isAvailable
                    ? 'border-border bg-background hover:border-primary/50 cursor-pointer group'
                    : 'bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30'
                }`}
              >
                <span className={`text-sm font-semibold mb-1 ${isPast || !night.isAvailable ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>
                  {dateObj.getDate()}
                </span>
                {!isPast && (
                  <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${night.isAvailable ? 'text-primary' : 'text-red-500/80 dark:text-red-400/80'}`}>
                    {night.isAvailable ? `Rp${formatPrice(night.finalPrice)}` : 'Penuh'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
