import { BookingChrome } from '@/components/booking/BookingChrome';
import { CheckoutForm } from '@/components/booking/CheckoutForm';

interface Search {
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}

type PageProps = { searchParams: Promise<Search> };

type Stay = {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
};

export default async function CheckoutPage({ searchParams }: PageProps) {
  const stay = readStay(await searchParams);
  return (
    <BookingChrome>
      <CheckoutIntro />
      <CheckoutBody stay={stay} />
    </BookingChrome>
  );
}

function readStay(query: Search): Stay {
  return {
    roomId: query.roomId ?? '',
    checkIn: query.checkIn ?? '',
    checkOut: query.checkOut ?? '',
    guestCount: Number(query.guests) || 2,
  };
}

function CheckoutIntro() {
  return (
    <>
      <p className="text-sm text-accent">Satu langkah lagi</p>
      <h1 className="font-heading mt-2 text-2xl tracking-tight sm:text-3xl">Cek harga, baru deh pesan.</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Harga di bawah sudah termasuk naik-turun peak season, per malam.
      </p>
    </>
  );
}

function CheckoutBody({ stay }: { stay: Stay }) {
  if (stay.roomId && stay.checkIn && stay.checkOut) return <CheckoutForm initialStay={stay} />;
  return (
    <p className="text-sm text-muted-foreground">
      Pilih kamar dan tanggal dari halaman properti dulu, baru ke sini.
    </p>
  );
}
