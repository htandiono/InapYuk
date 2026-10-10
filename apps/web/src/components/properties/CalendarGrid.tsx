'use client';
import type { NightlyRate } from './PriceCalendarGrid';
import { DayCell } from './DayCell';

interface Props {
  blanks: unknown[];
  nights: NightlyRate[];
  checkIn: string | null;
  checkOut: string | null;
  onSelectDate: (date: string | null) => void;
  formatPrice: (price: number) => string;
}

export function CalendarGrid({ blanks, nights, checkIn, checkOut, onSelectDate, formatPrice }: Props) {
  return (
    <div className="grid grid-cols-7 gap-x-0 gap-y-2">
      {blanks.map((_, i) => (
        <div key={`blank-${i}`} className="min-h-16" />
      ))}
      {nights.map((night, i) => (
        <RangeDay
          key={i}
          night={night}
          checkIn={checkIn}
          checkOut={checkOut}
          onSelectDate={onSelectDate}
          formatPrice={formatPrice}
        />
      ))}
    </div>
  );
}

function RangeDay({
  night,
  checkIn,
  checkOut,
  onSelectDate,
  formatPrice,
}: {
  night: NightlyRate;
  checkIn: string | null;
  checkOut: string | null;
  onSelectDate: (date: string | null) => void;
  formatPrice: (price: number) => string;
}) {
  const day = night.date.split('T')[0];
  return (
    <DayCell
      night={night}
      dateObj={new Date(night.date)}
      isSelected={day === checkIn || day === checkOut}
      isInRange={isBetween(day, checkIn, checkOut)}
      onSelect={() => onSelectDate(day)}
      formatPrice={formatPrice}
    />
  );
}

function isBetween(day: string, checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return false;
  return day > checkIn && day < checkOut;
}
