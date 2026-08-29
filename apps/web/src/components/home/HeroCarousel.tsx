'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';

const slides = [
  {
    id: 1,
    badge: 'Pilihan #1 untuk Staycation',
    eyebrow: '🌴 Liburan Nyaman, Kantong Aman',
    headlinePrefix: 'Cek dulu harganya,',
    headlineSuffix: 'baru deh kita liburan.',
    body: 'Tanggal merah biasanya mahal? Tenang aja. Di InapYuk kamu bisa intip pergerakan harga kamar setiap harinya. Cocok di hati, langsung booking!'
  },
  {
    id: 2,
    badge: 'Diskon Pengguna Baru',
    eyebrow: '🎉 Harga Spesial Buat Kamu',
    headlinePrefix: 'Makin untung nginap,',
    headlineSuffix: 'pakai promo perdana.',
    body: 'Daftar sekarang dan nikmati harga yang lebih miring buat booking pertama. Liburan hemat tanpa mikir panjang.'
  },
  {
    id: 3,
    badge: 'Jaminan Harga Termurah',
    eyebrow: '💰 Hemat Tanpa Syarat Ribet',
    headlinePrefix: 'Bandingin harganya,',
    headlineSuffix: 'pasti InapYuk juaranya.',
    body: 'Nggak usah pusing pindah-pindah tab. Harga yang kamu lihat di kalender adalah harga jujur tanpa biaya tersembunyi di akhir.'
  }
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative w-full rounded-3xl bg-primary/5 overflow-hidden border border-primary/10">
      
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Subtle dot pattern overlay (opacity 3%) */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] pointer-events-none" />

      {/* Increased bottom padding (pb-32 sm:pb-40) to leave room for the overlapping search form */}
      <div className="relative z-10 mx-auto max-w-4xl pt-20 pb-32 text-center sm:pt-28 sm:pb-40">
        
        {/* Carousel Viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y flex-row">
            {slides.map((slide) => (
              <div className="min-w-0 shrink-0 grow-0 basis-full px-6 sm:px-12" key={slide.id}>
                {/* Trust Badge */}
                <div className="animate-fade-in-up inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse"></span>
                  {slide.badge}
                </div>

                <p className="animate-fade-in-up delay-100 text-sm font-semibold tracking-wider text-accent uppercase mb-4">
                  {slide.eyebrow}
                </p>
                
                <h1 className="animate-fade-in-up delay-200 font-heading text-[1.8rem] leading-tight tracking-tight sm:text-5xl md:text-6xl text-foreground">
                  <span className="whitespace-nowrap">{slide.headlinePrefix}</span> <br />
                  <span className="text-primary whitespace-nowrap">{slide.headlineSuffix}</span>
                </h1>
                
                <p className="animate-fade-in-up delay-300 mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg max-w-xl mx-auto">
                  {slide.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="mt-8 flex justify-center gap-2 relative z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-8 rounded-full transition-all duration-300 ${
                index === selectedIndex ? 'bg-primary' : 'bg-primary/20'
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
