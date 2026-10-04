'use client';

import { useEffect, useState } from 'react';
import type { ReviewDto, ReviewListResponse, ReviewReplyDto } from '@inapyuk/types';
import { ApiError } from '@/lib/api-client';
import { bookingGet, withQuery } from './booking-api';
import { OrderPager } from './OrderPager';

type ErrorSetter = (message: string | null) => void;
type LoadArgs = { propertyId: string; page: number; setData: (data: ReviewListResponse) => void; setError: ErrorSetter };
type SectionProps = { data: ReviewListResponse | null; error: string | null; onPage: (page: number) => void };

export function PropertyReviews({ propertyId }: { propertyId: string }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void loadReviews({ propertyId, page, setData, setError });
  }, [propertyId, page]);
  return <ReviewSection data={data} error={error} onPage={setPage} />;
}

function ReviewSection({ data, error, onPage }: SectionProps) {
  return (
    <section className="mt-12 space-y-4">
      <ReviewHeader data={data} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ReviewList items={data?.items ?? null} />
      {data ? <OrderPager meta={data.meta} onPage={onPage} /> : null}
    </section>
  );
}

function ReviewHeader({ data }: { data: ReviewListResponse | null }) {
  return (
    <header>
      <h2 className="font-heading text-2xl text-primary">Ulasan tamu</h2>
      <Summary data={data} />
    </header>
  );
}

function Summary({ data }: { data: ReviewListResponse | null }) {
  if (!data) return <p className="text-sm text-muted-foreground">Memuat ulasan...</p>;
  if (data.reviewCount === 0) return <p className="text-sm text-muted-foreground">Belum ada ulasan.</p>;
  return <p className="text-sm text-muted-foreground">{data.averageRating.toFixed(1)} / 5 dari {data.reviewCount} ulasan</p>;
}

function ReviewList({ items }: { items: ReviewDto[] | null }) {
  if (!items) return null;
  if (items.length === 0) return <EmptyReviews />;
  return <ul className="space-y-3">{items.map((item) => <GuestReview key={item.id} item={item} />)}</ul>;
}

function EmptyReviews() {
  return (
    <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      Belum ada yang nulis ulasan di sini. Kamu bisa jadi yang pertama setelah menginap.
    </p>
  );
}

function GuestReview({ item }: { item: ReviewDto }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <p className="font-medium">{item.author.name} · {'★'.repeat(item.rating)}</p>
      <p className="mt-2 text-sm">{item.comment}</p>
      <TenantReply reply={item.reply} />
    </li>
  );
}

function TenantReply({ reply }: { reply: ReviewReplyDto | null }) {
  if (!reply) return null;
  return (
    <p className="mt-3 rounded-xl bg-muted p-3 text-sm">
      <span className="font-medium">{reply.tenantName}: </span>
      {reply.comment}
    </p>
  );
}

async function loadReviews(args: LoadArgs) {
  try {
    args.setError(null);
    args.setData(await fetchPropertyReviews(args.propertyId, args.page));
  } catch (error) {
    args.setError(error instanceof ApiError ? error.message : 'Gagal memuat ulasan');
  }
}

function fetchPropertyReviews(propertyId: string, page: number) {
  return bookingGet<ReviewListResponse>(withQuery(`/properties/${propertyId}/reviews`, { page, limit: 5 }));
}
