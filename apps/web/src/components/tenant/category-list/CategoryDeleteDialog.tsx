import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  deletingId: string | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CategoryDeleteDialog({ deletingId, isDeleting, onOpenChange, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={!!deletingId} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-md min-w-[320px]">
        <DialogHeader><DialogTitle>Konfirmasi Hapus</DialogTitle></DialogHeader>
        <div className="py-4"><p className="text-muted-foreground">Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.</p></div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>Batal</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
