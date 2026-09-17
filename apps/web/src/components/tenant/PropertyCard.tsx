import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MapPin, Settings, Edit, Trash2, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface Property {
  id: string; name: string; city: string; province?: string;
  address?: string; description?: string; categoryId?: string;
  category?: { id: string; name: string };
  images?: { id: string; url: string }[];
  rooms?: { name: string; basePrice: number | string }[];
}

export type PropertyCardProps = {
  p: Property; onEdit: (p: Property) => void; onDelete: (id: string) => void;
};

function PropertyImageCell({ p }: { p: Property }) {
  return (
    <div className="h-16 w-20 sm:w-24 relative rounded-md overflow-hidden bg-muted shrink-0 shadow-sm border border-border/50">
      {p.images?.[0] ? (
        <Image src={p.images[0].url} alt={p.name} fill sizes="(max-width: 640px) 80px, 96px" className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
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

function PropertyMainInfo({ p }: { p: Property }) {
  return (
    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
      <PropertyImageCell p={p} />
      <div className="flex flex-col gap-1.5">
        <div className="font-semibold text-foreground text-sm sm:text-base leading-tight">{p.name}</div>
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-1">
          <MapPin className="h-3 sm:h-3.5 w-3 sm:w-3.5 shrink-0" />
          <span className="truncate max-w-32 sm:max-w-50">{p.city}</span>
        </div>
        <MobileDataDisplay p={p} />
      </div>
    </div>
  );
}

function PropertyInfoCell({ p }: { p: Property }) {
  return <TableCell className="py-4 px-4"><PropertyMainInfo p={p} /></TableCell>;
}

function CategoryBadge({ name }: { name?: string }) {
  return (
    <Badge variant="secondary" className="bg-primary/10 text-primary font-medium hover:bg-primary/10">
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

function PropertyRoomsCell({ rooms }: { rooms?: { name: string }[] }) {
  const count = rooms?.length || 0;
  if (count === 0) {
    return <TableCell className="py-4 px-4 hidden lg:table-cell"><span className="text-sm text-muted-foreground italic">Belum ada kamar</span></TableCell>;
  }
  return (
    <TableCell className="py-4 px-4 hidden lg:table-cell">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{count} Tipe Kamar</span>
        <span className="text-xs text-muted-foreground truncate max-w-50">{RoomListText({ rooms })}</span>
      </div>
    </TableCell>
  );
}

function ManageRoomsMenuItem({ propertyId }: { propertyId: string }) {
  return (
    <Link href={`/tenant/properties/${propertyId}/rooms`} className="w-full block">
      <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
        <Settings className="h-4 w-4" /><span>Kelola Kamar</span>
      </DropdownMenuItem>
    </Link>
  );
}

function EditPropertyMenuItem({ onEdit, p }: { onEdit: (p: Property) => void; p: Property }) {
  return (
    <DropdownMenuItem onClick={() => onEdit(p)} className="cursor-pointer flex items-center gap-2 w-full">
      <Edit className="h-4 w-4" /><span>Edit Properti</span>
    </DropdownMenuItem>
  );
}

function DeletePropertyMenuItem({ onDelete, p }: { onDelete: (id: string) => void; p: Property }) {
  return (
    <DropdownMenuItem onClick={() => onDelete(p.id)} className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 w-full">
      <Trash2 className="h-4 w-4" /><span>Hapus Properti</span>
    </DropdownMenuItem>
  );
}

function MobileActionMenuContent({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <>
      <ManageRoomsMenuItem propertyId={p.id} />
      <EditPropertyMenuItem onEdit={onEdit} p={p} />
      <DropdownMenuSeparator />
      <DeletePropertyMenuItem onDelete={onDelete} p={p} />
    </>
  );
}

function MobileActionMenu({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 px-0 rounded-full flex items-center justify-center hover:bg-accent">
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <MobileActionMenuContent p={p} onEdit={onEdit} onDelete={onDelete} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopActionButton({ children, href, onClick, variant }: {
  children: React.ReactNode; href?: string; onClick?: () => void; variant?: 'outline' | 'destructive'
}) {
  const btn = (
    <Button variant={variant || 'outline'} size="sm" onClick={onClick} className={`h-9 px-0 w-9 xl:w-auto xl:px-3 shadow-sm rounded-lg flex items-center justify-center ${variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors'}`}>
      {children}
    </Button>
  );
  return href ? <Link href={href}>{btn}</Link> : btn;
}

function DesktopActionButtons({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <div className="hidden sm:flex justify-end gap-2 items-center">
      <DesktopActionButton href={`/tenant/properties/${p.id}/rooms`}>
        <Settings className="h-4 w-4 xl:mr-2" /><span className="hidden xl:inline">Kelola Kamar</span>
      </DesktopActionButton>
      <DesktopActionButton onClick={() => onEdit(p)}>
        <Edit className="h-4 w-4 xl:mr-2" /><span className="hidden xl:inline">Edit</span>
      </DesktopActionButton>
      <DesktopActionButton onClick={() => onDelete(p.id)} variant="destructive">
        <Trash2 className="h-4 w-4 xl:mr-2" /><span className="hidden xl:inline">Hapus</span>
      </DesktopActionButton>
    </div>
  );
}

function PropertyActionsCell({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <TableCell className="py-3 px-4 text-right">
      <MobileActionMenu p={p} onEdit={onEdit} onDelete={onDelete} />
      <DesktopActionButtons p={p} onEdit={onEdit} onDelete={onDelete} />
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
