import { BookingChrome } from '@/components/booking/BookingChrome';
import { CheckoutForm } from '@/components/booking/CheckoutForm';

interface Search {
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = await searchParams;
  const stay = {
    roomId: query.roomId ?? '',
    checkIn: query.checkIn ?? '',
    checkOut: query.checkOut ?? '',
    guestCount: Number(query.guests) || 2,
  };

  return (
    <BookingChrome>
      <p className="text-sm text-accent">Satu langkah lagi</p>
      <h1 className="font-heading mt-2 text-3xl tracking-tight">Cek harga, baru deh pesan.</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Harga di bawah sudah termasuk naik-turun peak season, per malam.
      </p>
      {stay.roomId && stay.checkIn && stay.checkOut ? (
        <CheckoutForm initialStay={stay} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Pilih kamar dan tanggal dari halaman properti dulu, baru ke sini.
        </p>
      )}
    </BookingChrome>
  );
}
