import { FC } from 'react';
import { Users, DoorClosed } from 'lucide-react';

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  totalUnits: number;
  basePrice: number;
}

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  selectedNight?: { date: string, price: number, isAvailable: boolean } | null;
}

export const RoomSelector: FC<RoomSelectorProps> = ({ rooms, selectedRoomId, onSelectRoom, selectedNight }) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-xl font-bold text-foreground">Pilih Tipe Kamar</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rooms.map((room) => {
          const isSelected = room.id === selectedRoomId;
          const displayPrice = (isSelected && selectedNight) ? selectedNight.price : room.basePrice;
          
          const formattedPrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(displayPrice);

          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`text-left flex flex-col p-5 rounded-2xl border transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-semibold text-lg text-foreground">{room.name}</span>
                {isSelected && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                    Terpilih
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 text-left">{room.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{room.capacity} Tamu</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <DoorClosed className="w-4 h-4" />
                  <span>
                    {(isSelected && selectedNight) 
                      ? (selectedNight.isAvailable ? 'Tersedia' : <span className="text-red-500 font-semibold">Penuh</span>) 
                      : `${room.totalUnits} Unit Total`}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border/50 flex items-baseline gap-1.5">
                <span className="text-primary font-bold text-xl">{formattedPrice}</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {isSelected && selectedNight ? (
                    ` / mlm (${new Date(selectedNight.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`
                  ) : (
                    ' / mlm'
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
