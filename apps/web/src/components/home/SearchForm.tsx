'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';

interface City { city: string; province: string; }

function useSearchDates(searchParams: URLSearchParams) {
  const [dates] = useState(() => {
    const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const tom = new Date(); tom.setDate(tom.getDate() + 1);
    const tomStr = new Date(tom.getTime() - tom.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return { todayStr, tomStr };
  });

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || dates.todayStr);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || dates.tomStr);

  const handleCheckIn = (val: string) => {
    setCheckIn(val);
    if (val >= checkOut) {
      const next = new Date(val); next.setDate(next.getDate() + 1);
      setCheckOut(new Date(next.getTime() - next.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
    }
  };
  return { todayStr: dates.todayStr, checkIn, checkOut, setCheckOut, handleCheckIn };
}

function useCitySearch(searchParams: URLSearchParams) {
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

  const filtered = cities.filter(c => c.city.toLowerCase().includes(term.toLowerCase()) || c.province.toLowerCase().includes(term.toLowerCase()));
  return { city, setCity, term, setTerm, isOpen, setIsOpen, filtered, loading };
}

function CityDropdownItem({ c, onSelect }: { c: City; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/70"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      <div><span className="font-semibold">{c.city}</span><span className="text-muted-foreground text-xs ml-1">, {c.province}</span></div>
    </button>
  );
}

function CityDropdown({ isOpen, filtered, onSelect }: { isOpen: boolean; filtered: City[]; onSelect: (city: string) => void }) {
  if (!isOpen) return null;
  return (
    <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border bg-background/95 backdrop-blur-xl shadow-xl z-50 p-1.5">
      {filtered.length === 0 ? <div className="p-3 text-sm text-muted-foreground text-center">Kota tidak ditemukan</div> : 
        filtered.map((c, i) => <CityDropdownItem key={i} c={c} onSelect={() => onSelect(c.city)} />)
      }
    </div>
  );
}

function CityInput({ term, setTerm, setCity, setIsOpen, loading, isOpen, filtered }: { term: string; setTerm: (v: string) => void; setCity: (v: string) => void; setIsOpen: (v: boolean) => void; loading: boolean; isOpen: boolean; filtered: City[] }) {
  return (
    <div className="flex-1 w-full relative">
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Kota</label>
      <div className="relative">
        <input required placeholder={loading ? 'Memuat...' : 'Ketik kota'} value={term} 
          onChange={(e) => { setTerm(e.target.value); setCity(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)} onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full rounded-lg bg-muted/30 px-4 py-3 text-sm border-none focus:ring-2 focus:ring-primary outline-none" />
        <CityDropdown isOpen={isOpen} filtered={filtered} onSelect={(c: string) => { setCity(c); setTerm(c); setIsOpen(false); }} />
      </div>
    </div>
  );
}

function DateInput({ label, min, max, value, onChange }: { label: string; min?: string; max?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="flex-1 w-full">
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase px-2">{label}</label>
      <input required type="date" min={min} max={max} value={value} onChange={onChange}
        className="w-full rounded-lg bg-muted/30 px-4 py-3 text-sm border-none focus:ring-2 focus:ring-primary outline-none" />
    </div>
  );
}

function DateFields({ checkIn, checkOut, todayStr, handleCheckIn, setCheckOut }: { checkIn: string; checkOut: string; todayStr: string; handleCheckIn: (v: string) => void; setCheckOut: (v: string) => void }) {
  const [maxYear] = useState(() => new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
  const minOut = checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : todayStr;
  const maxOut = checkIn ? new Date(new Date(checkIn).getTime() + 30 * 86400000).toISOString().split('T')[0] : maxYear;
  return (
    <>
      <DateInput label="Check-in" min={todayStr} max={maxYear} value={checkIn} onChange={(e) => handleCheckIn(e.target.value)} />
      <DateInput label="Check-out" min={minOut} max={maxOut} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
    </>
  );
}

function GuestInput({ guests, setGuests }: { guests: string; setGuests: (v: string) => void }) {
  return (
    <div className="w-full sm:w-32">
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase px-2">Tamu</label>
      <input required type="number" min="1" max="30" value={guests} onChange={(e) => setGuests(e.target.value)}
        className="w-full rounded-lg bg-muted/30 px-4 py-3 text-sm border-none focus:ring-2 outline-none" />
    </div>
  );
}

export function SearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter(); const searchParams = useSearchParams();
  const { city, setCity, term, setTerm, isOpen, setIsOpen, filtered, loading } = useCitySearch(searchParams);
  const { todayStr, checkIn, checkOut, setCheckOut, handleCheckIn } = useSearchDates(searchParams);
  const [guests, setGuests] = useState(searchParams.get('guests') || '2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!city || !checkIn || !checkOut || !guests) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('city', city); params.set('checkIn', checkIn); params.set('checkOut', checkOut); params.set('guests', guests); params.set('page', '1');
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className={`mx-auto relative flex w-full max-w-4xl flex-col sm:flex-row items-end sm:items-center gap-3 rounded-2xl bg-background p-5 shadow-lg ${compact ? 'mb-8 z-10' : '-mt-20 z-20'}`}>
      <CityInput term={term} setTerm={setTerm} setCity={setCity} setIsOpen={setIsOpen} loading={loading} isOpen={isOpen} filtered={filtered} />
      <DateFields checkIn={checkIn} checkOut={checkOut} todayStr={todayStr} handleCheckIn={handleCheckIn} setCheckOut={setCheckOut} />
      <GuestInput guests={guests} setGuests={setGuests} />
      <button type="submit" className="w-full sm:w-auto rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90">Cari</button>
    </form>
  );
}
