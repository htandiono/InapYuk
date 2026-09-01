import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  Users,
  CalendarDays,
  CalendarClock,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  totalUnits: number;
  images?: { id: string; url: string }[];
}

type RoomCardProps = {
  r: Room;
  onEdit: (r: Room) => void;
  onDelete: (id: string) => void;
  onManageAvailability?: (id: string) => void;
  onManagePeakSeason?: (id: string) => void;
};

export function RoomCard({ r, onEdit, onDelete, onManageAvailability, onManagePeakSeason }: RoomCardProps) {
  return (
    <Card className="overflow-hidden bg-card transition-all hover:shadow-md border-border/40 group flex flex-col h-full pt-0 gap-0">
      {/* Image Section */}
      <RoomImage r={r} />

      {/* Content Section */}
      <CardHeader className="pb-3 pt-4 px-5 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle className="font-semibold text-base leading-tight line-clamp-1 break-words">
              {r.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 break-words leading-relaxed">
              {r.description}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full">
            {r.totalUnits} Unit
          </Badge>
        </div>
      </CardHeader>

      {/* Price & Metrics Section */}
      <CardContent className="px-5 pb-4 flex-grow">
        <div className="bg-muted/40 rounded-lg p-3 mb-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Harga Dasar
            </span>
            <span className="font-bold text-lg text-primary">
              Rp {Number(r.basePrice).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center gap-4 pt-1 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="font-medium">{r.capacity} Orang</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Actions Footer */}
      <CardFooter className="flex flex-col gap-2 px-5 pt-6 pb-4 border-t border-border/30 bg-muted/20">
        {/* Primary Actions: Availability & Peak Season */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 h-8 rounded-full text-xs font-medium bg-[#0f6d5e] hover:bg-[#0b5649] border-transparent text-white"
            onClick={() => onManageAvailability?.(r.id)}
          >
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            Ketersediaan
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 rounded-full text-xs font-medium border-[#0f6d5e]/30 text-[#0f6d5e] hover:bg-[#0f6d5e]/10 hover:border-[#0f6d5e]/50"
            onClick={() => onManagePeakSeason?.(r.id)}
          >
            <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
            Harga Musiman
          </Button>
        </div>
        {/* Secondary Actions: Edit & Delete */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 rounded-full text-xs font-medium border-border/60 hover:bg-muted/50"
            onClick={() => onEdit(r)}
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="size-8 rounded-full shadow-sm shrink-0"
            onClick={() => onDelete(r.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function RoomImage({ r }: { r: Room }) {
  const mainImage = r.images && r.images.length > 0 ? r.images[0].url : null;
  return (
    <div className="relative aspect-4/3 w-full bg-muted/20 overflow-hidden">
      {mainImage ? (
        <Image
          src={mainImage}
          alt={r.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-50">
          <ImageIcon className="h-10 w-10 mb-2" />
          <span className="text-xs font-medium">Tidak ada foto</span>
        </div>
      )}
    </div>
  );
}
