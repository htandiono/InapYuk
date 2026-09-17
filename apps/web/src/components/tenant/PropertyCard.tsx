import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { MapPin, Settings, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface Property {
  id: string;
  name: string;
  city: string;
  province?: string;
  address?: string;
  description?: string;
  categoryId?: string;
  category?: { id: string; name: string };
  images?: { id: string; url: string }[];
  rooms?: { name: string; basePrice: number | string }[];
}

export type PropertyCardProps = {
  p: Property;
  onEdit: (p: Property) => void;
  onDelete: (id: string) => void;
};

function PropertyInfoCell({ p }: { p: Property }) {
  return (
    <TableCell className="py-4 px-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-24 relative rounded-md overflow-hidden bg-muted shrink-0 shadow-sm border border-border/50">
          {p.images && p.images[0] ? <Image src={p.images[0].url} alt={p.name} fill sizes="96px" className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>}
        </div>
        <div>
          <div className="font-semibold text-foreground text-base leading-tight mb-1">{p.name}</div>
          <div className="flex items-center text-sm text-muted-foreground gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate max-w-50">{p.city}</span></div>
        </div>
      </div>
    </TableCell>
  );
}

function PropertyCategoryCell({ category }: { category?: { id: string; name: string } }) {
  return (
    <TableCell className="py-4 px-4 hidden sm:table-cell">
      <Badge variant="secondary" className="bg-primary/10 text-primary font-medium hover:bg-primary/10">{category?.name || 'Tanpa Kategori'}</Badge>
    </TableCell>
  );
}

function PropertyRoomsCell({ rooms }: { rooms?: { name: string }[] }) {
  const roomCount = rooms?.length || 0;
  return (
    <TableCell className="py-4 px-4 hidden lg:table-cell">
      {roomCount > 0 ? (
        <div className="flex flex-col"><span className="text-sm font-medium text-foreground">{roomCount} Tipe Kamar</span><span className="text-xs text-muted-foreground truncate max-w-50">{rooms?.map((r) => r.name).join(', ')}</span></div>
      ) : <span className="text-sm text-muted-foreground italic">Belum ada kamar</span>}
    </TableCell>
  );
}

function PropertyActionsCell({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <TableCell className="py-3 px-4 text-right">
      <div className="flex justify-end gap-3 items-center">
        <Link href={`/tenant/properties/${p.id}/rooms`}>
          <Button variant="outline" size="sm" className="h-9 shadow-sm rounded-lg px-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Settings className="h-4 w-4 xl:mr-2" /><span className="hidden xl:inline">Kelola Kamar</span></Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => onEdit(p)} className="h-9 shadow-sm rounded-lg px-3"><Edit className="h-4 w-4 xl:mr-2" /><span className="hidden xl:inline">Edit</span></Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(p.id)} className="h-9 shadow-sm rounded-lg px-3"><Trash2 className="h-4 w-4 xl:mr-2" /><span className="hidden xl:inline">Hapus</span></Button>
      </div>
    </TableCell>
  );
}

export function PropertyTableRow({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors group border-b border-border/40">
      <PropertyInfoCell p={p} />
      <PropertyCategoryCell category={p.category} />
      <PropertyRoomsCell rooms={p.rooms} />
      <PropertyActionsCell p={p} onEdit={onEdit} onDelete={onDelete} />
    </TableRow>
  );
}
