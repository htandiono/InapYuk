'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import CategoryForm from './CategoryForm';
import { CategoryTable } from './CategoryTable';
import { PaginationControls } from './PaginationControls';
import { CategoryDeleteDialog } from './CategoryDeleteDialog';
import type { Category } from './useCategoryList';
import { useCategoryList } from './useCategoryList';

function CategoryAddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="gap-2 shadow-sm rounded-full px-6">
      <Plus className="h-4 w-4" /> Tambah Kategori
    </Button>
  );
}

export default function CategoryList() {
  const { categories, page, totalPages, loading, setPage, fetchCategories } = useCategoryList();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-6">
        <CategoryAddButton onClick={() => setIsCreateOpen(true)} />
      </div>
      <CategoryTable
        categories={categories}
        loading={loading}
        onEdit={setEditingCategory}
        onDelete={setDeletingId}
      />
      <PaginationControls page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
      <CreateDialog
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        page={page}
        fetchCategories={fetchCategories}
      />
      <EditDialog
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        page={page}
        fetchCategories={fetchCategories}
      />
      <CategoryDeleteDialog
        open={!!deletingId}
        deletingId={deletingId}
        isDeleting={false}
        onConfirm={() => {
          setDeletingId(null);
          void fetchCategories(page);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

function CreateDialog({
  isCreateOpen,
  setIsCreateOpen,
  page,
  fetchCategories,
}: {
  isCreateOpen: boolean;
  setIsCreateOpen: (v: boolean) => void;
  page: number;
  fetchCategories: (p: number) => void;
}) {
  return (
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
  );
}

function EditDialog({
  editingCategory,
  setEditingCategory,
  page,
  fetchCategories,
}: {
  editingCategory: Category | null;
  setEditingCategory: (c: Category | null) => void;
  page: number;
  fetchCategories: (p: number) => void;
}) {
  if (!editingCategory) return null;
  return (
    <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
        </DialogHeader>
        <CategoryForm
          initialData={editingCategory}
          onSuccess={() => {
            setEditingCategory(null);
            fetchCategories(page);
          }}
          onCancel={() => setEditingCategory(null)}
        />
      </DialogContent>
    </Dialog>
  );
}
