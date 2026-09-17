'use client';

import { useEffect, useState } from 'react';
import type { ReviewDto, ReviewListResponse } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { NeedTenantLogin } from './AuthGate';
import { bookingGet, bookingPost, withQuery } from './booking-api';
import { OrderPager } from './OrderPager';
import { useSession } from './session';

export function TenantReviewsView() {
  const session = useSession();
  const [waiting, setWaiting] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    void loadReviews(waiting, page, setData, setError);
  }, [session, waiting, page]);

  if (!session) return <NeedTenantLogin />;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto">
        <Button
          type="button"
          size="sm"
          variant={waiting ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => {
            setWaiting(true);
            setPage(1);
          }}
        >
          Belum dibalas
        </Button>
        <Button
          type="button"
          size="sm"
          variant={waiting ? 'outline' : 'default'}
          className="rounded-full"
          onClick={() => {
            setWaiting(false);
            setPage(1);
          }}
        >
          Semua
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <TenantReviewList
        items={data?.items ?? null}
        onReplied={(review) =>
          setData((current) =>
            current
              ? { ...current, items: current.items.map((item) => (item.id === review.id ? review : item)) }
              : current,
          )
        }
      />
      {data ? <OrderPager meta={data.meta} onPage={setPage} /> : null}
    </div>
  );
}

function TenantReviewList({
  items,
  onReplied,
}: {
  items: ReviewDto[] | null;
  onReplied: (review: ReviewDto) => void;
}) {
  if (items === null) return <p className="text-sm text-muted-foreground">Memuat ulasan...</p>;
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Tidak ada ulasan di filter ini.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
          <p className="font-medium">
            {item.author.name} · {'★'.repeat(item.rating)}
          </p>
          <p className="mt-2 text-sm">{item.comment}</p>
          {item.reply ? (
            <p className="mt-3 text-sm text-muted-foreground">Balasan: {item.reply.comment}</p>
          ) : (
            <ReplyBox reviewId={item.id} onReplied={onReplied} />
          )}
        </li>
      ))}
    </ul>
  );
}

function ReplyBox({
  reviewId,
  onReplied,
}: {
  reviewId: string;
  onReplied: (review: ReviewDto) => void;
}) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        void sendReply(reviewId, comment, setError, onReplied);
      }}
    >
      <textarea
        required
        minLength={10}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Balas ulasan tamu..."
        className="min-h-20 w-full rounded-lg border border-input bg-transparent p-2 text-sm"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="sm" className="rounded-full">
        Kirim balasan
      </Button>
    </form>
  );
}

async function loadReviews(
  waiting: boolean,
  page: number,
  setData: (data: ReviewListResponse) => void,
  setError: (message: string | null) => void,
) {
  try {
    setError(null);
    setData(
      await bookingGet<ReviewListResponse>(
        withQuery('/tenant/reviews', { page, hasReply: waiting ? 'false' : undefined }),
      ),
    );
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memuat ulasan');
  }
}

async function sendReply(
  reviewId: string,
  comment: string,
  setError: (message: string | null) => void,
  onReplied: (review: ReviewDto) => void,
) {
  try {
    setError(null);
    onReplied(await bookingPost<ReviewDto>(`/tenant/reviews/${reviewId}/reply`, { comment }));
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal kirim balasan');
  }
}
