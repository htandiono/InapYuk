'use client';

import { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function EmptyImage({ aspectClass = 'aspect-4/3' }: { aspectClass?: string }) {
  return (
    <div className={`${aspectClass} w-full bg-muted relative flex items-center justify-center`}>
      <div className="text-muted-foreground text-xs">Belum ada foto</div>
    </div>
  );
}

function SingleImage({ url, name, aspectClass = 'aspect-4/3' }: { url: string; name: string; aspectClass?: string }) {
  return (
    <div className={`${aspectClass} w-full bg-muted relative overflow-hidden group/image`}>
      <Image src={url} alt={name} fill className="object-cover transition-transform duration-500 group-hover/image:scale-105" unoptimized />
    </div>
  );
}

function ArrowButton({ dir, onClick, disabled }: { dir: 'left' | 'right'; onClick: (e: MouseEvent) => void; disabled: boolean }) {
  const Icon = dir === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button 
      onClick={onClick} disabled={disabled}
      className="pointer-events-auto w-8 h-8 rounded-full bg-background/90 shadow-md flex items-center justify-center text-foreground hover:bg-background hover:scale-105 transition-all disabled:opacity-0 disabled:pointer-events-none"
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

function CarouselArrows({ current, max, onScrollTo }: { current: number; max: number; onScrollTo: (i: number, e: MouseEvent) => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 pointer-events-none">
      <ArrowButton dir="left" onClick={(e) => onScrollTo(Math.max(0, current - 1), e)} disabled={current === 0} />
      <ArrowButton dir="right" onClick={(e) => onScrollTo(Math.min(max, current + 1), e)} disabled={current === max} />
    </div>
  );
}

function CarouselDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-sm ${i === current ? 'bg-white scale-125' : 'bg-white/60'}`} />
      ))}
    </div>
  );
}

function CarouselBody({ imageUrls, name, current, max, onScrollTo, refObj, onScroll, aspectClass = 'aspect-4/3' }: { imageUrls: string[]; name: string; current: number; max: number; onScrollTo: (i: number, e: MouseEvent) => void; refObj: React.RefObject<HTMLDivElement | null>; onScroll: () => void; aspectClass?: string }) {
  return (
    <div className={`${aspectClass} w-full bg-muted relative overflow-hidden group/carousel`}>
      <div ref={refObj} onScroll={onScroll} className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {imageUrls.map((url: string, i: number) => (
          <div key={i} className="shrink-0 w-full h-full relative snap-center"><Image src={url} alt={`${name} - Foto ${i + 1}`} fill className="object-cover" unoptimized /></div>
        ))}
      </div>
      <CarouselArrows current={current} max={max} onScrollTo={onScrollTo} />
      <CarouselDots total={imageUrls.length} current={current} />
    </div>
  );
}

export function PropertyImageCarousel({ imageUrls, name, aspectClass }: { imageUrls: string[]; name: string; aspectClass?: string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  if (imageUrls.length === 0) return <EmptyImage aspectClass={aspectClass} />;
  if (imageUrls.length === 1) return <SingleImage url={imageUrls[0]} name={name} aspectClass={aspectClass} />;

  const onScroll = () => {
    if (ref.current) setCurrent(Math.round(ref.current.scrollLeft / ref.current.clientWidth));
  };
  const onScrollTo = (i: number, e: MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (ref.current) ref.current.scrollTo({ left: i * ref.current.clientWidth, behavior: 'smooth' });
  };

  return <CarouselBody imageUrls={imageUrls} name={name} current={current} max={imageUrls.length - 1} onScrollTo={onScrollTo} refObj={ref} onScroll={onScroll} aspectClass={aspectClass} />;
}
