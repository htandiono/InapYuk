'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';

function MobileGalleryDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-sm ${i === current ? 'bg-white scale-125' : 'bg-white/60'}`} />
      ))}
    </div>
  );
}

function MobileGallerySlider({ imgs, name, onImageClick, scrollRef, onScroll }: { imgs: { url: string }[]; name: string; onImageClick: (idx: number) => void; scrollRef: React.RefObject<HTMLDivElement | null>; onScroll: () => void }) {
  return (
    <div ref={scrollRef} onScroll={onScroll} className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {imgs.map((img: { url: string }, i: number) => (
        <div key={i} className="shrink-0 w-full h-full relative snap-center cursor-pointer" onClick={() => onImageClick(i)}>
          <Image src={img.url} alt={`${name} - Foto ${i + 1}`} fill sizes="100vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

export function MobileGallery({ imgs, name, onImageClick }: { imgs: { url: string }[], name: string, onImageClick: (idx: number) => void }) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) setCurrent(Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth));
  };

  return (
    <div className="md:hidden relative w-full h-75 sm:h-100 rounded-3xl overflow-hidden group">
      <MobileGallerySlider imgs={imgs} name={name} onImageClick={onImageClick} scrollRef={scrollRef} onScroll={handleScroll} />
      <MobileGalleryDots current={current} total={imgs.length} />
    </div>
  );
}
