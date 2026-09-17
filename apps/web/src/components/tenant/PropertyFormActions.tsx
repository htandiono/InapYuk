'use client';

import { Button } from '@/components/ui/button';

interface PropertyFormActionsProps {
  loading: boolean;
  onCancel?: () => void;
  onSubmit: (e: React.BaseSyntheticEvent) => void;
}

export function PropertyFormActions({ loading, onCancel, onSubmit }: PropertyFormActionsProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex justify-end space-x-2 pt-4 border-t">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Batal</Button>}
        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </form>
  );
}
