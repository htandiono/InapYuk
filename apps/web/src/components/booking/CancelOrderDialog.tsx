'use client';

import { useState } from 'react';
import type { BookingDetailDto } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApiError } from '@/lib/api-client';
import { bookingPatch } from './booking-api';

// Ask once more so a mis-tap does not cancel the stay.
export function CancelOrderDialog({
  orderNumber,
  onDone,
}: {
  orderNumber: string;
  onDone: (booking: BookingDetailDto) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant="destructive" className="w-full rounded-full" onClick={() => setOpen(true)}>
        Batalkan pesanan
      </Button>
      <ConfirmBody
        error={error}
        busy={busy}
        onClose={() => setOpen(false)}
        onConfirm={() => void confirmCancel(orderNumber, setBusy, setError, setOpen, onDone)}
      />
    </Dialog>
  );
}

function ConfirmBody({
  error,
  busy,
  onClose,
  onConfirm,
}: {
  error: string | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Yakin batalin pesanan ini?</DialogTitle>
        <DialogDescription>
          Kamarnya dilepas lagi. Ini cuma bisa selama bukti transfer belum diunggah.
        </DialogDescription>
      </DialogHeader>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DialogFooter>
        <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
          Tidak jadi
        </Button>
        <Button type="button" variant="destructive" disabled={busy} onClick={onConfirm}>
          {busy ? 'Membatalkan...' : 'Ya, batalkan'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

async function confirmCancel(
  orderNumber: string,
  setBusy: (value: boolean) => void,
  setError: (message: string | null) => void,
  setOpen: (value: boolean) => void,
  onDone: (booking: BookingDetailDto) => void,
) {
  setBusy(true);
  try {
    setError(null);
    onDone(await bookingPatch<BookingDetailDto>(`/bookings/${orderNumber}/cancel`, {}));
    setOpen(false);
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal membatalkan pesanan');
  } finally {
    setBusy(false);
  }
}
