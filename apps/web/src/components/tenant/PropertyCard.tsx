import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import { PropertyActionsCell } from './PropertyActionCells';

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

function PropertyPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
      No Image
    </div>
  );
}

function PropertyCoverImage({ url, name }: { url: string; name: string }) {
  return (
    <Image
      src={url}
      alt={name}
      fill
      sizes="(max-width: 640px) 80px, 96px"
      className="object-cover"
    />
  );
}

function PropertyImageCell({ p }: { p: Property }) {
  return (
    <div className="h-16 w-20 sm:w-24 relative rounded-md overflow-hidden bg-muted shrink-0 shadow-sm border border-border/50">
      {p.images?.[0] ? (
        <PropertyCoverImage url={p.images[0].url} name={p.name} />
      ) : (
        <PropertyPlaceholder />
      )}
    </div>
  );
}

function MobileDataDisplay({ p }: { p: Property }) {
  const count = p.rooms?.length || 0;
  return (
    <>
      <div className="sm:hidden">
        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary py-0 px-1.5">
          {p.category?.name || 'Tanpa Kategori'}
        </Badge>
      </div>
      <div className="lg:hidden text-xs text-muted-foreground">
        {count > 0 ? <span>{count} Kamar</span> : <span className="italic">Belum ada kamar</span>}
      </div>
    </>
  );
}

function PropertyCity({ city }: { city: string }) {
  return (
    <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-1">
      <MapPin className="h-3 sm:h-3.5 w-3 sm:w-3.5 shrink-0" />
      <span className="truncate max-w-32 sm:max-w-50">{city}</span>
    </div>
  );
}

function PropertyMainInfo({ p }: { p: Property }) {
  return (
    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
      <PropertyImageCell p={p} />
      <div className="flex flex-col gap-1.5">
        <div className="font-semibold text-foreground text-sm sm:text-base leading-tight">
          {p.name}
        </div>
        <PropertyCity city={p.city} />
        <MobileDataDisplay p={p} />
      </div>
    </div>
  );
}

function PropertyInfoCell({ p }: { p: Property }) {
  return (
    <TableCell className="py-4 px-4">
      <PropertyMainInfo p={p} />
    </TableCell>
  );
}

function CategoryBadge({ name }: { name?: string }) {
  return (
    <Badge
      variant="secondary"
      className="bg-primary/10 text-primary font-medium hover:bg-primary/10"
    >
      {name || 'Tanpa Kategori'}
    </Badge>
  );
}

function PropertyCategoryCell({ category }: { category?: { id: string; name: string } }) {
  return (
    <TableCell className="py-4 px-4 hidden sm:table-cell">
      <CategoryBadge name={category?.name} />
    </TableCell>
  );
}

function RoomListText({ rooms }: { rooms?: { name: string }[] }) {
  return rooms?.map((r) => r.name).join(', ') ?? '';
}

function EmptyRoomsCell() {
  return (
    <TableCell className="py-4 px-4 hidden lg:table-cell">
      <span className="text-sm text-muted-foreground italic">Belum ada kamar</span>
    </TableCell>
  );
}

function PropertyRoomsCell({ rooms }: { rooms?: { name: string }[] }) {
  const count = rooms?.length || 0;
  if (count === 0) return <EmptyRoomsCell />;
  return (
    <TableCell className="py-4 px-4 hidden lg:table-cell">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{count} Tipe Kamar</span>
        <span className="text-xs text-muted-foreground truncate max-w-50">
          {RoomListText({ rooms })}
        </span>
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
