'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  deletingId: string | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CategoryDeleteDialog({ open, isDeleting, onConfirm, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isDeleting && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
        </DialogHeader>
        <DeleteBody />
        <DeleteActions isDeleting={isDeleting} onConfirm={onConfirm} onCancel={onCancel} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteBody() {
  return (
    <div className="py-4">
      <p className="text-muted-foreground">
        Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
      </p>
    </div>
  );
}

function DeleteActions({
  isDeleting,
  onConfirm,
  onCancel,
}: {
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 mt-4">
      <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
        Batal
      </Button>
      <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
      </Button>
    </div>
  );
}
