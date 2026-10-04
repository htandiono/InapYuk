import { TenantReviewsView } from '@/components/booking/TenantReviewsView';

export default function TenantReviewsPage() {
  return (
    <div className="flex-1 space-y-2 p-6 lg:p-8">
      <p className="text-sm text-accent">Ulasan tamu</p>
      <h1 className="font-heading mt-2 text-2xl tracking-tight sm:text-3xl">Baca dan balas ulasan.</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Tamu nulis setelah check-out. Balas yang belum kamu jawab biar ramah.
      </p>
      <TenantReviewsView />
    </div>
  );
}
