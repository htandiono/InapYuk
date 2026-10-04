'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { LightboxBtn, LightboxTopBar } from './LightboxControls';
import { LightboxThumbnails } from './LightboxThumbnails';

export interface ImageLightboxProps {
  images: { id?: string; url: string }[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  altPrefix?: string;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  altPrefix = 'Gambar',
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex),
    [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  useResetIndex(isOpen, prevIsOpen, setPrevIsOpen, initialIndex, setCurrentIndex);
  useLightboxKeys(isOpen, images.length, setCurrentIndex);
  if (!images || images.length === 0) return null;
  return (
    <LightboxDialog
      isOpen={isOpen}
      onClose={onClose}
      images={images}
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      altPrefix={altPrefix}
    />
  );
}

function useResetIndex(
  isOpen: boolean,
  prevIsOpen: boolean,
  setPrevIsOpen: (b: boolean) => void,
  initialIndex: number,
  setCurrentIndex: (i: number) => void,
) {
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setCurrentIndex(initialIndex);
  }
}

function useLightboxKeys(
  isOpen: boolean,
  len: number,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') setCurrentIndex((p: number) => (p === 0 ? len - 1 : p - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((p: number) => (p === len - 1 ? 0 : p + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, len, setCurrentIndex]);
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

function LightboxDialog({
  isOpen,
  onClose,
  images,
  currentIndex,
  setCurrentIndex,
  altPrefix,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: { url: string }[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  altPrefix: string;
}) {
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
