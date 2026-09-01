'use client';
import { Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ExistingImage {
  id: string;
  url: string;
}

interface Props {
  img: ExistingImage;
  isMain: boolean;
  onSetMain: () => void;
  onDelete: () => void;
}

export function ExistingImageCard({ img, isMain, onSetMain, onDelete }: Props) {
  return (
    <div
      className={`relative aspect-square border rounded-lg overflow-hidden group ${isMain ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt="prop"
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      <ImageActions isMain={isMain} onSetMain={onSetMain} onDelete={onDelete} />
      {isMain && <MainBadge />}
    </div>
  );
}

function ImageActions({
  isMain,
  onSetMain,
  onDelete,
}: {
  isMain: boolean;
  onSetMain: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
      {!isMain && <SetMainButton onClick={onSetMain} />}
      <DeleteButton onClick={onDelete} />
    </div>
  );
}

function SetMainButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-sm transition-colors"
      title="Jadikan Utama"
    >
      <Star className="w-4 h-4" />
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-destructive/90 hover:bg-destructive text-white p-1.5 rounded-full shadow-sm transition-colors"
      title="Hapus"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function MainBadge() {
  return (
    <div
      className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground p-1 rounded-md shadow-md"
      title="Foto Utama"
    >
      <Star className="w-3.5 h-3.5 fill-current" />
    </div>
  );
}
