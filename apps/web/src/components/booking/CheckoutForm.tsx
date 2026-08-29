'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BookingDetailDto, BookingQuoteResponse } from '@inapyuk/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRupiah } from '@/lib/format';
import { ApiError } from '@/lib/api-client';
import { bookingPost } from './booking-api';
import { NightBreakdown } from './NightBreakdown';
import { useSession } from './session';

interface Stay {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

export function CheckoutForm({ initialStay }: { initialStay: Stay }) {
  const router = useRouter();
  const session = useSession();
  const [stay, setStay] = useState(initialStay);
  const [quote, setQuote] = useState<BookingQuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshQuote(stay, setQuote, setError);
  }, [stay]);

  if (!session) return <NeedLogin />;
  if (!session.isVerified) return <NeedVerify />;

  return (
    <form className="space-y-6" onSubmit={(event) => void onSubmit(event, stay, setBusy, setError, router)}>
      <StayFields stay={stay} onChange={setStay} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {quote ? <QuoteCard quote={quote} /> : <p className="text-sm text-muted-foreground">Menghitung harga...</p>}
      <Button type="submit" className="w-full rounded-full" disabled={busy || !quote?.isAvailable} size="lg">
        {busy ? 'Memproses...' : 'Konfirmasi pesanan'}
      </Button>
    </form>
  );
}

function StayFields({ stay, onChange }: { stay: Stay; onChange: (stay: Stay) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <DateField label="Check-in" value={stay.checkIn} onChange={(checkIn) => onChange({ ...stay, checkIn })} />
      <DateField label="Check-out" value={stay.checkOut} onChange={(checkOut) => onChange({ ...stay, checkOut })} />
      <div className="space-y-2">
        <Label htmlFor="guests">Jumlah tamu</Label>
        <Input
          id="guests"
          type="number"
          min={1}
          value={stay.guestCount}
          onChange={(event) => onChange({ ...stay, guestCount: Number(event.target.value) || 1 })}
        />
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function QuoteCard({ quote }: { quote: BookingQuoteResponse }) {
  if (!quote.isAvailable) {
    return (
      <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
        Tanggal itu sudah penuh. Coba geser check-in atau check-out.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <NightBreakdown nights={quote.nights} />
      <p className="text-right font-heading text-xl text-primary">{formatRupiah(quote.totalPrice)}</p>
    </div>
  );
}

async function refreshQuote(
  stay: Stay,
  setQuote: (quote: BookingQuoteResponse | null) => void,
  setError: (message: string | null) => void,
) {
  if (stay.checkOut <= stay.checkIn) {
    setError('Check-out harus setelah check-in');
    setQuote(null);
    return;
  }
  try {
    setError(null);
    setQuote(await bookingPost<BookingQuoteResponse>('/bookings/quote', stay));
  } catch (error) {
    setQuote(null);
    setError(error instanceof ApiError ? error.message : 'Gagal menghitung harga');
  }
}

async function onSubmit(
  event: React.FormEvent,
  stay: Stay,
  setBusy: (value: boolean) => void,
  setError: (message: string | null) => void,
  router: ReturnType<typeof useRouter>,
) {
  event.preventDefault();
  setBusy(true);
  try {
    const booking = await bookingPost<BookingDetailDto>('/bookings', {
      ...stay,
      paymentMethod: 'MANUAL_TRANSFER',
    });
    router.push(`/orders/${booking.orderNumber}`);
  } catch (error) {
    setError(error instanceof ApiError ? error.message : 'Gagal membuat pesanan');
    setBusy(false);
  }
}

function NeedLogin() {
  return (
    <Gate
      title="Masuk dulu ya"
      body="Checkout butuh akun tamu yang sudah login."
      href="/login"
      action="Masuk"
    />
  );
}

function NeedVerify() {
  return (
    <Gate
      title="Email kamu belum diverifikasi"
      body="Kita belum bisa bikin pesanan sebelum emailnya dikonfirmasi."
      href="/resend-verification"
      action="Kirim ulang email"
    />
  );
}

function Gate({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-heading text-xl text-primary">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {action}
      </Link>
    </div>
  );
}
