import { Button } from '@/components/ui/button';
import type { Category } from './types';

export function CategoryListRow({ c, onEdit, onDelete }: { c: Category; onEdit: () => void; onDelete: () => void }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors group border-b border-border/40">
      <td className="font-medium text-foreground py-4 px-4">{c.name}</td>
      <td className="text-sm text-muted-foreground hidden sm:table-cell py-4 px-4">{c.slug}</td>
      <td className="text-right py-3 px-4">
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onEdit} className="h-9 shadow-sm rounded-lg px-3"><span className="hidden sm:inline">Edit</span></Button>
          <Button variant="destructive" size="sm" onClick={onDelete} className="h-9 shadow-sm rounded-lg px-3"><span className="hidden sm:inline">Hapus</span></Button>
        </div>
      </td>
    </tr>
  );
}
