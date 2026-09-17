'use client';

import { useState } from 'react';
import type { BookingDetailDto } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { ApiError } from '@/lib/api-client';
import { bookingPatch } from './booking-api';

export function TenantOrderActions({
  booking,
  onDone,
  setError,
}: {
  booking: BookingDetailDto;
  onDone: () => void;
  setError: (message: string | null) => void;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  return (
    <DialogFooter className="flex-col gap-2 sm:flex-col">
      {booking.canConfirmPayment ? (
        <Button
          type="button"
          className="w-full rounded-full"
          onClick={() => void decide(booking.orderNumber, { accept: true }, onDone, setError)}
        >
          Terima pembayaran
        </Button>
      ) : null}
      {booking.canConfirmPayment ? (
        <RejectBox
          open={rejectOpen}
          setOpen={setRejectOpen}
          orderNumber={booking.orderNumber}
          onDone={onDone}
          setError={setError}
        />
      ) : null}
      {booking.canBeCancelled ? (
        <Button
          type="button"
          variant="destructive"
          className="w-full rounded-full"
          onClick={() => void cancelOrder(booking.orderNumber, onDone, setError)}
        >
          Batalkan pesanan
        </Button>
      ) : null}
    </DialogFooter>
  );
}

function RejectBox({
  open,
  setOpen,
  orderNumber,
  onDone,
  setError,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderNumber: string;
  onDone: () => void;
  setError: (message: string | null) => void;
}) {
  const [reason, setReason] = useState('');
  if (!open) {
    return (
      <Button type="button" variant="outline" className="w-full rounded-full" onClick={() => setOpen(true)}>
        Tolak bukti
      </Button>
    );
  }
  return (
    <div className="w-full space-y-2">
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Alasan penolakan, biar tamunya tahu"
        className="min-h-20 w-full rounded-lg border border-input bg-transparent p-2 text-sm"
      />
      <Button
        type="button"
        variant="destructive"
        className="w-full rounded-full"
        onClick={() => void decide(orderNumber, { accept: false, rejectionReason: reason }, onDone, setError)}
      >
        Kirim penolakan
      </Button>
    </div>
  );
}

async function decide(
  orderNumber: string,
  body: { accept: boolean; rejectionReason?: string },
  onDone: () => void,
  setError: (message: string | null) => void,
) {
  try {
    setError(null);
    await bookingPatch(`/tenant/bookings/${orderNumber}/confirm`, body);
    onDone();
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memproses bukti');
  }
}

async function cancelOrder(
  orderNumber: string,
  onDone: () => void,
  setError: (message: string | null) => void,
) {
  try {
    setError(null);
    await bookingPatch(`/tenant/bookings/${orderNumber}/cancel`, {});
    onDone();
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal membatalkan pesanan');
  }
}
