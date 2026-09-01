'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';
import { type NightlyRate } from './PriceCalendarGrid';

export function usePriceCalendarFetch(slug: string, roomId: string) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [nights, setNights] = useState<NightlyRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await api.get<NightlyRate[]>(
        `/properties/${slug}/calendar?roomId=${roomId}&month=${month}&year=${year}`,
      );
      setNights(data);
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [slug, roomId, currentDate]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void fetchCalendar();
  }, [fetchCalendar]);

  return { currentDate, nights, isLoading, setCurrentDate, fetchCalendar };
}

export function usePriceCalendarSelection(
  selectedDate: string | null,
  nights: NightlyRate[],
  onNightDataChange: (data: { price: number; isAvailable: boolean } | null) => void,
) {
  const onNightDataChangeRef = useRef(onNightDataChange);
  useEffect(() => {
    onNightDataChangeRef.current = onNightDataChange;
  });

  useEffect(() => {
    if (!selectedDate) {
      onNightDataChangeRef.current(null);
      return;
    }
    if (nights.length > 0) {
      const night = nights.find((n) => n.date.split('T')[0] === selectedDate?.split('T')[0]);
      if (night) {
        onNightDataChangeRef.current({ price: night.finalPrice, isAvailable: night.isAvailable });
      }
    }
  }, [selectedDate, nights]);
}
