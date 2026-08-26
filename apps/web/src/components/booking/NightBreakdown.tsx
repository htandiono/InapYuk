import type { BookingNightDto } from '@inapyuk/types';
import { formatDate, formatRupiah } from '@/lib/format';

export function NightBreakdown({ nights }: { nights: BookingNightDto[] }) {
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {nights.map((night) => (
        <li key={night.date} className="flex items-start justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-medium">{formatDate(night.date)}</p>
            {night.peakSeasonRateName ? (
              <p className="text-xs text-accent">Peak: {night.peakSeasonRateName}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Harga normal</p>
            )}
          </div>
          <p className="text-sm font-medium">{formatRupiah(night.finalPrice)}</p>
        </li>
      ))}
    </ul>
  );
}
