import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api-client';
import { useState } from 'react';
import { toast } from 'sonner';

type AvailabilityDialogProps = {
  roomId: string | null;
  onClose: () => void;
};

export function AvailabilityDialog({ roomId, onClose }: AvailabilityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    isAvailable: true,
    availableUnits: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return;

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('Tanggal mulai tidak boleh lebih dari selesai');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/rooms/tenant/rooms/${roomId}/availability`, {
        startDate: formData.startDate,
        endDate: formData.endDate,
        isAvailable: formData.isAvailable,
        availableUnits: formData.availableUnits ? parseInt(formData.availableUnits) : null,
      });

      toast.success('Ketersediaan berhasil diperbarui');
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!roomId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kelola Ketersediaan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Akhir</Label>
              <Input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div className="space-y-0.5">
              <Label className="text-base">Kamar Tersedia</Label>
              <p className="text-sm text-muted-foreground">
                Aktifkan untuk menerima pesanan pada tanggal ini
              </p>
            </div>
            <Switch
              checked={formData.isAvailable}
              onCheckedChange={(c: boolean) => setFormData({ ...formData, isAvailable: c })}
            />
          </div>

          <div className="space-y-2">
            <Label>Override Total Unit (Opsional)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Biarkan kosong untuk default kamar"
              value={formData.availableUnits}
              onChange={(e) => setFormData({ ...formData, availableUnits: e.target.value })}
              disabled={!formData.isAvailable}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
