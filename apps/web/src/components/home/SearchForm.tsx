'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';

export function SearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cities, setCities] = useState<{ city: string; province: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date helpers
  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = new Date(tomorrowDate.getTime() - tomorrowDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [citySearchTerm, setCitySearchTerm] = useState(searchParams.get('city') || '');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(searchParams.get('guests') || '2');

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || todayStr);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || tomorrowStr);

  // When checkIn changes, ensure checkOut is at least 1 day after
  const handleCheckInChange = (newCheckIn: string) => {
    setCheckIn(newCheckIn);
    if (newCheckIn >= checkOut) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(new Date(nextDay.getTime() - nextDay.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
    }
  };

  const filteredCities = cities.filter(c => 
    c.city.toLowerCase().includes(citySearchTerm.toLowerCase()) ||
    c.province.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  useEffect(() => {
    async function loadCities() {
      try {
        const data = await api.get<{ city: string; province: string }[]>('/properties/cities');
        setCities(data);
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    }
    loadCities();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !checkIn || !checkOut || !guestCount) return;
    
    // Preserve existing params like category or sort order
    const params = new URLSearchParams(searchParams.toString());
    params.set('city', city);
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', guestCount);
    params.set('page', '1'); // Reset to page 1 on new search
    
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`mx-auto relative flex w-full max-w-4xl flex-col sm:flex-row items-end sm:items-center gap-3 rounded-2xl border border-primary/10 bg-background p-5 shadow-lg shadow-primary/5 ${
        compact ? 'mb-8 z-10' : 'animate-fade-in-up delay-400 -mt-20 z-20'
      }`}
    >
      <div className="flex-1 w-full relative">
        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Kota
        </label>
        <div className="relative">
          <input 
            required
            placeholder={isLoading ? 'Memuat...' : 'Ketik atau pilih kota'}
            value={citySearchTerm}
            onChange={(e) => {
              setCitySearchTerm(e.target.value);
              setCity(e.target.value);
              setIsCityDropdownOpen(true);
            }}
            onFocus={() => setIsCityDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsCityDropdownOpen(false), 200)}
            className="w-full rounded-lg bg-muted/30 hover:bg-muted/50 px-4 py-3 text-sm transition-colors border-none focus:ring-2 focus:ring-primary outline-none"
          />
          {isCityDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
              {filteredCities.length === 0 ? (
                 <div className="p-3 text-sm text-muted-foreground text-center">Kota tidak ditemukan</div>
              ) : (
                filteredCities.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCity(c.city);
                      setCitySearchTerm(c.city);
                      setIsCityDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-primary/10 focus:bg-primary/10 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/70"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <div>
                      <span className="font-semibold">{c.city}</span>
                      <span className="text-muted-foreground text-xs ml-1">, {c.province}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 w-full">
        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Check-in
        </label>
        <input 
          required
          type="date" 
          min={todayStr}
          max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]} // Max 1 year in advance
          value={checkIn}
          onChange={(e) => handleCheckInChange(e.target.value)}
          className="w-full rounded-lg bg-muted/30 hover:bg-muted/50 px-4 py-3 text-sm transition-colors border-none focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="flex-1 w-full">
        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Check-out
        </label>
        <input 
          required
          type="date"
          min={
            // Check-out must be at least 1 day after check-in
            checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : tomorrowStr
          } 
          max={
            // Check-out max 30 days after check-in
            checkIn ? new Date(new Date(checkIn).getTime() + 30 * 86400000).toISOString().split('T')[0] : undefined
          }
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full rounded-lg bg-muted/30 hover:bg-muted/50 px-4 py-3 text-sm transition-colors border-none focus:ring-2 focus:ring-primary outline-none"
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
          max="30"
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
          className="w-full rounded-lg bg-muted/30 hover:bg-muted/50 px-4 py-3 text-sm transition-colors border-none focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <button 
        type="submit"
        className="w-full sm:w-auto rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
      >
        Cari
      </button>
    </form>
  );
}
