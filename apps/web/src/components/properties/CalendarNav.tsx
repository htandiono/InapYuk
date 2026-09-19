'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  monthName: string;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function CalendarNav({ monthName, isPrevDisabled, isNextDisabled, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between w-full">
      <NavButton
        disabled={isPrevDisabled}
        onClick={onPrev}
        label="Bulan sebelumnya"
        icon={<ChevronLeft className="w-5 h-5" />}
      />
      <span className="font-semibold text-foreground">{monthName}</span>
      <NavButton
        disabled={isNextDisabled}
        onClick={onNext}
        label="Bulan selanjutnya"
        icon={<ChevronRight className="w-5 h-5" />}
      />
    </div>
  );
}

function NavButton({
  disabled,
  onClick,
  label,
  icon,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${disabled ? 'opacity-30 cursor-not-allowed text-muted-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer'}`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
