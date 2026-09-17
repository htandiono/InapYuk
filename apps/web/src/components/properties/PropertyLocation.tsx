import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full rounded-2xl bg-muted animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground">Memuat peta...</span>
    </div>
  ),
});

interface PropertyLocationProps {
  lat?: number | null;
  lng?: number | null;
  name: string;
  address: string;
  city: string;
  province: string;
}

export function PropertyLocation({ lat, lng, name, address, city, province }: PropertyLocationProps) {
  const fullAddress = `${address}, ${city}, ${province}`;
  const hasCoordinates = typeof lat === 'number' && typeof lng === 'number';
  return (
    <section className="py-8 border-t border-border mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading mb-2">Lokasi</h2>
        <div className="flex items-start gap-2 text-muted-foreground"><MapPin className="w-5 h-5 shrink-0 text-primary mt-0.5" /><p className="leading-relaxed">{fullAddress}</p></div>
      </div>
      {hasCoordinates ? <PropertyMap lat={lat} lng={lng} name={name} address={fullAddress} /> : <NoMapPlaceholder fullAddress={fullAddress} />}
    </section>
  );
}

function NoMapPlaceholder({ fullAddress }: { fullAddress: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4"><MapPin className="w-6 h-6" /></div>
      <h3 className="font-semibold text-lg mb-2">Peta Belum Tersedia</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">Titik koordinat pasti untuk properti ini belum ditambahkan oleh pengelola. Anda dapat mencari alamat berikut secara manual di aplikasi navigasi Anda.</p>
      <div className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-left max-w-md w-full relative group"><p className="pr-10">{fullAddress}</p></div>
    </div>
  );
}
