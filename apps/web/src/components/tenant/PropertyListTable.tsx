'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';
import { PropertyTableRow, type Property } from './PropertyCard';

interface Props {
  loading: boolean;
  properties: Property[];
  setEditingProperty: (p: Property) => void;
  setDeletingId: (id: string) => void;
}

export function PropertyListTable({
  loading,
  properties,
  setEditingProperty,
  setDeletingId,
}: Props) {
  return (
    <div className="rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/40">
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground">
              Properti
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hidden sm:table-cell w-45">
              Kategori
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hidden lg:table-cell w-55">
              Detail Kamar
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-foreground w-[320px]">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <LoadingRows />
          ) : properties.length === 0 ? (
            <EmptyState />
          ) : (
            properties.map((p) => (
              <PropertyTableRow
                key={p.id}
                p={p}
                onEdit={setEditingProperty}
                onDelete={setDeletingId}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-b border-border/40">
          <TableCell className="h-24">
            <LoadingCellContent />
          </TableCell>
          <TableCell className="h-24 hidden sm:table-cell">
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>
          <TableCell className="h-24 hidden lg:table-cell">
            <LoadingDetailCell />
          </TableCell>
          <TableCell className="h-24 text-right">
            <LoadingActionsCell />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function LoadingCellContent() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-24 rounded-md shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function LoadingDetailCell() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function LoadingActionsCell() {
  return (
    <div className="flex justify-end gap-2">
      <Skeleton className="h-9 w-28 rounded-lg" />
      <Skeleton className="h-9 w-20 rounded-lg" />
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  );
}

function EmptyState() {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={4} className="h-100 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-primary opacity-60" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">Belum ada properti</h3>
          <p className="text-center max-w-sm mb-8 text-sm text-muted-foreground">
            Anda belum memiliki properti. Tambahkan properti pertama Anda untuk mulai menyewakan.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
