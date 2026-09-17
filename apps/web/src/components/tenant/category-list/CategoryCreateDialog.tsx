import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoryForm from '../CategoryForm';

interface Props {
  isCreateOpen: boolean;
  setIsCreateOpen: (o: boolean) => void;
  onSuccess: () => void;
}

export function CategoryCreateDialog({ isCreateOpen, setIsCreateOpen, onSuccess }: Props) {
  return (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-md min-w-[320px]">
        <DialogHeader>
          <DialogTitle>Kategori Baru</DialogTitle>
        </DialogHeader>
        <CategoryForm onSuccess={onSuccess} onCancel={() => setIsCreateOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
