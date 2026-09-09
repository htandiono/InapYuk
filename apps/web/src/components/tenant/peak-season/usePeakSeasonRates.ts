import { useCallback, useState } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { PeakRate } from './types';

export function usePeakSeasonRates(roomId: string | null) {
  const [rates, setRates] = useState<PeakRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchRates = useCallback(async () => {
    if (!roomId) return;
    setFetching(true);
    try {
      const res = await api.get<PeakRate[]>(`/rooms/tenant/rooms/${roomId}/peak-season`);
      setRates(res);
    } catch {
      toast.error('Gagal memuat harga musiman');
    } finally {
      setFetching(false);
    }
  }, [roomId]);

  const addRate = async (data: Omit<PeakRate, 'id'>) => {
    if (!roomId) return false;
    setLoading(true);
    try {
      await api.post(`/rooms/tenant/rooms/${roomId}/peak-season`, data);
      toast.success('Harga musiman berhasil ditambahkan');
      await fetchRates();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRate = async (rateId: string) => {
    try {
      await api.delete(`/rooms/tenant/peak-season/${rateId}`);
      toast.success('Berhasil dihapus');
      await fetchRates();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return { rates, fetching, loading, fetchRates, addRate, deleteRate };
}
