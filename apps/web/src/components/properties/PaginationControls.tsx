import { PaginationMeta } from '@inapyuk/types';

interface PaginationControlsProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ meta, onPageChange }: PaginationControlsProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(meta.page - 1)}
        disabled={!meta.hasPreviousPage}
        className="px-4 py-2 text-sm font-medium border border-border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
      >
        Sebelumnya
      </button>

      <span className="text-sm font-medium text-muted-foreground">
        Halaman {meta.page} dari {meta.totalPages}
      </span>

      <button
        onClick={() => onPageChange(meta.page + 1)}
        disabled={!meta.hasNextPage}
        className="px-4 py-2 text-sm font-medium border border-border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
      >
        Selanjutnya
      </button>
    </div>
  );
}
