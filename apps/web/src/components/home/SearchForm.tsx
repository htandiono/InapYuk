'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

export function SearchForm() {
  const router = useRouter();
  const [cities, setCities] = useState<{ city: string; province: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState('2');

  useEffect(() => {
    async function loadCities() {
      try {
        const data = await api.get<{ city: string; province: string }[]>('/api/properties/cities');
        setCities(data);
      } catch (error) {
        console.error('Failed to load cities:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCities();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !checkIn || !checkOut || !guestCount) return;
    
    const params = new URLSearchParams({
      city,
      checkIn, // Already YYYY-MM-DD from <input type="date">
      checkOut, // Already YYYY-MM-DD from <input type="date">
      guests: guestCount,
    });
    
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="mx-auto -mt-12 relative z-20 flex w-full max-w-4xl flex-col sm:flex-row items-end sm:items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-xl shadow-black/5"
    >
      <div className="flex-1 w-full">
        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Kota
        </label>
        <select 
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-xl bg-muted/30 hover:bg-muted/50 px-4 py-3 text-sm transition-colors border-none focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="" disabled>{isLoading ? 'Memuat...' : 'Pilih kota tujuan'}</option>
          {cities.map((c, i) => (
            <option key={i} value={c.city}>{c.city}, {c.province}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 w-full">
        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Check-in
        </label>
        <input 
          required
          type="date" 
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full rounded-xl bg-muted/30 hover:bg-muted/50 px-4 py-3 text-sm transition-colors border-none focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="flex-1 w-full">
        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Check-out
        </label>
        <input 
          required
          type="date"
          min={checkIn} 
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full rounded-xl bg-muted/30 hover:bg-muted/50 px-4 py-3 text-sm transition-colors border-none focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="w-full sm:w-32">
        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Tamu
        </label>
        <input 
          required
          type="number" 
          min="1"
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
          className="w-full rounded-xl bg-muted/30 hover:bg-muted/50 px-4 py-3 text-sm transition-colors border-none focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <button 
        type="submit"
        className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
      >
        Cari
      </button>
    </form>
  );
}
