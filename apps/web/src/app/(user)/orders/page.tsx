import { Suspense } from 'react';
import { OrderListView } from '@/components/booking/OrderListView';

export default function OrdersPage() {
  return (
    <>
      <p className="text-sm text-accent">Pesanan kamu</p>
      <h1 className="font-heading mt-2 text-3xl tracking-tight">Cek status, unggah bukti, atau batalin.</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Tab status, tanggal check-in, dan nomor pesanan semuanya nanya ke server — bukan filter di
        layar aja.
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat pesanan...</p>}>
        <OrderListView />
      </Suspense>
    </>
  );
}
