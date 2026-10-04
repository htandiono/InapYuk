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

type DialogProps = { orderNumber: string; onDone: (booking: BookingDetailDto) => void };
type BodyProps = { error: string | null; busy: boolean; onClose: () => void; onConfirm: () => void };
type FooterProps = { busy: boolean; onClose: () => void; onConfirm: () => void };
type SetBusy = (value: boolean) => void;
type SetErr = (message: string | null) => void;
type SetOpen = (value: boolean) => void;

export function CancelOrderDialog({ orderNumber, onDone }: DialogProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirm = () => void confirmCancel(orderNumber, setBusy, setError, setOpen, onDone);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CancelButton onOpen={() => setOpen(true)} />
      <ConfirmBody error={error} busy={busy} onClose={() => setOpen(false)} onConfirm={confirm} />
    </Dialog>
  );
}

function CancelButton({ onOpen }: { onOpen: () => void }) {
  return (
    <Button type="button" variant="destructive" className="w-full rounded-full" onClick={onOpen}>
      Batalkan pesanan
    </Button>
  );
}

function ConfirmBody({ error, busy, onClose, onConfirm }: BodyProps) {
  return (
    <DialogContent>
      <ConfirmHeader />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ConfirmFooter busy={busy} onClose={onClose} onConfirm={onConfirm} />
    </DialogContent>
  );
}

function ConfirmHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Yakin batalin pesanan ini?</DialogTitle>
      <DialogDescription>
        Kamarnya dilepas lagi. Ini cuma bisa selama bukti transfer belum diunggah.
      </DialogDescription>
    </DialogHeader>
  );
}

function ConfirmFooter({ busy, onClose, onConfirm }: FooterProps) {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" disabled={busy} onClick={onClose}>Tidak jadi</Button>
      <ConfirmYes busy={busy} onConfirm={onConfirm} />
    </DialogFooter>
  );
}

function ConfirmYes({ busy, onConfirm }: { busy: boolean; onConfirm: () => void }) {
  return (
    <Button type="button" variant="destructive" disabled={busy} onClick={onConfirm}>
      {busy ? 'Membatalkan...' : 'Ya, batalkan'}
    </Button>
  );
}

async function confirmCancel(orderId: string, setBusy: SetBusy, setErr: SetErr, setOpen: SetOpen, onDone: DialogProps['onDone']) {
  setBusy(true);
  try {
    setErr(null);
    onDone(await bookingPatch<BookingDetailDto>(`/bookings/${orderId}/cancel`, {}));
    setOpen(false);
  } catch (error) {
    setErr(error instanceof ApiError ? error.message : 'Gagal membatalkan pesanan');
  } finally {
    setBusy(false);
  }
}
