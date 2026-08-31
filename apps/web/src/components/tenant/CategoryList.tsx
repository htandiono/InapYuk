'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Plus, Tags, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import CategoryForm from './CategoryForm';

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

type PaginationProps = {
  page: number;
  totalPages: number;
  setPage: (val: number | ((p: number) => number)) => void;
  loading: boolean;
};

function PrevBtn({ page, loading, setPage }: PaginationProps) {
  return (
    <Button
      variant="outline"
      disabled={page === 1 || loading}
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      className="h-8 rounded-lg"
      size="sm"
    >
      Sebelumnya
    </Button>
  );
}

function NextBtn({ page, loading, totalPages, setPage }: PaginationProps) {
  return (
    <Button
      variant="outline"
      disabled={page === totalPages || loading}
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      className="h-8 rounded-lg"
      size="sm"
    >
      Selanjutnya
    </Button>
  );
}

function PaginationControls({ page, totalPages, setPage, loading }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-2 mt-6">
      <div className="text-sm text-muted-foreground hidden sm:block">
        Menampilkan halaman <span className="font-medium text-foreground">{page}</span> dari{' '}
        <span className="font-medium text-foreground">{totalPages}</span>
      </div>
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
        <PrevBtn page={page} totalPages={totalPages} setPage={setPage} loading={loading} />

        <div className="hidden sm:flex items-center gap-1 mx-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={page === p ? 'default' : 'ghost'}
              size="sm"
              className={`w-8 h-8 p-0 rounded-lg ${page !== p ? 'text-muted-foreground hover:text-foreground' : ''}`}
              onClick={() => setPage(p)}
              disabled={loading}
            >
              {p}
            </Button>
          ))}
        </div>

        <NextBtn page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
      </div>
    </div>
  );
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/tenant/categories?page=${currentPage}&limit=10`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setCategories(json.data.items || json.data); // depending on how sendPaginated formats it
      setTotalPages(json.data.meta?.totalPages || json.totalPages || 1);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengambil kategori');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchCategories(page));
  }, [page, fetchCategories]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/tenant/categories/${deletingId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      toast.success('Kategori berhasil dihapus');
      setDeletingId(null);
      fetchCategories(page);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm rounded-full px-6">
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kategori Baru</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSuccess={() => {
                setIsCreateOpen(false);
                fetchCategories(page);
              }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

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
              Array.from({ length: 5 }).map((_, i) => (
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
              ))
            ) : categories.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-12 px-4">
                    <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                      <Tags className="h-10 w-10 text-primary opacity-60" />
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-2">Belum ada kategori</h3>
                    <p className="text-center max-w-sm mb-8 text-sm">
                      Tambahkan kategori pertama Anda untuk mulai mengelola properti.
                    </p>
                    <Button
                      onClick={() => setIsCreateOpen(true)}
                      className="gap-2 shadow-sm rounded-full px-6"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Kategori
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-muted/30 transition-colors group border-b border-border/40"
                >
                  <TableCell className="font-medium text-foreground py-4 px-4">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden sm:table-cell py-4 px-4">
                    {c.slug}
                  </TableCell>
                  <TableCell className="text-right py-3 px-4">
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(c)}
                        className="h-9 shadow-sm rounded-lg px-3"
                      >
                        <Edit className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingId(c.id)}
                        className="h-9 shadow-sm rounded-lg px-3"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Hapus</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls page={page} totalPages={totalPages} setPage={setPage} loading={loading} />

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              initialData={editingCategory}
              onSuccess={() => {
                setEditingCategory(null);
                fetchCategories(page);
              }}
              onCancel={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => !open && !isDeleting && setDeletingId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeletingId(null)} disabled={isDeleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
