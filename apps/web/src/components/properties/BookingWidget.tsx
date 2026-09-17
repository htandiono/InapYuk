import React from 'react';

interface BookingWidgetProps {
  selectedDate: string | null;
  selectedNightData: { price: number; isAvailable: boolean } | null;
  roomId: string;
}

function getPriceDisplay(date: string | null, data: { price: number; isAvailable: boolean } | null) {
  if (!date) return '-';
  if (!data) return 'Memuat...';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(data.price);
}

function BookingButton({ selectedDate, selectedNightData, roomId }: BookingWidgetProps) {
  if (selectedDate && selectedNightData?.isAvailable) {
    const nextDay = new Date(new Date(selectedDate).getTime() + 86400000).toISOString().split('T')[0];
    return <a href={`/checkout?roomId=${roomId}&checkIn=${selectedDate}&checkOut=${nextDay}&guests=2`} className="w-full block text-center py-3.5 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors mt-2">Pesan Sekarang</a>;
  }
  const label = !selectedDate ? 'Pilih Tanggal' : !selectedNightData ? 'Menghitung Harga...' : 'Kamar Penuh';
  return <button disabled className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">{label}</button>;
}

export function BookingWidget({ selectedDate, selectedNightData, roomId }: BookingWidgetProps) {
  return (
    <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">Total per malam</span>
        <span className="text-xl font-bold text-primary">{getPriceDisplay(selectedDate, selectedNightData)}</span>
      </div>
      <BookingButton selectedDate={selectedDate} selectedNightData={selectedNightData} roomId={roomId} />
      <p className="text-xs text-center text-muted-foreground mt-1">Anda belum dikenakan biaya. Form pemesanan akan dilanjutkan di Feature 2.</p>
    </div>
  );
}
