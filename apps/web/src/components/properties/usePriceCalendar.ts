import { api } from '@/lib/api-client';
import { useCallback, useEffect, useState } from 'react';
import type { NightlyRate } from './PriceCalendarGrid';

const getInitialDate = (date: string | null) => {
  if (date) {
    const d = new Date(date);
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
};

export function usePriceCalendar(
  slug: string,
  roomId: string,
  selectedDate: string | null,
  onNightDataChange: (data: { price: number; isAvailable: boolean } | null) => void
) {
  const [currentDate, setCurrentDate] = useState(() => getInitialDate(selectedDate));

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
      const target = selectedDate.split('T')[0];
      const night = nights.find((n) => n.date.split('T')[0] === target);
      if (night) {
        onNightDataChange({ price: night.finalPrice, isAvailable: night.isAvailable });
      }
    }
  }, [selectedDate, nights, onNightDataChange]);

  return { currentDate, setCurrentDate, nights, isLoading, year, month };
}
