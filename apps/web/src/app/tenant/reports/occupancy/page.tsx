import { TenantChrome } from '@/components/booking/TenantChrome';
import { OccupancyReportView } from '@/components/booking/OccupancyReportView';

export default function OccupancyReportPage() {
  return (
    <TenantChrome current="/tenant/reports/occupancy">
      <p className="text-sm text-accent">Kalender ketersediaan</p>
      <h1 className="font-heading mt-2 text-3xl tracking-tight">Lihat kamar yang terisi tiap hari.</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Warna beda untuk terisi, kosong, dan tanggal yang ditutup.
      </p>
      <OccupancyReportView />
    </TenantChrome>
  );
}
