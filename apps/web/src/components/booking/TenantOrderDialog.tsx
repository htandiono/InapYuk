'use client';

import { useEffect, useState } from 'react';
import type { BookingDetailDto } from '@inapyuk/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateRange, formatRupiah } from '@/lib/format';
import { ApiError } from '@/lib/api-client';
import { bookingGet } from './booking-api';
import { StatusBadge } from './StatusBadge';
import { TenantOrderActions } from './TenantOrderActions';

export function TenantOrderDialog({
  orderNumber,
  onClose,
  onDone,
}: {
  orderNumber: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [booking, setBooking] = useState<BookingDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadOrder(orderNumber, setBooking, setError);
  }, [orderNumber]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{orderNumber}</DialogTitle>
          <DialogDescription>Cek bukti transfer, terima, tolak, atau batalkan.</DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {booking ? (
          <OrderBody booking={booking} onDone={onDone} setError={setError} />
        ) : (
          <p className="text-sm text-muted-foreground">Memuat pesanan...</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OrderBody({
  booking,
  onDone,
  setError,
}: {
  booking: BookingDetailDto;
  onDone: () => void;
  setError: (message: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      <StatusBadge status={booking.status} />
      <p className="font-medium">{booking.propertyName}</p>
      <p className="text-sm text-muted-foreground">
        {booking.guest.name} · {booking.guest.email}
      </p>
      <p className="text-sm text-muted-foreground">
        {formatDateRange(booking.checkIn, booking.checkOut)} · {formatRupiah(booking.totalPrice)}
      </p>
      {booking.paymentProofUrl ? <ProofPreview url={booking.paymentProofUrl} /> : null}
      <TenantOrderActions booking={booking} onDone={onDone} setError={setError} />
    </div>
  );
}

function ProofPreview({ url }: { url: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Bukti transfer</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Bukti transfer" className="max-h-64 w-full rounded-xl bg-muted object-contain" />
    </div>
  );
}

async function loadOrder(
  orderNumber: string,
  setBooking: (booking: BookingDetailDto) => void,
  setError: (message: string | null) => void,
) {
  try {
    setBooking(await bookingGet<BookingDetailDto>(`/bookings/${orderNumber}`));
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memuat pesanan');
  }
}
