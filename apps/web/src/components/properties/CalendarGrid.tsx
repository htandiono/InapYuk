'use client';
import type { NightlyRate } from './PriceCalendarGrid';
import { DayCell } from './DayCell';

interface Props {
  blanks: unknown[];
  nights: NightlyRate[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  formatPrice: (price: number) => string;
}

export function CalendarGrid({ blanks, nights, selectedDate, onSelectDate, formatPrice }: Props) {
  return (
    <div className="grid grid-cols-7 gap-x-0 gap-y-2">
      {blanks.map((_, i) => (
        <div key={`blank-${i}`} className="min-h-16" />
      ))}
      {nights.map((night, i) => (
        <DayCell
          key={i}
          night={night}
          dateObj={new Date(night.date)}
          isSelected={selectedDate?.split('T')[0] === night.date.split('T')[0]}
          onSelect={() => {
            const d = night.date.split('T')[0];
            onSelectDate(selectedDate === d ? null : d);
          }}
          formatPrice={formatPrice}
        />
      ))}
    </div>
  );
}
