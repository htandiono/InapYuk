'use client';

import { useEffect, useState } from 'react';
import { LightboxDialog } from './ImageLightboxViews';

export interface ImageLightboxProps {
  images: { id?: string; url: string }[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  altPrefix?: string;
}

export function ImageLightbox({ images, initialIndex = 0, isOpen, onClose, altPrefix = 'Gambar' }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex), [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  useResetIndex(isOpen, prevIsOpen, setPrevIsOpen, initialIndex, setCurrentIndex);
  useLightboxKeys(isOpen, images.length, setCurrentIndex);
  if (!images || images.length === 0) return null;
  return <LightboxDialog isOpen={isOpen} onClose={onClose} images={images} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} altPrefix={altPrefix} />;
}

function useResetIndex(isOpen: boolean, prevIsOpen: boolean, setPrevIsOpen: (b: boolean) => void, initialIndex: number, setCurrentIndex: (i: number) => void) {
  if (isOpen !== prevIsOpen) { setPrevIsOpen(isOpen); if (isOpen) setCurrentIndex(initialIndex); }
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
