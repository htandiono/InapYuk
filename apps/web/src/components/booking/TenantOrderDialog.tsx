'use client';

import { useEffect, useState } from 'react';
import type { BookingDetailDto } from '@inapyuk/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateRange, formatRupiah } from '@/lib/format';
import { ApiError } from '@/lib/api-client';
import { bookingGet } from './booking-api';
import { StatusBadge } from './StatusBadge';
import { TenantOrderActions } from './TenantOrderActions';

type DialogProps = { orderNumber: string; onClose: () => void; onDone: () => void };
type ErrorSetter = (message: string | null) => void;
type OrderState = { booking: BookingDetailDto | null; error: string | null; setError: ErrorSetter };
type SlotProps = { booking: BookingDetailDto; onDone: () => void; setError: ErrorSetter };

export function TenantOrderDialog({ orderNumber, onClose, onDone }: DialogProps) {
  const state = useOrderState(orderNumber);
  return <OrderDialog orderNumber={orderNumber} state={state} onClose={onClose} onDone={onDone} />;
}

function useOrderState(orderNumber: string): OrderState {
  const [booking, setBooking] = useState<BookingDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void loadOrder(orderNumber, setBooking, setError);
  }, [orderNumber]);
  return { booking, error, setError };
}

function OrderDialog({ orderNumber, state, onClose, onDone }: DialogProps & { state: OrderState }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <OrderHeader orderNumber={orderNumber} />
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <OrderSlot booking={state.booking} onDone={onDone} setError={state.setError} />
      </DialogContent>
    </Dialog>
  );
}

function OrderHeader({ orderNumber }: { orderNumber: string }) {
  return (
    <DialogHeader>
      <DialogTitle>{orderNumber}</DialogTitle>
      <DialogDescription>Cek bukti transfer, terima, tolak, atau batalkan.</DialogDescription>
    </DialogHeader>
  );
}

function OrderSlot({ booking, onDone, setError }: { booking: BookingDetailDto | null; onDone: () => void; setError: ErrorSetter }) {
  if (!booking) return <p className="text-sm text-muted-foreground">Memuat pesanan...</p>;
  return <OrderBody booking={booking} onDone={onDone} setError={setError} />;
}

function OrderBody({ booking, onDone, setError }: SlotProps) {
  return (
    <div className="space-y-4">
      <StatusBadge status={booking.status} />
      <p className="font-medium">{booking.propertyName}</p>
      <GuestLine booking={booking} />
      <StayLine booking={booking} />
      {booking.paymentProofUrl ? <ProofPreview url={booking.paymentProofUrl} /> : null}
      <TenantOrderActions booking={booking} onDone={onDone} setError={setError} />
    </div>
  );
}

function GuestLine({ booking }: { booking: BookingDetailDto }) {
  return <p className="text-sm text-muted-foreground">{booking.guest.name} · {booking.guest.email}</p>;
}

function StayLine({ booking }: { booking: BookingDetailDto }) {
  return (
    <p className="text-sm text-muted-foreground">
      {formatDateRange(booking.checkIn, booking.checkOut)} · {formatRupiah(booking.totalPrice)}
    </p>
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

async function loadOrder(orderNumber: string, setBooking: (booking: BookingDetailDto) => void, setError: ErrorSetter) {
  try {
    setBooking(await bookingGet<BookingDetailDto>(`/bookings/${orderNumber}`));
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memuat pesanan');
  }
}
