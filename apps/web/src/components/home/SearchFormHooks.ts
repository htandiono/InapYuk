import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

interface City {
  city: string;
  province: string;
}

export function useSearchDates(searchParams: URLSearchParams) {
  const [dates] = useState(() => {
    const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const tomStr = new Date(tom.getTime() - tom.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
    return { todayStr, tomStr };
  });

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || dates.todayStr);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || dates.tomStr);

  const handleCheckIn = (val: string) => {
    setCheckIn(val);
    if (val >= checkOut) {
      const next = new Date(val);
      next.setDate(next.getDate() + 1);
      setCheckOut(
        new Date(next.getTime() - next.getTimezoneOffset() * 60000).toISOString().split('T')[0],
      );
    }
  };
  return { todayStr: dates.todayStr, checkIn, checkOut, setCheckOut, handleCheckIn };
}

export function useCitySearch(searchParams: URLSearchParams) {
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [term, setTerm] = useState(searchParams.get('city') || '');
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCities() {
      try {
        const data = await api.get<City[]>('/properties/cities');
        setCities(data);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    loadCities();
  }, []);

  const filtered = cities.filter(
    (c) =>
      c.city.toLowerCase().includes(term.toLowerCase()) ||
      c.province.toLowerCase().includes(term.toLowerCase()),
  );
  return { city, setCity, term, setTerm, isOpen, setIsOpen, filtered, loading };
}

export function useSearchParamsNavigate(searchParams: URLSearchParams) {
  const router = useRouter();
  return (city: string, checkIn: string, checkOut: string, guests: string) => {
    if (!city || !checkIn || !checkOut || !guests) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('city', city);
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', guests);
    params.set('page', '1');
    router.push(`/properties?${params.toString()}`);
  };
}
