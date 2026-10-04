'use client';

import { useState } from 'react';
import type { BookingDetailDto } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { ApiError } from '@/lib/api-client';
import { bookingPatch } from './booking-api';

type ActionProps = {
  booking: BookingDetailDto;
  onDone: () => void;
  setError: (message: string | null) => void;
};

type RejectProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderNumber: string;
  onDone: () => void;
  setError: (message: string | null) => void;
};

type ReasonProps = { reason: string; setReason: (reason: string) => void };
type DecideBody = { accept: boolean; rejectionReason?: string };

export function TenantOrderActions({ booking, onDone, setError }: ActionProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  return (
    <DialogFooter className="flex-col gap-2 sm:flex-col">
      <AcceptButton booking={booking} onDone={onDone} setError={setError} />
      <RejectSlot booking={booking} open={rejectOpen} setOpen={setRejectOpen} onDone={onDone} setError={setError} />
      <CancelButton booking={booking} onDone={onDone} setError={setError} />
    </DialogFooter>
  );
}

function AcceptButton({ booking, onDone, setError }: ActionProps) {
  if (!booking.canConfirmPayment) return null;
  const accept = () => void decide(booking.orderNumber, { accept: true }, onDone, setError);
  return (
    <Button type="button" className="w-full rounded-full" onClick={accept}>
      Terima pembayaran
    </Button>
  );
}

function CancelButton({ booking, onDone, setError }: ActionProps) {
  if (!booking.canBeCancelled) return null;
  const cancel = () => void cancelOrder(booking.orderNumber, onDone, setError);
  return (
    <Button type="button" variant="destructive" className="w-full rounded-full" onClick={cancel}>
      Batalkan pesanan
    </Button>
  );
}

function RejectSlot({ booking, open, setOpen, onDone, setError }: ActionProps & { open: boolean; setOpen: (open: boolean) => void }) {
  if (!booking.canConfirmPayment) return null;
  return <RejectBox open={open} setOpen={setOpen} orderNumber={booking.orderNumber} onDone={onDone} setError={setError} />;
}

function RejectBox({ open, setOpen, orderNumber, onDone, setError }: RejectProps) {
  const [reason, setReason] = useState('');
  if (!open) return <OpenReject onOpen={() => setOpen(true)} />;
  return <RejectForm reason={reason} setReason={setReason} orderNumber={orderNumber} onDone={onDone} setError={setError} />;
}

function OpenReject({ onOpen }: { onOpen: () => void }) {
  return (
    <Button type="button" variant="outline" className="w-full rounded-full" onClick={onOpen}>
      Tolak bukti
    </Button>
  );
}

function RejectForm({ reason, setReason, orderNumber, onDone, setError }: ReasonProps & Omit<RejectProps, 'open' | 'setOpen' | 'reason'>) {
  const send = () => void decide(orderNumber, { accept: false, rejectionReason: reason }, onDone, setError);
  return (
    <div className="w-full space-y-2">
      <RejectReason reason={reason} setReason={setReason} />
      <Button type="button" variant="destructive" className="w-full rounded-full" onClick={send}>
        Kirim penolakan
      </Button>
    </div>
  );
}

function RejectReason({ reason, setReason }: ReasonProps) {
  return (
    <textarea
      value={reason}
      onChange={(event) => setReason(event.target.value)}
      placeholder="Alasan penolakan, biar tamunya tahu"
      className="min-h-20 w-full rounded-lg border border-input bg-transparent p-2 text-sm"
    />
  );
}

async function decide(orderNumber: string, body: DecideBody, onDone: () => void, setError: (message: string | null) => void) {
  try {
    setError(null);
    await bookingPatch(`/tenant/bookings/${orderNumber}/confirm`, body);
    onDone();
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memproses bukti');
  }
}

async function cancelOrder(orderNumber: string, onDone: () => void, setError: (message: string | null) => void) {
  try {
    setError(null);
    await bookingPatch(`/tenant/bookings/${orderNumber}/cancel`, {});
    onDone();
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal membatalkan pesanan');
  }
}
