import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CategoryCreateDialog } from './CategoryCreateDialog';

interface Props {
  isCreateOpen: boolean;
  setIsCreateOpen: (o: boolean) => void;
  onSuccess: () => void;
}

export function CategoryListActionHeader({ isCreateOpen, setIsCreateOpen, onSuccess }: Props) {
  return (
    <div className="flex justify-end mb-6">
      <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm rounded-full px-6">
        <Plus className="h-4 w-4" /> Tambah Kategori
      </Button>
      <CategoryCreateDialog
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        onSuccess={onSuccess}
      />
    </div>
  );
}
