import { FC, useState } from 'react';
import Image from 'next/image';
import { Users, DoorClosed, Image as ImageIcon } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';

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

export const RoomSelector: FC<RoomSelectorProps> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  selectedNight,
}) => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const activeRoom = rooms.find((r) => r.id === lightbox);
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-xl font-bold text-foreground">Pilih Tipe Kamar</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rooms.map((r) => (
          <RoomCard
            key={r.id}
            room={r}
            selectedId={selectedRoomId}
            onSelect={onSelectRoom}
            night={selectedNight}
            onLightbox={setLightbox}
          />
        ))}
      </div>
      {lightbox && (
        <ImageLightbox
          images={activeRoom?.images || []}
          initialIndex={0}
          isOpen={!!lightbox}
          onClose={() => setLightbox(null)}
          altPrefix={activeRoom?.name || 'Kamar'}
        />
      )}
    </div>
  );
};

function RoomCard({
  room,
  selectedId,
  onSelect,
  night,
  onLightbox,
}: {
  room: Room;
  selectedId: string;
  onSelect: (id: string) => void;
  night?: { date?: string; price: number; isAvailable: boolean } | null;
  onLightbox: (id: string) => void;
}) {
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
}

function RoomImage({ room, onLightbox }: { room: Room; onLightbox: (id: string) => void }) {
  if (!room.images || room.images.length === 0) {
    return (
      <div className="relative w-full aspect-video bg-muted/50 flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
        <span className="text-xs font-medium opacity-70">Tidak ada foto</span>
      </div>
    );
  }
  return (
    <div
      className="relative w-full aspect-video bg-muted group cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onLightbox(room.id);
      }}
    >
      <Image
        src={room.images[0].url}
        alt={room.name}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, 50vw"
      />
      {room.images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">
          1 / {room.images.length}
        </div>
      )}
    </div>
  );
}

function RoomDetails({
  room,
  isSelected,
  night,
}: {
  room: Room;
  isSelected: boolean;
  night?: { date?: string; price: number; isAvailable: boolean } | null;
}) {
  return (
    <div className="p-5 flex flex-col grow w-full">
      <div className="flex items-start justify-between w-full mb-2 gap-2">
        <span
          className="font-semibold text-lg text-foreground line-clamp-2 break-all"
          title={room.name}
        >
          {room.name}
        </span>
        {isSelected && (
          <span className="shrink-0 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium mt-1">
            Terpilih
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 text-left">
        {room.description}
      </p>
      <RoomMeta room={room} isSelected={isSelected} night={night} />
      <RoomPrice room={room} isSelected={isSelected} night={night} />
    </div>
  );
}

function RoomMeta({
  room,
  isSelected,
  night,
}: {
  room: Room;
  isSelected: boolean;
  night?: { date?: string; price: number; isAvailable: boolean } | null;
}) {
  const status =
    isSelected && night ? (
      night.isAvailable ? (
        'Tersedia'
      ) : (
        <span className="text-red-500 font-semibold">Penuh</span>
      )
    ) : (
      `${room.totalUnits} Unit Total`
    );
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>{room.capacity} Tamu</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <DoorClosed className="w-4 h-4" />
        <span>{status}</span>
      </div>
    </div>
  );
}

function RoomPrice({
  room,
  isSelected,
  night,
}: {
  room: Room;
  isSelected: boolean;
  night?: { date?: string; price: number; isAvailable: boolean } | null;
}) {
  const price = isSelected && night ? night.price : room.basePrice;
  const fmt = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
  const suffix =
    isSelected && night && night.date
      ? ` / mlm (${new Date(night.date as string).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`
      : ' / mlm';
  return (
    <div className="mt-auto pt-4 border-t border-border/50 flex items-baseline gap-1.5">
      <span className="text-primary font-bold text-xl">{fmt}</span>
      <span className="text-xs text-muted-foreground font-medium">{suffix}</span>
    </div>
  );
}
