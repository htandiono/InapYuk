'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface State {
  categories: Category[];
  page: number;
  totalPages: number;
  loading: boolean;
}

export function useCategoryList() {
  const [state, setState] = useState<State>({
    categories: [],
    page: 1,
    totalPages: 1,
    loading: true,
  });

  const fetchCategories = useCallback(async (currentPage: number) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/categories/tenant/categories?page=${currentPage}&limit=10`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setState({
        categories: json.data.items || json.data,
        page: currentPage,
        totalPages: json.data.meta?.totalPages || json.totalPages || 1,
        loading: false,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengambil kategori');
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchCategories(state.page));
  }, [state.page, fetchCategories]);

  const setPage = (val: number | ((p: number) => number)) => {
    const next = typeof val === 'function' ? val(state.page) : val;
    setState((s) => ({ ...s, page: next }));
  };

  return { ...state, setPage, fetchCategories };
}
