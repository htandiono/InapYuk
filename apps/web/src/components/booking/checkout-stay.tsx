'use client';

import Link from 'next/link';
import type { BookingQuoteResponse } from '@inapyuk/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRupiah } from '@/lib/format';
import { NightBreakdown } from './NightBreakdown';

export interface Stay {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

type StayProps = { stay: Stay; onChange: (stay: Stay) => void };
type DateProps = { label: string; value: string; onChange: (value: string) => void };
type GateProps = { title: string; body: string; href: string; action: string };

export function StayFields({ stay, onChange }: StayProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <DateField label="Check-in" value={stay.checkIn} onChange={(checkIn) => onChange({ ...stay, checkIn })} />
      <DateField label="Check-out" value={stay.checkOut} onChange={(checkOut) => onChange({ ...stay, checkOut })} />
      <GuestCount stay={stay} onChange={onChange} />
    </div>
  );
}

function GuestCount({ stay, onChange }: StayProps) {
  const setGuests = (raw: string) => onChange({ ...stay, guestCount: Number(raw) || 1 });
  return (
    <div className="space-y-2">
      <Label htmlFor="guests">Jumlah tamu</Label>
      <Input id="guests" type="number" min={1} value={stay.guestCount} onChange={(event) => setGuests(event.target.value)} />
    </div>
  );
}

function DateField({ label, value, onChange }: DateProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

export function QuoteCard({ quote }: { quote: BookingQuoteResponse }) {
  if (!quote.isAvailable) return <UnavailableQuote />;
  return (
    <div className="space-y-3">
      <NightBreakdown nights={quote.nights} />
      <p className="text-right font-heading text-xl text-primary">{formatRupiah(quote.totalPrice)}</p>
    </div>
  );
}

function UnavailableQuote() {
  return (
    <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
      Tanggal itu sudah penuh. Coba geser check-in atau check-out.
    </p>
  );
}

export function NeedLogin() {
  return (
    <Gate
      title="Masuk dulu ya"
      body="Checkout butuh akun tamu yang sudah login."
      href="/login"
      action="Masuk"
    />
  );
}

export function NeedVerify() {
  return (
    <Gate
      title="Email kamu belum diverifikasi"
      body="Kita belum bisa bikin pesanan sebelum emailnya dikonfirmasi."
      href="/resend-verification"
      action="Kirim ulang email"
    />
  );
}

function Gate({ title, body, href, action }: GateProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-heading text-xl text-primary">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <GateLink href={href} action={action} />
    </div>
  );
}

function GateLink({ href, action }: { href: string; action: string }) {
  return (
    <Link
      href={href}
      className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
    >
      {action}
    </Link>
  );
}
