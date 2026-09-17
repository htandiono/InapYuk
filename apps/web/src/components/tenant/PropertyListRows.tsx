import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';

export function TableLoadingRow() {
  return (
    <tr className="hover:bg-transparent border-b border-border/40">
      <td className="h-24">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-24 rounded-md shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </td>
      <td className="h-24 hidden sm:table-cell">
        <Skeleton className="h-6 w-24 rounded-full" />
      </td>
      <td className="h-24 hidden lg:table-cell">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </td>
      <td className="h-24 text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

export function TableEmptyRow() {
  return (
    <tr className="hover:bg-transparent">
      <td colSpan={4} className="h-100 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-primary opacity-60" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">Belum ada properti</h3>
          <p className="text-center max-w-sm mb-8 text-sm text-muted-foreground">
            Anda belum memiliki properti. Tambahkan properti pertama Anda untuk mulai menyewakan.
          </p>
        </div>
      </td>
    </tr>
  );
}
