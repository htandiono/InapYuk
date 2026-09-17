import { useState } from 'react';
import { toast } from 'sonner';

export async function doDeleteCategory(deletingId: string, setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>, fetchCategories: (p: number) => void, page: number, setDeletingId: React.Dispatch<React.SetStateAction<string | null>>) {
  setIsDeleting(true);
  try {
    const res = await fetch(`/api/categories/tenant/categories/${deletingId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).message);
    toast.success('Kategori berhasil dihapus');
    setDeletingId(null);
    fetchCategories(page);
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : String(err));
  } finally {
    setIsDeleting(false);
  }
}

export function useCategoryDelete(fetchCategories: (p: number) => void, page: number) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const confirmDelete = () => { if (!deletingId) return; void doDeleteCategory(deletingId, setIsDeleting, fetchCategories, page, setDeletingId); };
  return { deletingId, setDeletingId, isDeleting, confirmDelete };
}
