'use client';
import { api } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export type Category = { id: string; name: string };

export function usePropertyCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    api
      .get<{ items: Category[] } | Category[]>('/categories/tenant/categories?limit=100')
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && 'items' in data) {
          setCategories(data.items);
        } else {
          setCategories([]);
        }
      })
      .catch(() => toast.error('Gagal memuat kategori'));
  }, []);
  return categories;
}
