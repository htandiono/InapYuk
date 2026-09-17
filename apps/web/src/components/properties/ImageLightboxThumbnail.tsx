'use client';

import Image from 'next/image';

interface ThumbnailItemProps {
  img: { url: string };
  idx: number;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

export function ThumbnailItem({ img, idx, currentIndex, setCurrentIndex }: ThumbnailItemProps) {
  const onClick = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(idx); };
  const activeClass = idx === currentIndex ? 'ring-2 ring-white opacity-100 scale-105' : 'opacity-40 hover:opacity-100';
  return (
    <button onClick={onClick} className={`relative h-16 w-20 md:h-20 md:w-28 shrink-0 rounded-md overflow-hidden transition-all ${activeClass}`}>
      <Image src={img.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="120px" />
    </button>
  );
}
