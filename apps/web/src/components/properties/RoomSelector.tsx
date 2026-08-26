import { FC } from 'react';

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
}

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
}

export const RoomSelector: FC<RoomSelectorProps> = ({ rooms, selectedRoomId, onSelectRoom }) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-xl font-bold text-foreground">Pilih Tipe Kamar</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rooms.map((room) => {
          const isSelected = room.id === selectedRoomId;
          const formattedPrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(room.basePrice);

          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`text-left flex flex-col p-4 rounded-2xl border transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-foreground">{room.name}</span>
                {isSelected && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Terpilih
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{room.capacity} Tamu</p>
              <div className="mt-auto flex items-baseline gap-1">
                <span className="text-primary font-bold text-lg">{formattedPrice}</span>
                <span className="text-xs text-muted-foreground">/ mlm (Dasar)</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
