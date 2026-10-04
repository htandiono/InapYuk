import { Tags, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyCategory({ onAdd }: { onAdd: () => void }) {
  return (
    <tr className="hover:bg-transparent">
      <td colSpan={3} className="h-64 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground py-12 px-4">
          <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <Tags className="h-10 w-10 text-primary opacity-60" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">Belum ada kategori</h3>
          <p className="text-center max-w-sm mb-8 text-sm">
            Tambahkan kategori pertama Anda untuk mulai mengelola properti.
          </p>
          <Button onClick={onAdd} className="gap-2 shadow-sm rounded-full px-6">
            <Plus className="h-4 w-4" /> Tambah Kategori
          </Button>
        </div>
      </td>
    </tr>
  );
}
