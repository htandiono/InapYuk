'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { ReviewDto, ReviewListResponse } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { NeedTenantLogin } from './AuthGate';
import { bookingGet, withQuery } from './booking-api';
import { OrderPager } from './OrderPager';
import { TenantReviewList } from './tenant-review-list';
import { useSession } from './session';

type Session = ReturnType<typeof useSession>;
type ReviewSetter = Dispatch<SetStateAction<ReviewListResponse | null>>;
type ErrorSetter = (message: string | null) => void;

type ReviewBag = {
  waiting: boolean;
  setWaiting: (value: boolean) => void;
  page: number;
  setPage: (page: number) => void;
  data: ReviewListResponse | null;
  setData: ReviewSetter;
  error: string | null;
};

type LoadArgs = { waiting: boolean; page: number; setData: (data: ReviewListResponse) => void; setError: ErrorSetter };

export function TenantReviewsView() {
  const session = useSession();
  const bag = useTenantReviews(session);
  if (!session) return <NeedTenantLogin />;
  return <ReviewScreen bag={bag} />;
}

function useTenantReviews(session: Session): ReviewBag {
  const [waiting, setWaiting] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!session) return;
    void loadReviews({ waiting, page, setData, setError });
  }, [session, waiting, page]);
  return { waiting, setWaiting, page, setPage, data, setData, error };
}

function ReviewScreen({ bag }: { bag: ReviewBag }) {
  return (
    <div className="space-y-6">
      <WaitingTabs waiting={bag.waiting} onPick={pickWaiting(bag)} />
      {bag.error ? <p className="text-sm text-destructive">{bag.error}</p> : null}
      <TenantReviewList items={bag.data?.items ?? null} onReplied={replyHandler(bag.setData)} />
      {bag.data ? <OrderPager meta={bag.data.meta} onPage={bag.setPage} /> : null}
    </div>
  );
}

function pickWaiting(bag: ReviewBag) {
  return (waiting: boolean) => {
    bag.setWaiting(waiting);
    bag.setPage(1);
  };
}

function replyHandler(setData: ReviewSetter) {
  return (review: ReviewDto) => setData((current) => mergeReply(current, review));
}

function mergeReply(current: ReviewListResponse | null, review: ReviewDto) {
  if (!current) return current;
  return { ...current, items: current.items.map((item) => (item.id === review.id ? review : item)) };
}

function WaitingTabs({ waiting, onPick }: { waiting: boolean; onPick: (waiting: boolean) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      <WaitButton label="Belum dibalas" active={waiting} onClick={() => onPick(true)} />
      <WaitButton label="Semua" active={!waiting} onClick={() => onPick(false)} />
    </div>
  );
}

function WaitButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button type="button" size="sm" variant={active ? 'default' : 'outline'} className="rounded-full" onClick={onClick}>
      {label}
    </Button>
  );
}

async function loadReviews(args: LoadArgs) {
  try {
    args.setError(null);
    args.setData(await fetchTenantReviews(args.waiting, args.page));
  } catch (error) {
    args.setError(error instanceof ApiError ? error.message : 'Gagal memuat ulasan');
  }
}

function fetchTenantReviews(waiting: boolean, page: number) {
  const hasReply = waiting ? 'false' : undefined;
  return bookingGet<ReviewListResponse>(withQuery('/tenant/reviews', { page, hasReply }));
}
