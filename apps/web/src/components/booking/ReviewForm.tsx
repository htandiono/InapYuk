'use client';

import { useState } from 'react';
import type { BookingDetailDto, ReviewDto } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { bookingGet, bookingPost } from './booking-api';

export function ReviewForm({
  booking,
  onDone,
}: {
  booking: BookingDetailDto;
  onDone: (booking: BookingDetailDto) => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!booking.canBeReviewed) return <SavedHint booking={booking} />;

  return (
    <form
      className="space-y-3 rounded-2xl border border-border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submitReview(booking, { rating, comment }, setBusy, setError, onDone);
      }}
    >
      <h3 className="font-heading text-lg text-primary">Gimana menginapnya?</h3>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        required
        minLength={10}
        maxLength={1000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Ceritain kamar, kebersihan, atau host-nya..."
        className="min-h-24 w-full rounded-lg border border-input bg-transparent p-2 text-sm"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={busy} className="rounded-full">
        {busy ? 'Mengirim...' : 'Kirim ulasan'}
      </Button>
    </form>
  );
}

function SavedHint({ booking }: { booking: BookingDetailDto }) {
  if (booking.status !== 'COMPLETED') return null;
  return <p className="text-sm text-muted-foreground">Ulasan untuk pesanan ini sudah masuk.</p>;
}

function StarPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="h-10 w-10 rounded-full text-lg"
          onClick={() => onChange(star)}
          aria-label={`${star} bintang`}
        >
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

async function submitReview(
  booking: BookingDetailDto,
  input: { rating: number; comment: string },
  setBusy: (value: boolean) => void,
  setError: (message: string | null) => void,
  onDone: (booking: BookingDetailDto) => void,
) {
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
