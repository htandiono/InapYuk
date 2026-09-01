'use client';
import type { NightlyRate } from './PriceCalendarGrid';

interface Props {
  formatPrice: (price: number) => string;
  night: NightlyRate;
  dateObj: Date;
  isSelected: boolean;
  onSelect: () => void;
}

export function DayCell({ formatPrice, night, dateObj, isSelected, onSelect }: Props) {
  const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
  const classes = `flex flex-col items-center justify-start rounded-xl py-1.5 transition-all overflow-hidden ${isPast ? 'opacity-40 cursor-not-allowed' : night.isAvailable ? 'hover:bg-muted/50 cursor-pointer group' : 'cursor-not-allowed'}`;
  return (
    <div onClick={() => !isPast && night.isAvailable && onSelect()} className={classes}>
      <DayNumber dateObj={dateObj} isSelected={isSelected} isPast={isPast} />
      {!isPast && <NightPrice night={night} formatPrice={formatPrice} isSelected={isSelected} />}
    </div>
  );
}

function DayNumber({
  dateObj,
  isSelected,
  isPast,
}: {
  dateObj: Date;
  isSelected: boolean;
  isPast: boolean;
}) {
  const cls = `flex items-center justify-center w-8 h-8 rounded-full mb-1 transition-colors ${isSelected ? 'bg-primary text-primary-foreground shadow-md scale-105' : isPast ? 'text-muted-foreground/60' : 'text-foreground group-hover:bg-muted-foreground/10'}`;
  return (
    <div className={cls}>
      <span
        className={`text-sm ${isPast ? 'line-through decoration-muted-foreground/40' : 'font-semibold'}`}
      >
        {dateObj.getDate()}
      </span>
    </div>
  );
}

function NightPrice({
  night,
  formatPrice,
  isSelected,
}: {
  night: NightlyRate;
  formatPrice: (p: number) => string;
  isSelected: boolean;
}) {
  const cls = `text-[9.5px] sm:text-[10.5px] font-medium text-center leading-tight tracking-tight px-0.5 truncate w-full ${isSelected ? 'text-primary font-bold' : night.isAvailable ? 'text-muted-foreground' : 'text-red-500/90 font-semibold'}`;
  return <span className={cls}>{night.isAvailable ? formatPrice(night.finalPrice) : 'Penuh'}</span>;
}
