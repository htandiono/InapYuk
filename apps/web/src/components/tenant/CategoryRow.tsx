'use client';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface Props {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryRow({ category, onEdit, onDelete }: Props) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors group border-b border-border/40">
      <TableCell className="font-medium text-foreground py-4 px-4">{category.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground hidden sm:table-cell py-4 px-4">
        {category.slug}
      </TableCell>
      <TableCell className="text-right py-3 px-4">
        <ActionButtons onEdit={() => onEdit(category)} onDelete={() => onDelete(category.id)} />
      </TableCell>
    </TableRow>
  );
}

function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-3">
      <EditButton onClick={onEdit} />
      <DeleteButton onClick={onDelete} />
    </div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="h-9 shadow-sm rounded-lg px-3">
      <Edit className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Edit</span>
    </Button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      className="h-9 shadow-sm rounded-lg px-3"
    >
      <Trash2 className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Hapus</span>
    </Button>
  );
}
