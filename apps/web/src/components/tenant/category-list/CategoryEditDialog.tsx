import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoryForm from '../CategoryForm';
import type { Category } from './types';

interface Props {
  editingCategory: Category | null;
  setEditingCategory: (c: Category | null) => void;
  onSuccess: () => void;
}

export function CategoryEditDialog({ editingCategory, setEditingCategory, onSuccess }: Props) {
  return (
    <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-md min-w-[320px]">
        <DialogHeader><DialogTitle>Edit Kategori</DialogTitle></DialogHeader>
        {editingCategory && <CategoryForm initialData={editingCategory} onSuccess={onSuccess} onCancel={() => setEditingCategory(null)} />}
      </DialogContent>
    </Dialog>
  );
}
