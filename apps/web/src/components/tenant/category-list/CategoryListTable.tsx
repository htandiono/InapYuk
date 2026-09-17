import type { Category } from './types';
import { CategoryListRow } from './CategoryListRow';
import { CategoryListLoading } from './CategoryListLoading';
import { EmptyCategory } from './EmptyCategory';

function TableHeader() {
  return (
    <tr className="hover:bg-transparent border-b border-border/40">
      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground text-left">Nama</th>
      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-foreground w-45">Aksi</th>
    </tr>
  );
}

function TableBody({ loading, categories, onEdit, onDelete, onAdd }: { loading: boolean; categories: Category[]; onEdit: (c: Category) => void; onDelete: (id: string) => void; onAdd: () => void }) {
  if (loading) return <CategoryListLoading />;
  if (categories.length === 0) return <EmptyCategory onAdd={onAdd} />;
  return categories.map((c) => <CategoryListRow key={c.id} c={c} onEdit={() => onEdit(c)} onDelete={() => onDelete(c.id)} />);
}

export function CategoryListTable({ loading, categories, onEdit, onDelete, onAdd }: { loading: boolean; categories: Category[]; onEdit: (c: Category) => void; onDelete: (id: string) => void; onAdd: () => void; }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm overflow-hidden">
      <table className="w-full">
        <thead><TableHeader /></thead>
        <tbody><TableBody loading={loading} categories={categories} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd} /></tbody>
      </table>
    </div>
  );
}
