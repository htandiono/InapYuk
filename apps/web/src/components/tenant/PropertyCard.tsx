import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MapPin, Settings, Edit, Trash2, MoreVertical } from 'lucide-react';
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

function PropertyMobileStackedData({ p }: { p: Property }) {
  const roomCount = p.rooms?.length || 0;
  return (
    <>
      <div className="flex flex-col gap-1.5 mt-1 sm:hidden"><Badge variant="secondary" className="w-fit text-[10px] bg-primary/10 text-primary py-0 px-1.5">{p.category?.name || 'Tanpa Kategori'}</Badge></div>
      <div className="flex flex-col mt-1.5 lg:hidden text-xs text-muted-foreground">{roomCount > 0 ? <span>{roomCount} Kamar</span> : <span className="italic">Belum ada kamar</span>}</div>
    </>
  );
}

function PropertyImage({ p }: { p: Property }) {
  return (
    <div className="h-16 w-20 sm:w-24 relative rounded-md overflow-hidden bg-muted shrink-0 shadow-sm border border-border/50">
      {p.images && p.images[0] ? <Image src={p.images[0].url} alt={p.name} fill sizes="(max-width: 640px) 80px, 96px" className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>}
    </div>
  );
}

function PropertyInfoCell({ p }: { p: Property }) {
  return (
    <TableCell className="py-4 px-4">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <PropertyImage p={p} />
        <div className="flex flex-col">
          <div className="font-semibold text-foreground text-sm sm:text-base leading-tight mb-1">{p.name}</div>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-1 mb-1.5 sm:mb-0"><MapPin className="h-3 sm:h-3.5 w-3 sm:w-3.5 shrink-0" /><span className="truncate max-w-32 sm:max-w-50">{p.city}</span></div>
          <PropertyMobileStackedData p={p} />
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

function PropertyMobileActions({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <div className="flex sm:hidden justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 px-0 rounded-full"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild><Link href={`/tenant/properties/${p.id}/rooms`} className="cursor-pointer flex items-center w-full"><Settings className="mr-2 h-4 w-4" />Kelola Kamar</Link></DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(p)} className="cursor-pointer flex items-center w-full"><Edit className="mr-2 h-4 w-4" />Edit Properti</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDelete(p.id)} className="text-destructive focus:text-destructive cursor-pointer flex items-center w-full"><Trash2 className="mr-2 h-4 w-4" />Hapus Properti</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function PropertyDesktopActions({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <div className="hidden sm:flex justify-end gap-2 items-center">
      <Link href={`/tenant/properties/${p.id}/rooms`}>
        <Button variant="outline" size="sm" className="h-9 px-0 w-9 xl:w-auto xl:px-3 shadow-sm rounded-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors flex items-center justify-center"><Settings className="h-4 w-4 xl:mr-2" /><span className="hidden xl:inline">Kelola Kamar</span></Button>
      </Link>
      <Button variant="outline" size="sm" onClick={() => onEdit(p)} className="h-9 px-0 w-9 xl:w-auto xl:px-3 shadow-sm rounded-lg flex items-center justify-center"><Edit className="h-4 w-4 xl:mr-2" /><span className="hidden xl:inline">Edit</span></Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete(p.id)} className="h-9 px-0 w-9 xl:w-auto xl:px-3 shadow-sm rounded-lg flex items-center justify-center"><Trash2 className="h-4 w-4 xl:mr-2" /><span className="hidden xl:inline">Hapus</span></Button>
    </div>
  );
}

function PropertyActionsCell({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <TableCell className="py-3 px-4 text-right">
      <PropertyMobileActions p={p} onEdit={onEdit} onDelete={onDelete} />
      <PropertyDesktopActions p={p} onEdit={onEdit} onDelete={onDelete} />
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
