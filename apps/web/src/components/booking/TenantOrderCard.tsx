import type { TenantBookingListItemDto } from '@inapyuk/types';
import { formatDateRange, formatRupiah } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

type CardProps = { item: TenantBookingListItemDto; onOpen: () => void };

export function TenantOrderCard({ item, onOpen }: CardProps) {
  return (
    <button type="button" onClick={onOpen} className="flex w-full gap-3 rounded-2xl border border-border bg-card p-3 text-left">
      <Cover url={item.coverImageUrl} />
      <CardBody item={item} />
    </button>
  );
}

function CardBody({ item }: { item: TenantBookingListItemDto }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate font-medium">{item.propertyName}</p>
      <GuestLine item={item} />
      <DateLine item={item} />
      <PriceRow item={item} />
      <AwaitingNote item={item} />
    </div>
  );
}

function GuestLine({ item }: { item: TenantBookingListItemDto }) {
  return <p className="text-xs text-muted-foreground">{item.guestName} · {item.orderNumber}</p>;
}

function DateLine({ item }: { item: TenantBookingListItemDto }) {
  return <p className="text-xs text-muted-foreground">{formatDateRange(item.checkIn, item.checkOut)}</p>;
}

function PriceRow({ item }: { item: TenantBookingListItemDto }) {
  return (
    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
      <StatusBadge status={item.status} />
      <span className="text-sm font-medium">{formatRupiah(item.totalPrice)}</span>
    </div>
  );
}

function AwaitingNote({ item }: { item: TenantBookingListItemDto }) {
  if (!item.awaitingConfirmation) return null;
  return <p className="mt-1 text-xs text-accent">Menunggu keputusan bukti transfer</p>;
}

function Cover({ url }: { url: string | null }) {
  if (!url) return <div className="h-20 w-20 shrink-0 rounded-xl bg-muted" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
  );
}
