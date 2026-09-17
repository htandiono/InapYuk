import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { Category } from './types';

function CategoryActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-2 sm:gap-3">
      <Button variant="outline" size="sm" onClick={onEdit} className="h-9 shadow-sm rounded-lg px-2.5 sm:px-3"><Pencil className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Edit</span></Button>
      <Button variant="destructive" size="sm" onClick={onDelete} className="h-9 shadow-sm rounded-lg px-2.5 sm:px-3"><Trash2 className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Hapus</span></Button>
    </div>
  );
}

export function CategoryListRow({ c, onEdit, onDelete }: { c: Category; onEdit: () => void; onDelete: () => void; }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors group border-b border-border/40">
      <td className="font-medium text-foreground py-4 px-4">{c.name}</td>
      <td className="text-right py-3 px-4"><CategoryActionButtons onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
  );
}
