'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  deletingId: string | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDeleteDialog({ deletingId, isDeleting, onConfirm, onOpenChange }: Props) {
  return (
    <Dialog open={!!deletingId} onOpenChange={(open) => !open && !isDeleting && onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
        </DialogHeader>
        <DeleteBody />
        <DeleteActions
          isDeleting={isDeleting}
          onConfirm={onConfirm}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function DeleteBody() {
  return (
    <div className="py-4">
      <p className="text-muted-foreground">
        Apakah Anda yakin ingin menghapus properti ini? Tindakan ini tidak dapat dibatalkan.
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
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 mt-4">
      <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
        Batal
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          void onConfirm();
        }}
        disabled={isDeleting}
      >
        {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
      </Button>
    </div>
  );
}
