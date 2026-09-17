'use client';

import { FC, useState } from 'react';
import { ImageLightbox } from './ImageLightbox';
import { RoomCard } from './RoomCard';

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  totalUnits: number;
  basePrice: number;
  images?: { id: string; url: string }[];
}

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  selectedNight?: { date?: string; price: number; isAvailable: boolean } | null;
}

export const RoomSelector: FC<RoomSelectorProps> = ({ rooms, selectedRoomId, onSelectRoom, selectedNight }) => {
  const [lightbox, setLightbox] = useState<string | null>(null), activeRoom = rooms.find((r) => r.id === lightbox);
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-xl font-bold text-foreground">Pilih Tipe Kamar</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rooms.map((r) => <RoomCard key={r.id} room={r} selectedId={selectedRoomId} onSelect={onSelectRoom} night={selectedNight} onLightbox={setLightbox} />)}
      </div>
      {lightbox && <ImageLightbox images={activeRoom?.images || []} initialIndex={0} isOpen={!!lightbox} onClose={() => setLightbox(null)} altPrefix={activeRoom?.name || 'Kamar'} />}
    </div>
  );
};
