'use client';

import { useEffect, useState } from 'react';
import type { BookingDetailDto } from '@inapyuk/types';
import { formatDateRange, formatRupiah } from '@/lib/format';
import { ApiError } from '@/lib/api-client';
import { NeedLogin } from './AuthGate';
import { bookingGet } from './booking-api';
import { CancelOrderDialog } from './CancelOrderDialog';
import { NightBreakdown } from './NightBreakdown';
import { PaymentCountdown } from './PaymentCountdown';
import { ProofUpload } from './ProofUpload';
import { StatusBadge } from './StatusBadge';
import { useSession } from './session';

export function OrderDetailView({ orderNumber }: { orderNumber: string }) {
  const session = useSession();
  const [booking, setBooking] = useState<BookingDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    void loadDetail(orderNumber, setBooking, setError);
  }, [session, orderNumber]);

  return (
    <DetailBody session={session} booking={booking} error={error} onDone={setBooking} />
  );
}

function DetailBody({
  session,
  booking,
  error,
  onDone,
}: {
  session: ReturnType<typeof useSession>;
  booking: BookingDetailDto | null;
  error: string | null;
  onDone: (booking: BookingDetailDto) => void;
}) {
  if (!session) return <NeedLogin />;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!booking) return <p className="text-sm text-muted-foreground">Memuat pesanan...</p>;
  return <DetailCard booking={booking} onDone={onDone} />;
}

function DetailCard({
  booking,
  onDone,
}: {
  booking: BookingDetailDto;
  onDone: (booking: BookingDetailDto) => void;
}) {
  return (
    <div className="mt-8 space-y-6">
      <Summary booking={booking} />
      {booking.status === 'WAITING_PAYMENT' && booking.paymentDeadline ? (
        <PaymentCountdown deadline={booking.paymentDeadline} />
      ) : null}
      <NightBreakdown nights={booking.nightBreakdown} />
      <p className="text-right font-heading text-xl text-primary">{formatRupiah(booking.totalPrice)}</p>
      <Actions booking={booking} onDone={onDone} />
    </div>
  );
}

function Summary({ booking }: { booking: BookingDetailDto }) {
  return (
    <header className="space-y-2">
      <StatusBadge status={booking.status} />
      <h2 className="font-heading text-2xl text-primary">{booking.propertyName}</h2>
      <p className="text-sm text-muted-foreground">
        {booking.roomName} · {booking.guestCount} tamu
      </p>
      <p className="text-sm text-muted-foreground">
        {formatDateRange(booking.checkIn, booking.checkOut)}
      </p>
    </header>
  );
}

function Actions({
  booking,
  onDone,
}: {
  booking: BookingDetailDto;
  onDone: (booking: BookingDetailDto) => void;
}) {
  return (
    <div className="space-y-4">
      {booking.canUploadPaymentProof ? (
        <ProofUpload orderNumber={booking.orderNumber} onDone={onDone} />
      ) : null}
      {booking.paymentProofUrl ? <ProofPreview url={booking.paymentProofUrl} /> : null}
      {booking.canBeCancelled ? (
        <CancelOrderDialog orderNumber={booking.orderNumber} onDone={onDone} />
      ) : null}
    </div>
  );
}

function ProofPreview({ url }: { url: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Bukti transfer yang sudah masuk</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Bukti transfer" className="max-h-64 w-full rounded-xl object-contain bg-muted" />
    </div>
  );
}

async function loadDetail(
  orderNumber: string,
  setBooking: (booking: BookingDetailDto) => void,
  setError: (message: string | null) => void,
) {
  try {
    setError(null);
    setBooking(await bookingGet<BookingDetailDto>(`/bookings/${orderNumber}`));
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memuat pesanan');
  }
}
