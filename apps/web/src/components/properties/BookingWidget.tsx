import React from 'react';

interface BookingWidgetProps {
  selectedDate: string | null;
  selectedNightData: { price: number; isAvailable: boolean; checkOut?: string } | null;
  roomId: string;
}

function nightCount(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86400000));
}

function BookingButton({ selectedDate, selectedNightData, roomId }: BookingWidgetProps) {
  const checkOut = selectedNightData?.checkOut;
  if (selectedDate && checkOut && selectedNightData?.isAvailable) {
    const checkIn = selectedDate.split('T')[0];
    return (
      <a
        href={`/checkout?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=2`}
        className="w-full block text-center py-3.5 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors mt-2"
      >
        Pesan Sekarang
      </a>
    );
  }
  const label = !selectedDate ? 'Pilih tanggal check-in' : !checkOut ? 'Pilih tanggal check-out' : 'Kamar Penuh';
  return (
    <button
      disabled
      className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
    >
      {label}
    </button>
  );
}

export function BookingWidget({ selectedDate, selectedNightData, roomId }: BookingWidgetProps) {
  const nights = selectedDate && selectedNightData?.checkOut
    ? nightCount(selectedDate.split('T')[0], selectedNightData.checkOut)
    : 0;
  const label = nights > 1 ? `Total ${nights} malam` : 'Total per malam';
  return (
    <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-xl font-bold text-primary">
          {getPriceDisplay(selectedDate, selectedNightData)}
        </span>
      </div>
      <BookingButton
        selectedDate={selectedDate}
        selectedNightData={selectedNightData}
        roomId={roomId}
      />
      <p className="text-xs text-center text-muted-foreground mt-1">
        Klik tanggal masuk, lalu tanggal keluar. Belum ada biaya sampai pesanan dikirim.
      </p>
    </div>
  );
}

function getPriceDisplay(
  date: string | null,
  data: { price: number; isAvailable: boolean } | null,
) {
  if (!date) return '-';
  if (!data) return 'Memuat...';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(data.price);
}

