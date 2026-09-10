import { TenantChrome } from '@/components/booking/TenantChrome';
import { TenantReviewsView } from '@/components/booking/TenantReviewsView';

export default function TenantReviewsPage() {
  return (
    <TenantChrome current="/tenant/reviews">
      <p className="text-sm text-accent">Ulasan tamu</p>
      <h1 className="font-heading mt-2 text-3xl tracking-tight">Baca dan balas ulasan.</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Tamu nulis setelah check-out. Balas yang belum kamu jawab biar ramah.
      </p>
      <TenantReviewsView />
    </TenantChrome>
  );
}
