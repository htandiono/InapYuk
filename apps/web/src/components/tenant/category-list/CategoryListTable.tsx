import type { Category } from './types';
import { CategoryListRow } from './CategoryListRow';
import { CategoryListLoading } from './CategoryListLoading';
import { EmptyCategory } from './EmptyCategory';

export function CategoryListTable({ loading, categories, onEdit, onDelete, onAdd }: { loading: boolean; categories: Category[]; onEdit: (c: Category) => void; onDelete: (id: string) => void; onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="hover:bg-transparent border-b border-border/40">
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground text-left">Nama</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hidden sm:table-cell text-left">Slug</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-foreground w-45">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <CategoryListLoading /> : categories.length === 0 ? <EmptyCategory onAdd={onAdd} /> : categories.map(c => <CategoryListRow key={c.id} c={c} onEdit={() => onEdit(c)} onDelete={() => onDelete(c.id)} />)}
        </tbody>
      </table>
    </div>
  );
}
