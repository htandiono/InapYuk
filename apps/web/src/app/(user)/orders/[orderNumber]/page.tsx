import { OrderDetailView } from '@/components/booking/OrderDetailView';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return (
    <>
      <p className="text-sm text-accent">Detail pesanan</p>
      <h1 className="font-heading mt-2 text-3xl tracking-tight">{orderNumber}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cek harga per malam, unggah bukti transfer, atau batalin sebelum bayar.
      </p>
      <OrderDetailView orderNumber={orderNumber} />
    </>
  );
}
