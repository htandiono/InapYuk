'use client';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function LightboxBtn({
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

export function LightboxTopBar({
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
