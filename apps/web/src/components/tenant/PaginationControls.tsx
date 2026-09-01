'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

type PaginationProps = {
  page: number;
  totalPages: number;
  setPage: (val: number | ((p: number) => number)) => void;
  loading: boolean;
};

export function PaginationControls({ page, totalPages, setPage, loading }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-2 mt-6">
      <PageInfo page={page} totalPages={totalPages} />
      <PageActions page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
    </div>
  );
}

function PageInfo({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <div className="text-sm text-muted-foreground hidden sm:block">
      Menampilkan halaman <span className="font-medium text-foreground">{page}</span> dari{' '}
      <span className="font-medium text-foreground">{totalPages}</span>
    </div>
  );
}

function PageActions({
  page,
  totalPages,
  setPage,
  loading,
}: {
  page: number;
  totalPages: number;
  setPage: PaginationProps['setPage'];
  loading: boolean;
}) {
  return (
    <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
      <PrevButton page={page} loading={loading} setPage={setPage} />
      <PageNumbers page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
      <NextButton page={page} totalPages={totalPages} loading={loading} setPage={setPage} />
    </div>
  );
}

function PrevButton({
  page,
  loading,
  setPage,
}: {
  page: number;
  loading: boolean;
  setPage: PaginationProps['setPage'];
}) {
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

function PageNumbers({
  page,
  totalPages,
  setPage,
  loading,
}: {
  page: number;
  totalPages: number;
  setPage: PaginationProps['setPage'];
  loading: boolean;
}) {
  if (totalPages <= 5) {
    return (
      <div className="hidden sm:flex items-center gap-1 mx-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={page === p ? 'default' : 'ghost'}
            size="sm"
            className={`w-8 h-8 p-0 rounded-lg ${page !== p ? 'text-muted-foreground hover:text-foreground' : ''}`}
            onClick={() => setPage(p)}
            disabled={loading}
          >
            {p}
          </Button>
        ))}
      </div>
    );
  }
  const nums = [1, ...getMiddlePages(page, totalPages), totalPages].filter(
    (v, i, a) => i === 0 || v !== a[i - 1],
  );
  return (
    <div className="hidden sm:flex items-center gap-1 mx-2">
      {nums.map((p, i) => (
        <React.Fragment key={p}>
          {i > 0 && nums[i - 1] !== p - 1 && (
            <span className="px-1 text-muted-foreground">...</span>
          )}
          <Button
            variant={page === p ? 'default' : 'ghost'}
            size="sm"
            className={`w-8 h-8 p-0 rounded-lg ${page !== p ? 'text-muted-foreground hover:text-foreground' : ''}`}
            onClick={() => setPage(p)}
            disabled={loading}
          >
            {p}
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
}

function getMiddlePages(page: number, totalPages: number) {
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  const result: number[] = [];
  for (let i = start; i <= end; i++) result.push(i);
  return result;
}

function NextButton({
  page,
  totalPages,
  loading,
  setPage,
}: {
  page: number;
  totalPages: number;
  loading: boolean;
  setPage: PaginationProps['setPage'];
}) {
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
