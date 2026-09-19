import { useState } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

export type AvailabilityData = {
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  availableUnits: string;
};

export function useAvailability(roomId: string | null, onClose: () => void) {
  const [loading, setLoading] = useState(false);

  const updateAvailability = async (data: AvailabilityData) => {
    if (!roomId) return;
    setLoading(true);
    try {
      await api.put(`/rooms/tenant/rooms/${roomId}/availability`, {
        startDate: data.startDate,
        endDate: data.endDate,
        isAvailable: data.isAvailable,
        availableUnits: data.availableUnits ? parseInt(data.availableUnits) : null,
      });

      toast.success('Ketersediaan berhasil diperbarui');
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateAvailability };
}
