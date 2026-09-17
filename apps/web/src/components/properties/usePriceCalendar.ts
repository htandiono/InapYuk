import { api } from '@/lib/api-client';
import { useEffect, useState } from 'react';
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

const fetchNights = async (slug: string, roomId: string, month: number, year: number, setNights: React.Dispatch<React.SetStateAction<NightlyRate[]>>, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  setIsLoading(true);
  try { setNights(await api.get<NightlyRate[]>(`/properties/${slug}/calendar?roomId=${roomId}&month=${month}&year=${year}`)); }
  catch { } finally { setIsLoading(false); }
};

export function usePriceCalendar(slug: string, roomId: string, selectedDate: string | null, onNightDataChange: (data: { price: number; isAvailable: boolean } | null) => void) {
  const [currentDate, setCurrentDate] = useState(() => getInitialDate(selectedDate)), [nights, setNights] = useState<NightlyRate[]>([]), [isLoading, setIsLoading] = useState(true);
  const year = currentDate.getFullYear(), month = currentDate.getMonth() + 1;
  useEffect(() => { fetchNights(slug, roomId, month, year, setNights, setIsLoading); }, [slug, roomId, month, year]);
  useEffect(() => {
    if (!selectedDate) return onNightDataChange(null);
    const night = nights.find((n) => n.date.split('T')[0] === selectedDate.split('T')[0]);
    if (night) onNightDataChange({ price: night.finalPrice, isAvailable: night.isAvailable });
  }, [selectedDate, nights, onNightDataChange]);
  return { currentDate, setCurrentDate, nights, isLoading, year, month };
}
