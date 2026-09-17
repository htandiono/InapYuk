'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ThumbnailItem } from './ImageLightboxThumbnail';

interface LightboxDialogProps {
  isOpen: boolean;
  onClose: () => void;
  images: { url: string }[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  altPrefix: string;
}

export function LightboxDialog({
  isOpen,
  onClose,
  images,
  currentIndex,
  setCurrentIndex,
  altPrefix,
}: LightboxDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-none! sm:max-w-none! w-screen h-screen p-0 border-none bg-black/95 text-white flex flex-col justify-center items-center rounded-none shadow-none [&>button]:hidden z-9999">
        <DialogTitle className="sr-only">Galeri Foto</DialogTitle>
        <DialogDescription className="sr-only">
          Menampilkan foto {currentIndex + 1} dari {images.length}
        </DialogDescription>
        <LightboxTopBar currentIndex={currentIndex} total={images.length} onClose={onClose} />
        <LightboxMainImage
          images={images}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          altPrefix={altPrefix}
        />
        <LightboxThumbnails
          images={images}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </DialogContent>
    </Dialog>
  );
}

function LightboxTopBar({
  currentIndex,
  total,
  onClose,
}: {
  currentIndex: number;
  total: number;
  onClose: () => void;
}) {
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-linear-to-b from-black/60 to-transparent">
      <div className="text-sm font-medium tracking-wide">
        {currentIndex + 1} / {total}
      </div>
      <button
        onClick={handleClose}
        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <X className="w-6 h-6" />
        <span className="sr-only">Tutup</span>
      </button>
    </div>
  );
}

function LightboxMainImage({
  images,
  currentIndex,
  setCurrentIndex,
  altPrefix,
}: {
  images: { url: string }[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  altPrefix: string;
}) {
  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((p: number) => (p === 0 ? images.length - 1 : p - 1));
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((p: number) => (p === images.length - 1 ? 0 : p + 1));
  };
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden pb-24">
      {images.length > 1 && <LightboxBtn dir="left" onClick={prev} />}
      <div className="relative w-full h-full md:w-[85vw] md:h-[80vh]">
        <Image
          src={images[currentIndex].url}
          alt={`${altPrefix} ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>
      {images.length > 1 && <LightboxBtn dir="right" onClick={next} />}
    </div>
  );
}

function LightboxBtn({
  dir,
  onClick,
}: {
  dir: 'left' | 'right';
  onClick: (e: React.MouseEvent) => void;
}) {
  const isLeft = dir === 'left';
  const posClass = isLeft ? 'left-2 md:left-6' : 'right-2 md:right-6';
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  const label = isLeft ? 'Sebelumnya' : 'Selanjutnya';
  return (
    <button
      onClick={onClick}
      className={`absolute ${posClass} z-50 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/80 transition-colors text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50`}
    >
      <Icon className="w-6 h-6 md:w-8 md:h-8" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function LightboxThumbnails({
  images,
  currentIndex,
  setCurrentIndex,
}: {
  images: { url: string }[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (images.length <= 1) return null;
  return (
    <div className="absolute bottom-4 left-0 right-0 h-16 md:h-20 px-4 flex justify-center gap-2 overflow-x-auto z-50 scrollbar-hide">
      <div className="flex gap-2 mx-auto">
        {images.map((img, idx) => (
          <ThumbnailItem
            key={idx}
            img={img}
            idx={idx}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        ))}
      </div>
    </div>
  );
}
