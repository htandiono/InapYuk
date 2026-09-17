import { useState } from 'react';

type DIProps = { label: string; min?: string; max?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; };
export function DateInput({ label, min, max, value, onChange }: DIProps) {
  return (
    <div className="flex-1 w-full">
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase px-2">{label}</label>
      <input required type="date" min={min} max={max} value={value} onChange={onChange} className="w-full rounded-lg bg-muted/30 px-4 py-3 text-sm border-none focus:ring-2 focus:ring-primary outline-none" />
    </div>
  );
}

type DFProps = { checkIn: string; checkOut: string; todayStr: string; handleCheckIn: (v: string) => void; setCheckOut: (v: string) => void; };
export function DateFields({ checkIn, checkOut, todayStr, handleCheckIn, setCheckOut }: DFProps) {
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

export function GuestInput({ guests, setGuests }: { guests: string; setGuests: (v: string) => void }) {
  return (
    <div className="w-full sm:w-32">
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase px-2">Tamu</label>
      <input required type="number" min="1" max="30" value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full rounded-lg bg-muted/30 px-4 py-3 text-sm border-none focus:ring-2 outline-none" />
    </div>
  );
}
