import Link from 'next/link';
import { api } from '@/lib/api-client';

type PropertyPreview = {
  id: string; name: string; slug: string; city: string; province: string;
  categoryName: string; imageUrl: string | null; cheapestPrice: number;
};

async function fetchPreviewProperties() {
  try {
    const res = await api.get<{ items: PropertyPreview[] }>('/properties?limit=3', {
      cache: 'no-store'
    });
    return res.items || [];
  } catch {
    // Silent fail
    return [];
  }
}

function PropertyCard({ p }: { p: PropertyPreview }) {
  return (
    <Link href={`/properties/${p.slug}`} className="group block relative rounded-2xl overflow-hidden aspect-4/3 bg-muted">
      {p.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={p.imageUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10"><span className="text-muted-foreground">No Image</span></div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 p-5 w-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">{p.categoryName}</span>
          <span className="text-xs text-white/80">{p.city}</span>
        </div>
        <h3 className="text-xl font-heading text-white mt-1 line-clamp-1">{p.name}</h3>
        <p className="text-sm font-medium text-white mt-2">Mulai dari <span className="text-accent font-bold">Rp {p.cheapestPrice.toLocaleString('id-ID')}</span></p>
      </div>
    </Link>
  );
}

function PropertyGrid({ properties }: { properties: PropertyPreview[] }) {
  if (properties.length === 0) {
    return <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-2xl">Belum ada properti.</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {properties.map(p => <PropertyCard key={p.id} p={p} />)}
    </div>
  );
}

export async function PropertyListPreview() {
  const properties = await fetchPreviewProperties();
  return (
    <section className="mt-24 w-full">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-heading text-2xl tracking-tight text-foreground sm:text-3xl">Rekomendasi Properti</h2>
          <p className="mt-2 text-sm text-muted-foreground">Temukan tempat menginap terbaik untuk liburanmu selanjutnya.</p>
        </div>
        <Link href="/properties" className="hidden sm:inline-flex text-sm font-medium text-primary hover:underline">Lihat semua properti</Link>
      </div>
      <PropertyGrid properties={properties} />
      <div className="mt-8 text-center sm:hidden">
        <Link href="/properties" className="inline-flex text-sm font-medium text-primary hover:underline">Lihat semua properti</Link>
      </div>
    </section>
  );
}
