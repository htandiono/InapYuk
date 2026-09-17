import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { Category } from './types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]), [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1), [loading, setLoading] = useState(true);
  const fetchCategories = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/tenant/categories?page=${currentPage}&limit=10`); const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setCategories(json.data.items || json.data); setTotalPages(json.data.meta?.totalPages || json.totalPages || 1);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Gagal mengambil kategori'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(() => fetchCategories(page)); }, [page, fetchCategories]);
  return { categories, page, setPage, totalPages, loading, fetchCategories };
}
