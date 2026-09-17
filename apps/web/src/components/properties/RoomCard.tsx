'use client';

import { FC } from 'react';
import { Users, DoorClosed } from 'lucide-react';
import { Room } from './RoomSelector';
import { PropertyImageCarousel } from './PropertyImageCarousel';

interface RoomCardProps {
  room: Room;
  selectedId: string;
  onSelect: (id: string) => void;
  night?: { date?: string; price: number; isAvailable: boolean } | null;
  onLightbox: (id: string) => void;
}

export const RoomCard: FC<RoomCardProps> = ({ room, selectedId, onSelect, night, onLightbox }) => {
  const isSelected = room.id === selectedId;
  const cls = isSelected
    ? 'border-primary bg-primary/5 ring-1 ring-primary'
    : 'border-border bg-card hover:border-primary/50 hover:shadow-sm';
  return (
    <button
      onClick={() => onSelect(room.id)}
      className={`text-left flex flex-col rounded-2xl border overflow-hidden transition-all ${cls}`}
    >
      <RoomImage room={room} onLightbox={onLightbox} />
      <RoomDetails room={room} isSelected={isSelected} night={night} />
    </button>
  );
};

export function RoomImage({ room, onLightbox }: { room: Room; onLightbox: (id: string) => void }) {
  const imageUrls = room.images?.map(img => img.url) || [];
  return (
    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLightbox(room.id); }} className="cursor-pointer">
      <PropertyImageCarousel imageUrls={imageUrls} name={room.name} aspectClass="aspect-video" />
    </div>
  );
}

export function RoomDetails({ room, isSelected, night }: { room: Room; isSelected: boolean; night?: { date?: string; price: number; isAvailable: boolean } | null; }) {
  return (
    <div className="p-5 flex flex-col grow w-full">
      <div className="flex items-start justify-between w-full mb-2 gap-2">
        <span className="font-semibold text-lg text-foreground line-clamp-2 break-all" title={room.name}>{room.name}</span>
        {isSelected && <span className="shrink-0 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium mt-1">Terpilih</span>}
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 text-left">{room.description}</p>
      <RoomMeta room={room} isSelected={isSelected} night={night} />
      <RoomPrice room={room} isSelected={isSelected} night={night} />
    </div>
  );
}

export function RoomMeta({ room, isSelected, night }: { room: Room; isSelected: boolean; night?: { date?: string; price: number; isAvailable: boolean } | null; }) {
  const status = isSelected && night ? (night.isAvailable ? 'Tersedia' : <span className="text-red-500 font-semibold">Penuh</span>) : `${room.totalUnits} Unit Total`;
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Users className="w-4 h-4" /><span>{room.capacity} Tamu</span></div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><DoorClosed className="w-4 h-4" /><span>{status}</span></div>
    </div>
  );
}

export function RoomPrice({ room, isSelected, night }: { room: Room; isSelected: boolean; night?: { date?: string; price: number; isAvailable: boolean } | null; }) {
  const price = isSelected && night ? night.price : room.basePrice;
  const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  const suffix = isSelected && night && night.date ? ` / mlm (${new Date(night.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})` : ' / mlm';
  return (
    <div className="mt-auto pt-4 border-t border-border/50 flex items-baseline gap-1.5">
      <span className="text-primary font-bold text-xl">{fmt}</span><span className="text-xs text-muted-foreground font-medium">{suffix}</span>
    </div>
  );
}
