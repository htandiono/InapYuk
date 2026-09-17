'use client';

import { usePriceCalendar } from './usePriceCalendar';
import { usePriceCalendarNavigation } from './usePriceCalendarNavigation';
import { PriceCalendarHeader, PriceCalendarGridHeader } from './PriceCalendarHeader';
import { PriceCalendarGrid } from './PriceCalendarGrid';

export interface PriceCalendarProps {
  slug: string;
  roomId: string;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onNightDataChange: (data: { price: number; isAvailable: boolean } | null) => void;
}

const formatPrice = (pr: number) =>
  new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(pr);

export function PriceCalendar(p: PriceCalendarProps) {
  const hooks = usePriceCalendar(p.slug, p.roomId, p.selectedDate, p.onNightDataChange);
  const nav = usePriceCalendarNavigation(hooks.currentDate, hooks.setCurrentDate, hooks.year, hooks.month);

  return (
    <div className="w-full rounded-3xl border border-border bg-card p-6 shadow-sm">
      <PriceCalendarHeader nav={nav} />
      <PriceCalendarGridHeader />
      <PriceCalendarGrid
        isLoading={hooks.isLoading} blanks={nav.blanks} nights={hooks.nights}
        selectedDate={p.selectedDate} onSelectDate={p.onSelectDate} formatPrice={formatPrice}
      />
    </div>
  );
}
