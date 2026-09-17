'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PropertyTableRow, type Property } from './PropertyCard';
import PropertyForm from './PropertyFormNew';
import { useFullProperty } from './PropertyListHooks';
import { TableLoadingRow, TableEmptyRow } from './PropertyListRows';

export function CreateDialog({
  open,
  setOpen,
  onDone,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onDone: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Properti Baru</DialogTitle>
        </DialogHeader>
        <PropertyForm onSuccess={onDone} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function EditDialog({
  p,
  setP,
  onDone,
}: {
  p: Property | null;
  setP: (p: Property | null) => void;
  onDone: () => void;
}) {
  const { fullProp, loadingFull } = useFullProperty(p);
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && setP(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Properti</DialogTitle>
        </DialogHeader>
        {loadingFull && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
        {!loadingFull && fullProp && (
          <PropertyForm initialData={fullProp} onSuccess={onDone} onCancel={() => setP(null)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PropertyListHeader({ setIsCreateOpen }: { setIsCreateOpen: (v: boolean) => void }) {
  return (
    <div className="flex justify-end mb-6">
      <button
        onClick={() => setIsCreateOpen(true)}
        className="shadow-sm rounded-full px-6 py-2 bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
      >
        Tambah Properti
      </button>
    </div>
  );
}

export function PropertyListTable({
  loading,
  properties,
  setEditingProperty,
  setDeletingId,
}: {
  loading: boolean;
  properties: Property[];
  setEditingProperty: (p: Property | null) => void;
  setDeletingId: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="hover:bg-transparent border-b border-border/40">
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground">
              Properti
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hidden sm:table-cell w-45">
              Kategori
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hidden lg:table-cell w-55">
              Detail Kamar
            </th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-foreground w-[320px]">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <TableLoadingRow key={i} />)
          ) : properties.length === 0 ? (
            <TableEmptyRow />
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
        </tbody>
      </table>
    </div>
  );
}

export function DeleteConfirmation({
  deletingId,
  isDeleting,
  setDeletingId,
  confirmDelete,
}: {
  deletingId: string | null;
  isDeleting: boolean;
  setDeletingId: (id: string | null) => void;
  confirmDelete: () => Promise<void>;
}) {
  return (
    <Dialog
      open={!!deletingId}
      onOpenChange={(open) => !open && !isDeleting && setDeletingId(null)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            Apakah Anda yakin ingin menghapus properti ini? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setDeletingId(null)}
            disabled={isDeleting}
            className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Batal
          </button>
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-md bg-destructive text-white hover:bg-destructive/90 transition-colors"
          >
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
