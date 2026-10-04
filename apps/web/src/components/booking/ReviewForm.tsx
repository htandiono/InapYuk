'use client';

import { useState, type FormEvent } from 'react';
import type { BookingDetailDto, ReviewDto } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { bookingGet, bookingPost } from './booking-api';

type FormProps = { booking: BookingDetailDto; onDone: (booking: BookingDetailDto) => void };
type ReviewInput = { rating: number; comment: string };
type FlagSetter = (value: boolean) => void;
type ErrorSetter = (message: string | null) => void;
type Draft = {
  rating: number;
  setRating: (value: number) => void;
  comment: string;
  setComment: (value: string) => void;
  error: string | null;
  busy: boolean;
  setBusy: FlagSetter;
  setError: ErrorSetter;
};

export function ReviewForm({ booking, onDone }: FormProps) {
  const form = useReviewDraft();
  if (!booking.canBeReviewed) return <SavedHint booking={booking} />;
  return <ReviewFields booking={booking} form={form} onDone={onDone} />;
}

function useReviewDraft(): Draft {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return { rating, setRating, comment, setComment, error, busy, setBusy, setError };
}

function ReviewFields({ booking, form, onDone }: FormProps & { form: Draft }) {
  const send = (event: FormEvent) => submitDraft(event, booking, form, onDone);
  return (
    <form className="space-y-3 rounded-2xl border border-border bg-card p-4" onSubmit={send}>
      <h3 className="font-heading text-lg text-primary">Gimana menginapnya?</h3>
      <StarPicker value={form.rating} onChange={form.setRating} />
      <CommentBox value={form.comment} onChange={form.setComment} />
      {form.error ? <p className="text-sm text-destructive">{form.error}</p> : null}
      <SubmitButton busy={form.busy} />
    </form>
  );
}

function submitDraft(event: FormEvent, booking: BookingDetailDto, form: Draft, onDone: FormProps['onDone']) {
  event.preventDefault();
  const input = { rating: form.rating, comment: form.comment };
  void submitReview(booking, input, form.setBusy, form.setError, onDone);
}

function CommentBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <textarea
      required
      minLength={10}
      maxLength={1000}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Ceritain kamar, kebersihan, atau host-nya..."
      className="min-h-24 w-full rounded-lg border border-input bg-transparent p-2 text-sm"
    />
  );
}

function SubmitButton({ busy }: { busy: boolean }) {
  return (
    <Button type="submit" disabled={busy} className="rounded-full">
      {busy ? 'Mengirim...' : 'Kirim ulasan'}
    </Button>
  );
}

function SavedHint({ booking }: { booking: BookingDetailDto }) {
  if (booking.status !== 'COMPLETED') return null;
  return <p className="text-sm text-muted-foreground">Ulasan untuk pesanan ini sudah masuk.</p>;
}

function StarPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => <StarButton key={star} star={star} filled={star <= value} onPick={() => onChange(star)} />)}
    </div>
  );
}

function StarButton({ star, filled, onPick }: { star: number; filled: boolean; onPick: () => void }) {
  return (
    <button type="button" className="h-10 w-10 rounded-full text-lg" onClick={onPick} aria-label={`${star} bintang`}>
      {filled ? '★' : '☆'}
    </button>
  );
}

async function submitReview(booking: BookingDetailDto, input: ReviewInput, setBusy: FlagSetter, setError: ErrorSetter, onDone: FormProps['onDone']) {
  setBusy(true);
  try {
    setError(null);
    await bookingPost<ReviewDto>('/reviews', { bookingId: booking.id, ...input });
    onDone(await bookingGet<BookingDetailDto>(`/bookings/${booking.orderNumber}`));
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal kirim ulasan');
  } finally {
    setBusy(false);
  }
}
