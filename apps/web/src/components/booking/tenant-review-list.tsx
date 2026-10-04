'use client';

import { useState, type FormEvent } from 'react';
import type { ReviewDto } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { bookingPost } from './booking-api';

type ListProps = { items: ReviewDto[] | null; onReplied: (review: ReviewDto) => void };
type ReplyProps = { reviewId: string; onReplied: (review: ReviewDto) => void };
type FormProps = { comment: string; error: string | null; onComment: (value: string) => void; onSubmit: () => void };

export function TenantReviewList({ items, onReplied }: ListProps) {
  if (items === null) return <p className="text-sm text-muted-foreground">Memuat ulasan...</p>;
  if (items.length === 0) return <EmptyReviews />;
  return (
    <ul className="space-y-3">
      {items.map((item) => <ReviewItem key={item.id} item={item} onReplied={onReplied} />)}
    </ul>
  );
}

function EmptyReviews() {
  return (
    <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      Tidak ada ulasan di filter ini.
    </p>
  );
}

function ReviewItem({ item, onReplied }: { item: ReviewDto; onReplied: ListProps['onReplied'] }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <p className="font-medium">{item.author.name} · {'★'.repeat(item.rating)}</p>
      <p className="mt-2 text-sm">{item.comment}</p>
      <ReviewReply item={item} onReplied={onReplied} />
    </li>
  );
}

function ReviewReply({ item, onReplied }: { item: ReviewDto; onReplied: ListProps['onReplied'] }) {
  if (item.reply) return <p className="mt-3 text-sm text-muted-foreground">Balasan: {item.reply.comment}</p>;
  return <ReplyBox reviewId={item.id} onReplied={onReplied} />;
}

function ReplyBox({ reviewId, onReplied }: ReplyProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const send = () => void sendReply(reviewId, comment, setError, onReplied);
  return <ReplyForm comment={comment} error={error} onComment={setComment} onSubmit={send} />;
}

function ReplyForm({ comment, error, onComment, onSubmit }: FormProps) {
  return (
    <form className="mt-3 space-y-2" onSubmit={submitReply(onSubmit)}>
      <ReplyArea comment={comment} onComment={onComment} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="sm" className="rounded-full">Kirim balasan</Button>
    </form>
  );
}

function submitReply(onSubmit: () => void) {
  return (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };
}

function ReplyArea({ comment, onComment }: { comment: string; onComment: (value: string) => void }) {
  return (
    <textarea
      required
      minLength={10}
      value={comment}
      onChange={(event) => onComment(event.target.value)}
      placeholder="Balas ulasan tamu..."
      className="min-h-20 w-full rounded-lg border border-input bg-transparent p-2 text-sm"
    />
  );
}

async function sendReply(reviewId: string, comment: string, setError: (message: string | null) => void, onReplied: (review: ReviewDto) => void) {
  try {
    setError(null);
    onReplied(await bookingPost<ReviewDto>(`/tenant/reviews/${reviewId}/reply`, { comment }));
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal kirim balasan');
  }
}
