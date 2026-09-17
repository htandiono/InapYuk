import { useState } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { PeakRate } from './types';

function doFetchRates(roomId: string | null, setRates: React.Dispatch<React.SetStateAction<PeakRate[]>>, setFetching: React.Dispatch<React.SetStateAction<boolean>>) {
  if (!roomId) return;
  setFetching(true);
  api.get<PeakRate[]>(`/rooms/tenant/rooms/${roomId}/peak-season`).then(setRates).catch(() => toast.error('Gagal memuat harga musiman')).finally(() => setFetching(false));
}

function doAddRate(roomId: string | null, setLoading: React.Dispatch<React.SetStateAction<boolean>>, fetchRates: () => void, data: Omit<PeakRate, 'id'>) {
  if (!roomId) return Promise.resolve(false);
  setLoading(true);
  return api.post(`/rooms/tenant/rooms/${roomId}/peak-season`, data).then(async () => {
    toast.success('Harga musiman berhasil ditambahkan');
    await fetchRates();
    return true;
  }).catch((err: unknown) => {
    toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    return false;
  }).finally(() => setLoading(false));
}

function doDeleteRate(rateId: string, fetchRates: () => void) {
  api.delete(`/rooms/tenant/peak-season/${rateId}`).then(() => {
    toast.success('Berhasil dihapus');
    fetchRates();
  }).catch((err: unknown) => {
    toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
  });
}

export function usePeakSeasonRates(roomId: string | null) {
  const [rates, setRates] = useState<PeakRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchRates = () => doFetchRates(roomId, setRates, setFetching);
  const addRate = (data: Omit<PeakRate, 'id'>) => doAddRate(roomId, setLoading, fetchRates, data);
  const deleteRate = (rateId: string) => doDeleteRate(rateId, fetchRates);

  return { rates, fetching, loading, fetchRates, addRate, deleteRate };
}
