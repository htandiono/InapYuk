import type { BookingNightDto } from '@inapyuk/types';
import { formatDate, formatRupiah } from '@/lib/format';

export function NightBreakdown({ nights }: { nights: BookingNightDto[] }) {
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {nights.map((night) => <NightRow key={night.date} night={night} />)}
    </ul>
  );
}

function NightRow({ night }: { night: BookingNightDto }) {
  return (
    <li className="flex min-w-0 items-start justify-between gap-3 px-4 py-3">
      <NightLabel night={night} />
      <p className="text-sm font-medium">{formatRupiah(night.finalPrice)}</p>
    </li>
  );
}

function NightLabel({ night }: { night: BookingNightDto }) {
  return (
    <div>
      <p className="text-sm font-medium">{formatDate(night.date)}</p>
      <NightNote night={night} />
    </div>
  );
}

function NightNote({ night }: { night: BookingNightDto }) {
  if (night.peakSeasonRateName) {
    return <p className="text-xs text-accent">Peak: {night.peakSeasonRateName}</p>;
  }
  return <p className="text-xs text-muted-foreground">Harga normal</p>;
}
