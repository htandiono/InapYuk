'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export interface ImageLightboxProps {
  images: { id?: string; url: string }[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  altPrefix?: string;
}

export function ImageLightbox({ images, initialIndex = 0, isOpen, onClose, altPrefix = 'Gambar' }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  useResetIndex(isOpen, prevIsOpen, setPrevIsOpen, initialIndex, setCurrentIndex);
  useLightboxKeys(isOpen, images.length, setCurrentIndex);
  if (!images || images.length === 0) return null;
  return <LightboxDialog isOpen={isOpen} onClose={onClose} images={images} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} altPrefix={altPrefix} />;
}

function useResetIndex(isOpen: boolean, prevIsOpen: boolean, setPrevIsOpen: (b: boolean) => void, initialIndex: number, setCurrentIndex: (i: number) => void) {
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setCurrentIndex(initialIndex);
  }
}

function useLightboxKeys(isOpen: boolean, len: number, setCurrentIndex: React.Dispatch<React.SetStateAction<number>>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') setCurrentIndex((p: number) => p === 0 ? len - 1 : p - 1);
      if (e.key === 'ArrowRight') setCurrentIndex((p: number) => p === len - 1 ? 0 : p + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, len, setCurrentIndex]);
}

function LightboxDialog({ isOpen, onClose, images, currentIndex, setCurrentIndex, altPrefix }: { isOpen: boolean, onClose: () => void, images: { url: string }[], currentIndex: number, setCurrentIndex: React.Dispatch<React.SetStateAction<number>>, altPrefix: string }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-none! sm:max-w-none! w-screen h-screen p-0 border-none bg-black/95 text-white flex flex-col justify-center items-center rounded-none shadow-none [&>button]:hidden z-9999">
        <DialogTitle className="sr-only">Galeri Foto</DialogTitle>
        <DialogDescription className="sr-only">Menampilkan foto {currentIndex + 1} dari {images.length}</DialogDescription>
        <LightboxTopBar currentIndex={currentIndex} total={images.length} onClose={onClose} />
        <LightboxMainImage images={images} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} altPrefix={altPrefix} />
        <LightboxThumbnails images={images} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
      </DialogContent>
    </Dialog>
  );
}

function LightboxTopBar({ currentIndex, total, onClose }: { currentIndex: number, total: number, onClose: () => void }) {
  const handleClose = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onClose(); };
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-linear-to-b from-black/60 to-transparent">
      <div className="text-sm font-medium tracking-wide">{currentIndex + 1} / {total}</div>
      <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white/50">
        <X className="w-6 h-6" /><span className="sr-only">Tutup</span>
      </button>
    </div>
  );
}

function LightboxMainImage({ images, currentIndex, setCurrentIndex, altPrefix }: { images: { url: string }[], currentIndex: number, setCurrentIndex: React.Dispatch<React.SetStateAction<number>>, altPrefix: string }) {
  const prev = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex((p: number) => p === 0 ? images.length - 1 : p - 1); };
  const next = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex((p: number) => p === images.length - 1 ? 0 : p + 1); };
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden pb-24">
      {images.length > 1 && <LightboxBtn dir="left" onClick={prev} />}
      <div className="relative w-full h-full md:w-[85vw] md:h-[80vh]">
        <Image src={images[currentIndex].url} alt={`${altPrefix} ${currentIndex + 1}`} fill className="object-contain" sizes="100vw" priority />
      </div>
      {images.length > 1 && <LightboxBtn dir="right" onClick={next} />}
    </div>
  );
}

function LightboxBtn({ dir, onClick }: { dir: 'left' | 'right', onClick: (e: React.MouseEvent) => void }) {
  const isLeft = dir === 'left';
  const posClass = isLeft ? "left-2 md:left-6" : "right-2 md:right-6";
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  const label = isLeft ? "Sebelumnya" : "Selanjutnya";
  return (
    <button onClick={onClick} className={`absolute ${posClass} z-50 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/80 transition-colors text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50`}>
      <Icon className="w-6 h-6 md:w-8 md:h-8" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function LightboxThumbnails({ images, currentIndex, setCurrentIndex }: { images: { url: string }[], currentIndex: number, setCurrentIndex: React.Dispatch<React.SetStateAction<number>> }) {
  if (images.length <= 1) return null;
  return (
    <div className="absolute bottom-4 left-0 right-0 h-16 md:h-20 px-4 flex justify-center gap-2 overflow-x-auto z-50 scrollbar-hide">
      <div className="flex gap-2 mx-auto">
        {images.map((img, idx) => (
          <ThumbnailItem key={idx} img={img} idx={idx} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
        ))}
      </div>
    </div>
  );
}

function ThumbnailItem({ img, idx, currentIndex, setCurrentIndex }: { img: { url: string }, idx: number, currentIndex: number, setCurrentIndex: React.Dispatch<React.SetStateAction<number>> }) {
  const onClick = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(idx); };
  const activeClass = idx === currentIndex ? 'ring-2 ring-white opacity-100 scale-105' : 'opacity-40 hover:opacity-100';
  return (
    <button onClick={onClick} className={`relative h-16 w-20 md:h-20 md:w-28 shrink-0 rounded-md overflow-hidden transition-all ${activeClass}`}>
      <Image src={img.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="120px" />
    </button>
  );
}
