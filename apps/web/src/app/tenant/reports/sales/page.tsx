import { TenantChrome } from '@/components/booking/TenantChrome';
import { SalesReportView } from '@/components/booking/SalesReportView';

export default function SalesReportPage() {
  return (
    <TenantChrome current="/tenant/reports/sales">
      <p className="text-sm text-accent">Laporan penjualan</p>
      <h1 className="font-heading mt-2 text-3xl tracking-tight">Lihat dari mana uangnya datang.</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Grup per properti, per transaksi, atau per tamu. Angkanya dari harga yang terkunci saat pesan.
      </p>
      <SalesReportView />
    </TenantChrome>
  );
}
