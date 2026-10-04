'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BookingDetailDto, BookingQuoteResponse } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { bookingPost } from './booking-api';
import { NeedLogin, NeedVerify, QuoteCard, StayFields, type Stay } from './checkout-stay';
import { useSession } from './session';

type SetQuote = (quote: BookingQuoteResponse | null) => void;
type SetError = (message: string | null) => void;
type SetBusy = (value: boolean) => void;
type AppRouter = ReturnType<typeof useRouter>;

type CheckoutBag = {
  stay: Stay;
  setStay: (stay: Stay) => void;
  quote: BookingQuoteResponse | null;
  error: string | null;
  busy: boolean;
  setBusy: SetBusy;
  setError: SetError;
};

export function CheckoutForm({ initialStay }: { initialStay: Stay }) {
  const router = useRouter();
  const session = useSession();
  const form = useCheckout(initialStay);
  if (!session) return <NeedLogin />;
  if (!session.isVerified) return <NeedVerify />;
  return <CheckoutFields form={form} router={router} />;
}

function useCheckout(initialStay: Stay): CheckoutBag {
  const [stay, setStay] = useState(initialStay);
  const [quote, setQuote] = useState<BookingQuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void refreshQuote(stay, setQuote, setError);
  }, [stay]);
  return { stay, setStay, quote, error, busy, setBusy, setError };
}

function CheckoutFields({ form, router }: { form: CheckoutBag; router: AppRouter }) {
  const submit = (event: React.FormEvent) => void onSubmit(event, form.stay, form.setBusy, form.setError, router);
  return (
    <form className="space-y-6" onSubmit={submit}>
      <StayFields stay={form.stay} onChange={form.setStay} />
      {form.error && <p className="text-sm text-destructive">{form.error}</p>}
      <QuoteSlot quote={form.quote} />
      <SubmitButton busy={form.busy} quote={form.quote} />
    </form>
  );
}

function QuoteSlot({ quote }: { quote: BookingQuoteResponse | null }) {
  if (quote) return <QuoteCard quote={quote} />;
  return <p className="text-sm text-muted-foreground">Menghitung harga...</p>;
}

function SubmitButton({ busy, quote }: { busy: boolean; quote: BookingQuoteResponse | null }) {
  return (
    <Button type="submit" className="w-full rounded-full" disabled={busy || !quote?.isAvailable} size="lg">
      {busy ? 'Memproses...' : 'Konfirmasi pesanan'}
    </Button>
  );
}

async function refreshQuote(stay: Stay, setQuote: SetQuote, setError: SetError) {
  if (stay.checkOut <= stay.checkIn) return rejectStay(setQuote, setError);
  try {
    setError(null);
    setQuote(await bookingPost<BookingQuoteResponse>('/bookings/quote', stay));
  } catch (error) {
    setQuote(null);
    setError(error instanceof ApiError ? error.message : 'Gagal menghitung harga');
  }
}

function rejectStay(setQuote: SetQuote, setError: SetError) {
  setError('Check-out harus setelah check-in');
  setQuote(null);
}

async function onSubmit(event: React.FormEvent, stay: Stay, setBusy: SetBusy, setError: SetError, router: AppRouter) {
  event.preventDefault();
  setBusy(true);
  try {
    router.push(`/orders/${(await createBooking(stay)).orderNumber}`);
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal membuat pesanan');
    setBusy(false);
  }
}

function createBooking(stay: Stay) {
  return bookingPost<BookingDetailDto>('/bookings', { ...stay, paymentMethod: 'MANUAL_TRANSFER' });
}
