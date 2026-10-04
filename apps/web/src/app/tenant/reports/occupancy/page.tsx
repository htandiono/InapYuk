import { OccupancyReportView } from '@/components/booking/OccupancyReportView';

export default function OccupancyReportPage() {
  return (
    <div className="flex-1 space-y-2 p-6 lg:p-8">
      <p className="text-sm text-accent">Kalender ketersediaan</p>
      <h1 className="font-heading mt-2 text-2xl tracking-tight sm:text-3xl">Lihat kamar yang terisi tiap hari.</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Warna beda untuk terisi, kosong, dan tanggal yang ditutup.
      </p>
      <OccupancyReportView />
    </div>
  );
}
