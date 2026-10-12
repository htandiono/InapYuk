import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Edit, Trash2, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import type { PropertyCardProps, Property } from './PropertyCard';

function ManageRoomsMenuItem({ propertyId }: { propertyId: string }) {
  return (
    <Link href={`/tenant/properties/${propertyId}/rooms`} className="w-full block">
      <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
        <Settings className="h-4 w-4" />
        <span>Kelola Kamar</span>
      </DropdownMenuItem>
    </Link>
  );
}

function EditPropertyMenuItem({ onEdit, p }: { onEdit: (p: Property) => void; p: Property }) {
  return (
    <DropdownMenuItem
      onClick={() => onEdit(p)}
      className="cursor-pointer flex items-center gap-2 w-full"
    >
      <Edit className="h-4 w-4" />
      <span>Edit Properti</span>
    </DropdownMenuItem>
  );
}

function DeletePropertyMenuItem({ onDelete, p }: { onDelete: (id: string) => void; p: Property }) {
  return (
    <DropdownMenuItem
      onClick={() => onDelete(p.id)}
      className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 w-full"
    >
      <Trash2 className="h-4 w-4" />
      <span>Hapus Properti</span>
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

type ActionBtnProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'outline' | 'destructive';
};

const baseBtnClass =
  'h-9 px-0 w-9 xl:w-auto xl:px-3 shadow-sm rounded-lg flex items-center justify-center';

function getBtnColors(variant?: 'outline' | 'destructive') {
  return variant === 'destructive'
    ? 'text-destructive hover:bg-destructive/10'
    : 'hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors';
}

function DesktopActionButton({ children, href, onClick, variant }: ActionBtnProps) {
  const btn = (
    <Button
      variant={variant || 'outline'}
      size="sm"
      onClick={onClick}
      className={`${baseBtnClass} ${getBtnColors(variant)}`}
    >
      {children}
    </Button>
  );
  return href ? <Link href={href}>{btn}</Link> : btn;
}

function RoomAndEditButtons({ p, onEdit }: { p: Property; onEdit: (p: Property) => void }) {
  return (
    <>
      <DesktopActionButton href={`/tenant/properties/${p.id}/rooms`}>
        <Settings className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline">Kelola Kamar</span>
      </DesktopActionButton>
      <DesktopActionButton onClick={() => onEdit(p)}>
        <Edit className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline">Edit</span>
      </DesktopActionButton>
    </>
  );
}

function DesktopActionButtons({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <div className="hidden sm:flex justify-end gap-2 items-center">
      <RoomAndEditButtons p={p} onEdit={onEdit} />
      <DesktopActionButton onClick={() => onDelete(p.id)} variant="destructive">
        <Trash2 className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline">Hapus</span>
      </DesktopActionButton>
    </div>
  );
}

export function PropertyActionsCell({ p, onEdit, onDelete }: PropertyCardProps) {
  return (
    <TableCell className="py-3 px-4 text-right">
      <div className="sm:hidden flex justify-end">
        <MobileActionMenu p={p} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <DesktopActionButtons p={p} onEdit={onEdit} onDelete={onDelete} />
    </TableCell>
  );
}
