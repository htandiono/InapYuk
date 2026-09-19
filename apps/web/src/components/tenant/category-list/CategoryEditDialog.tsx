import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoryForm from '../CategoryForm';
import type { Category } from './types';

interface Props { editingCategory: Category | null; setEditingCategory: (c: Category | null) => void; onSuccess: () => void; }

export function CategoryEditDialog({ editingCategory, setEditingCategory, onSuccess }: Props) {
  return (
    <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Kategori</DialogTitle></DialogHeader>
        {editingCategory && <CategoryForm initialData={editingCategory} onSuccess={onSuccess} onCancel={() => setEditingCategory(null)} />}
      </DialogContent>
    </Dialog>
  );
}
