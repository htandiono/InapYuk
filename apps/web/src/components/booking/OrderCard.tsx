import Link from 'next/link';
import type { BookingListItemDto } from '@inapyuk/types';
import { formatDateRange, formatRupiah } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

export function OrderCard({ item }: { item: BookingListItemDto }) {
  return (
    <Link
      href={`/orders/${item.orderNumber}`}
      className="flex gap-3 rounded-2xl border border-border bg-card p-3"
    >
      <Cover url={item.coverImageUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.propertyName}</p>
        <p className="text-xs text-muted-foreground">
          {item.roomName} · {item.orderNumber}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDateRange(item.checkIn, item.checkOut)}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <StatusBadge status={item.status} />
          <span className="text-sm font-medium">{formatRupiah(item.totalPrice)}</span>
        </div>
      </div>
    </Link>
  );
}

function Cover({ url }: { url: string | null }) {
  if (!url) return <div className="h-20 w-20 shrink-0 rounded-xl bg-muted" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
  );
}
