import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface Room { id: string; name: string; description: string; basePrice: number; capacity: number; totalUnits: number; images?: { id: string; url: string }[]; }

type RoomCardProps = { r: Room; onEdit: (r: Room) => void; onDelete: (id: string) => void; };

export function RoomCard({ r, onEdit, onDelete }: RoomCardProps) {
  return (
    <Card className="overflow-hidden bg-card transition-all hover:shadow-md border-border/40 group flex flex-col h-full pt-0 gap-0">
      <RoomImage r={r} />
      <CardContent className="p-5 flex flex-col grow mt-4">
        <RoomHeader r={r} />
        <RoomMetrics r={r} />
        <RoomActions r={r} onEdit={onEdit} onDelete={onDelete} />
      </CardContent>
    </Card>
  );
}

function RoomImage({ r }: { r: Room }) {
  const mainImage = r.images && r.images.length > 0 ? r.images[0].url : null;
  return (
    <div className="relative aspect-video w-full bg-muted/30 overflow-hidden">
      {mainImage ? <Image src={mainImage} alt={r.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-50"><ImageIcon className="h-8 w-8 mb-2" /><span className="text-xs font-medium">Tidak ada foto</span></div>}
    </div>
  );
}

function RoomHeader({ r }: { r: Room }) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-lg text-foreground leading-tight line-clamp-2 break-all" title={r.name}>{r.name}</h3>
      <p className="line-clamp-2 text-sm text-muted-foreground mt-1.5 wrap-break-word" title={r.description}>{r.description}</p>
    </div>
  );
}

function RoomMetrics({ r }: { r: Room }) {
  return (
    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-muted-foreground mb-5 mt-auto">
      <div className="col-span-2 flex items-center justify-between bg-muted/50 p-2.5 rounded-md">
        <span className="font-medium text-foreground">Harga Dasar</span>
        <span className="font-bold text-primary">Rp {Number(r.basePrice).toLocaleString('id-ID')}</span>
      </div>
      <div className="flex items-center gap-1.5"><Users className="h-4 w-4 shrink-0 text-accent" /><span className="truncate">{r.capacity} Orang</span></div>
      <div className="flex items-center gap-1.5"><LayoutGrid className="h-4 w-4 shrink-0 text-accent" /><span className="truncate">{r.totalUnits} Unit</span></div>
    </div>
  );
}

function RoomActions({ r, onEdit, onDelete }: RoomCardProps) {
  return (
    <div className="flex gap-2 pt-4 border-t border-border/50">
      <Button variant="outline" size="sm" className="flex-1 rounded-full border-border/60 hover:bg-muted/50" onClick={() => onEdit(r)}><Edit className="h-3.5 w-3.5 mr-2" />Edit</Button>
      <Button variant="destructive" size="sm" className="flex-none px-3 rounded-full shadow-sm" onClick={() => onDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
    </div>
  );
}
