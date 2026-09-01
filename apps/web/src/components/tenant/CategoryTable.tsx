'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';
import { CategoryRow } from './CategoryRow';

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface Props {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryTable({ categories, loading, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/40">
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground">
              Nama
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hidden sm:table-cell">
              Slug
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-foreground w-45">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <LoadingRows />
          ) : categories.length === 0 ? (
            <EmptyState />
          ) : (
            categories.map((c) => (
              <CategoryRow key={c.id} category={c} onEdit={onEdit} onDelete={onDelete} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-b border-border/40">
          <TableCell className="h-16">
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell className="h-16 hidden sm:table-cell">
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell className="h-16 text-right">
            <Skeleton className="h-8 w-8 ml-auto rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={3} className="h-64 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground py-12 px-4">
          <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-primary opacity-60" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">Belum ada kategori</h3>
          <p className="text-center max-w-sm mb-8 text-sm">
            Tambahkan kategori pertama Anda untuk mulai mengelola properti.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
