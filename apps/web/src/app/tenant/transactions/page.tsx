import { Suspense } from 'react';
import { TenantTransactionsView } from '@/components/booking/TenantTransactionsView';

export default function TenantTransactionsPage() {
  return (
    <div className="flex-1 space-y-2 p-6 lg:p-8">
      <p className="text-sm text-accent">Transaksi masuk</p>
      <h1 className="font-heading mt-2 text-2xl tracking-tight sm:text-3xl">Cek bukti, terima, atau tolak.</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Filter status dan nama tamu nanya ke server, bukan nyaring di layar aja.
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat transaksi...</p>}>
        <TenantTransactionsView />
      </Suspense>
    </div>
  );
}
