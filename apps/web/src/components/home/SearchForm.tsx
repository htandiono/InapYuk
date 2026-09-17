'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearchDates, useCitySearch, useSearchParamsNavigate } from './SearchFormHooks';
import { CityInput } from './SearchFormCityField';
import { DateFields, GuestInput } from './SearchFormDateField';

export function SearchForm({ compact = false }: { compact?: boolean }) {
  const searchParams = useSearchParams();
  const { city, setCity, term, setTerm, isOpen, setIsOpen, filtered, loading } = useCitySearch(searchParams);
  const { todayStr, checkIn, checkOut, setCheckOut, handleCheckIn } = useSearchDates(searchParams);
  const [guests, setGuests] = useState(searchParams.get('guests') || '2');
  const navigate = useSearchParamsNavigate(searchParams);
  return (
    <form id="search-panel" onSubmit={(e) => { e.preventDefault(); navigate(city, checkIn, checkOut, guests); }} className={`mx-auto relative flex w-full max-w-4xl flex-col sm:flex-row items-end sm:items-center gap-3 rounded-2xl bg-background p-5 shadow-lg ${compact ? 'mb-8 z-10' : '-mt-20 z-20'}`}>
      <CityInput term={term} setTerm={setTerm} setCity={setCity} setIsOpen={setIsOpen} loading={loading} isOpen={isOpen} filtered={filtered} />
      <DateFields checkIn={checkIn} checkOut={checkOut} todayStr={todayStr} handleCheckIn={handleCheckIn} setCheckOut={setCheckOut} />
      <GuestInput guests={guests} setGuests={setGuests} />
      <button type="submit" className="w-full sm:w-auto rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90">Cari</button>
    </form>
  );
}
