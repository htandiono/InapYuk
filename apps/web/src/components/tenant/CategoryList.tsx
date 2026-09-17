'use client';
import { useState } from 'react';
import { useCategories } from './category-list/useCategories';
import { useCategoryDelete } from './category-list/useCategoryDelete';
import { CategoryListActionHeader } from './category-list/CategoryListActionHeader';
import { CategoryListTable } from './category-list/CategoryListTable';
import { CategoryEditDialog } from './category-list/CategoryEditDialog';
import { CategoryDeleteDialog } from './category-list/CategoryDeleteDialog';
import { PaginationControls } from './PaginationControls';
import type { Category } from './category-list/types';

export default function CategoryList() {
  const { categories, page, setPage, totalPages, loading, fetchCategories } = useCategories();
  const [isCreateOpen, setIsCreateOpen] = useState(false), [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { deletingId, setDeletingId, isDeleting, confirmDelete } = useCategoryDelete(fetchCategories, page);
  return (
    <div>
      <CategoryListActionHeader isCreateOpen={isCreateOpen} setIsCreateOpen={setIsCreateOpen} onSuccess={() => { setIsCreateOpen(false); fetchCategories(page); }} />
      <CategoryListTable loading={loading} categories={categories} onEdit={setEditingCategory} onDelete={setDeletingId} onAdd={() => setIsCreateOpen(true)} />
      <PaginationControls page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
      <CategoryEditDialog editingCategory={editingCategory} setEditingCategory={setEditingCategory} onSuccess={() => { setEditingCategory(null); fetchCategories(page); }} />
      <CategoryDeleteDialog deletingId={deletingId} isDeleting={isDeleting} onOpenChange={(open) => !open && !isDeleting && setDeletingId(null)} onCancel={() => setDeletingId(null)} onConfirm={confirmDelete} />
    </div>
  );
}
