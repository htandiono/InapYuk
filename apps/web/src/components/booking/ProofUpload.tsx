'use client';

import { useState } from 'react';
import type { BookingDetailDto } from '@inapyuk/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api-client';
import { bookingUpload } from './booking-api';

const MAX_BYTES = 1024 * 1024;

type UploadProps = { orderNumber: string; onDone: (booking: BookingDetailDto) => void };
type FieldProps = { busy: boolean; error: string | null; onPick: (file: File | undefined) => void };
type SetBusy = (value: boolean) => void;
type SetError = (message: string | null) => void;

export function ProofUpload({ orderNumber, onDone }: UploadProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onPick = (file: File | undefined) => void pickFile(file, orderNumber, setBusy, setError, onDone);
  return <ProofField busy={busy} error={error} onPick={onPick} />;
}

function ProofField({ busy, error, onPick }: FieldProps) {
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
      <Label htmlFor="proof">Unggah bukti transfer</Label>
      <ProofInput busy={busy} onPick={onPick} />
      <p className="text-xs text-muted-foreground">.jpg atau .png, paling besar 1MB.</p>
      <ProofStatus busy={busy} error={error} />
    </div>
  );
}

function ProofInput({ busy, onPick }: { busy: boolean; onPick: FieldProps['onPick'] }) {
  return (
    <Input
      id="proof"
      type="file"
      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
      disabled={busy}
      onChange={(event) => onPick(event.target.files?.[0])}
    />
  );
}

function ProofStatus({ busy, error }: { busy: boolean; error: string | null }) {
  return (
    <>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {busy ? <p className="text-xs text-muted-foreground">Mengunggah...</p> : null}
    </>
  );
}

// Reject a wrong file on the phone so the server never sees a huge PDF.
function validateProof(file: File): string | null {
  const name = file.name.toLowerCase();
  const okName = name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png');
  const okType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === '';
  if (!okName || !okType) return 'Cuma file .jpg atau .png yang diterima';
  if (file.size > MAX_BYTES) return 'Ukurannya kebesaran. Max 1MB ya';
  return null;
}

async function pickFile(file: File | undefined, orderNumber: string, setBusy: SetBusy, setError: SetError, onDone: UploadProps['onDone']) {
  if (!file) return;
  const problem = validateProof(file);
  if (problem) return setError(problem);
  await sendProof(file, orderNumber, setBusy, setError, onDone);
}

async function sendProof(file: File, orderNumber: string, setBusy: SetBusy, setError: SetError, onDone: UploadProps['onDone']) {
  setBusy(true);
  try {
    setError(null);
    onDone(await bookingUpload<BookingDetailDto>(`/bookings/${orderNumber}/payment-proof`, file));
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal mengunggah bukti');
  } finally {
    setBusy(false);
  }
}
