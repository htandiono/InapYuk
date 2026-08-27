import React from 'react';

export interface NightlyRate {
  date: string;
  basePrice: number;
  finalPrice: number;
  isAvailable: boolean;
  availableUnits: number;
}

interface PriceCalendarGridProps {
  isLoading: boolean;
  blanks: unknown[];
  nights: NightlyRate[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  formatPrice: (price: number) => string;
}

export function PriceCalendarGrid({
  isLoading,
  blanks,
  nights,
  selectedDate,
  onSelectDate,
  formatPrice,
}: PriceCalendarGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-muted-foreground animate-pulse">Memuat kalender...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-x-0 gap-y-2">
      {blanks.map((_, i) => (
        <div key={`blank-${i}`} className="min-h-16" />
      ))}
      {nights.map((night, i) => {
        const dateObj = new Date(night.date);
        const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
        const isSelected = selectedDate?.split('T')[0] === night.date.split('T')[0];

        return (
          <div
            key={i}
            onClick={() =>
              !isPast &&
              night.isAvailable &&
              onSelectDate(isSelected ? null : night.date.split('T')[0])
            }
            className={`flex flex-col items-center justify-start rounded-xl py-1.5 transition-all overflow-hidden ${
              isPast
                ? 'opacity-40 cursor-not-allowed'
                : night.isAvailable
                  ? 'hover:bg-muted/50 cursor-pointer group'
                  : 'cursor-not-allowed'
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md scale-105'
                  : isPast || !night.isAvailable
                    ? 'text-muted-foreground/60'
                    : 'text-foreground group-hover:bg-muted-foreground/10'
              }`}
            >
              <span className={`text-sm ${isPast || !night.isAvailable ? 'line-through decoration-muted-foreground/40' : 'font-semibold'}`}>
                {dateObj.getDate()}
              </span>
            </div>

            {!isPast && (
              <span
                className={`text-[9.5px] sm:text-[10.5px] font-medium text-center leading-tight tracking-tight px-0.5 truncate w-full ${
                  isSelected
                    ? 'text-primary font-bold'
                    : night.isAvailable
                      ? 'text-muted-foreground'
                      : 'text-red-500/90 font-semibold'
                }`}
              >
                {night.isAvailable ? formatPrice(night.finalPrice) : 'Penuh'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
