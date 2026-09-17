'use client';

import { Button } from '@/components/ui/button';

type PaginationProps = {
  page: number;
  totalPages: number;
  setPage: (val: number | ((p: number) => number)) => void;
  loading: boolean;
};

export function PrevBtn({ page, loading, setPage }: PaginationProps) {
  return (
    <Button
      variant="outline"
      disabled={page === 1 || loading}
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      className="h-8 rounded-lg"
      size="sm"
    >
      Sebelumnya
    </Button>
  );
}

export function NextBtn({ page, loading, totalPages, setPage }: PaginationProps) {
  return (
    <Button
      variant="outline"
      disabled={page === totalPages || loading}
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      className="h-8 rounded-lg"
      size="sm"
    >
      Selanjutnya
    </Button>
  );
}

function PaginationNumbers({ page, totalPages, setPage, loading }: PaginationProps) {
  return (
    <div className="hidden sm:flex items-center gap-1 mx-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Button key={p} variant={page === p ? 'default' : 'ghost'} size="sm" className={`w-8 h-8 p-0 rounded-lg ${page !== p ? 'text-muted-foreground hover:text-foreground' : ''}`} onClick={() => setPage(p)} disabled={loading}>{p}</Button>
      ))}
    </div>
  );
}

export function PaginationControls({ page, totalPages, setPage, loading }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-2 mt-6">
      <div className="text-sm text-muted-foreground hidden sm:block">Menampilkan halaman <span className="font-medium text-foreground">{page}</span> dari <span className="font-medium text-foreground">{totalPages}</span></div>
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
        <PrevBtn page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
        <PaginationNumbers page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
        <NextBtn page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
      </div>
    </div>
  );
}
