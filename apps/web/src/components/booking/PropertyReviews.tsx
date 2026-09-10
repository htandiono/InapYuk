'use client';

import { useEffect, useState } from 'react';
import type { ReviewDto, ReviewListResponse } from '@inapyuk/types';
import { ApiError } from '@/lib/api-client';
import { bookingGet, withQuery } from './booking-api';
import { OrderPager } from './OrderPager';

export function PropertyReviews({ propertyId }: { propertyId: string }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadReviews(propertyId, page, setData, setError);
  }, [propertyId, page]);

  return (
    <section className="mt-12 space-y-4">
      <header>
        <h2 className="font-heading text-2xl text-primary">Ulasan tamu</h2>
        <Summary data={data} />
      </header>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ReviewList items={data?.items ?? null} />
      {data ? <OrderPager meta={data.meta} onPage={setPage} /> : null}
    </section>
  );
}

function Summary({ data }: { data: ReviewListResponse | null }) {
  if (!data) return <p className="text-sm text-muted-foreground">Memuat ulasan...</p>;
  if (data.reviewCount === 0) return <p className="text-sm text-muted-foreground">Belum ada ulasan.</p>;
  return (
    <p className="text-sm text-muted-foreground">
      {data.averageRating.toFixed(1)} / 5 dari {data.reviewCount} ulasan
    </p>
  );
}

function ReviewList({ items }: { items: ReviewDto[] | null }) {
  if (!items) return null;
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Belum ada yang nulis ulasan di sini. Kamu bisa jadi yang pertama setelah menginap.
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
            <p className="mt-3 rounded-xl bg-muted p-3 text-sm">
              <span className="font-medium">{item.reply.tenantName}: </span>
              {item.reply.comment}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

async function loadReviews(
  propertyId: string,
  page: number,
  setData: (data: ReviewListResponse) => void,
  setError: (message: string | null) => void,
) {
  try {
    setError(null);
    setData(
      await bookingGet<ReviewListResponse>(
        withQuery(`/properties/${propertyId}/reviews`, { page, limit: 5 }),
      ),
    );
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal memuat ulasan');
  }
}
