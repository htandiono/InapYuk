import Link from 'next/link';

export function PropertyListPreview() {
  // A lightweight static preview section for the landing page.
  // The actual property fetching happens in the Property Catalog page (Ticket 11).
  const dummies = [
    { city: 'Bali', count: 120, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
    { city: 'Yogyakarta', count: 85, img: 'https://images.unsplash.com/photo-1584804364007-85b2e811c7ce?auto=format&fit=crop&w=600&q=80' },
    { city: 'Jakarta', count: 240, img: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <section className="mt-24 w-full">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-heading text-2xl tracking-tight text-foreground sm:text-3xl">
            Destinasi Populer
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pilih kota tujuanmu dan temukan penginapan terbaik.
          </p>
        </div>
        <Link 
          href="/properties" 
          className="hidden sm:inline-flex text-sm font-medium text-primary hover:underline"
        >
          Lihat semua
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {dummies.map((d) => (
          <Link key={d.city} href={`/properties?city=${d.city}`} className="group block relative rounded-2xl overflow-hidden aspect-4/3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={d.img} 
              alt={d.city}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h3 className="text-xl font-heading text-white">{d.city}</h3>
              <p className="text-sm text-white/80 mt-1">{d.count} properti</p>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 text-center sm:hidden">
        <Link 
          href="/properties" 
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          Lihat semua destinasi
        </Link>
      </div>
    </section>
  );
}
