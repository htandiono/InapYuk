import { useState } from 'react';
import { toast } from 'sonner';

export function useCategoryDelete(fetchCategories: (p: number) => void, page: number) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/tenant/categories/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success('Kategori berhasil dihapus');
      setDeletingId(null); fetchCategories(page);
    } catch (err: any) { toast.error(err.message || String(err)); } finally { setIsDeleting(false); }
  };
  return { deletingId, setDeletingId, isDeleting, confirmDelete };
}
