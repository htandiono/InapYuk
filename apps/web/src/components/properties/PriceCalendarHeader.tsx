import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PriceCalendarHeaderProps {
  nav: {
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    isPrevDisabled: boolean;
    isNextDisabled: boolean;
    monthName: string;
  };
}

export function PrevMonthButton({ nav }: PriceCalendarHeaderProps) {
  const cls = `p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${nav.isPrevDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'} text-muted-foreground hover:text-foreground`;
  return (
    <button onClick={nav.handlePrevMonth} disabled={nav.isPrevDisabled} className={cls}>
      <ChevronLeft className="w-5 h-5" />
    </button>
  );
}

export function NextMonthButton({ nav }: PriceCalendarHeaderProps) {
  const cls = `p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${nav.isNextDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'} text-muted-foreground hover:text-foreground`;
  return (
    <button onClick={nav.handleNextMonth} disabled={nav.isNextDisabled} className={cls}>
      <ChevronRight className="w-5 h-5" />
    </button>
  );
}

export function PriceCalendarNavButtons({ nav }: PriceCalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <PrevMonthButton nav={nav} />
      <span className="font-semibold text-foreground text-center">{nav.monthName}</span>
      <NextMonthButton nav={nav} />
    </div>
  );
}

export function PriceCalendarHeader({ nav }: PriceCalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-5 mb-6">
      <h3 className="font-heading text-xl font-bold text-foreground">Cek Ketersediaan</h3>
      <PriceCalendarNavButtons nav={nav} />
    </div>
  );
}

export function PriceCalendarGridHeader() {
  return (
    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-muted-foreground uppercase">
      <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
    </div>
  );
}
