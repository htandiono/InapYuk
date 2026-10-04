import type { PaginationMeta } from '@inapyuk/types';
import { Button } from '@/components/ui/button';

type PagerProps = { meta: PaginationMeta; onPage: (page: number) => void };
type ButtonProps = { label: string; disabled: boolean; onClick: () => void };

export function OrderPager({ meta, onPage }: PagerProps) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 text-sm">
      <PagerButton label="Sebelumnya" disabled={!meta.hasPreviousPage} onClick={() => onPage(meta.page - 1)} />
      <PageLabel meta={meta} />
      <PagerButton label="Berikutnya" disabled={!meta.hasNextPage} onClick={() => onPage(meta.page + 1)} />
    </div>
  );
}

function PageLabel({ meta }: { meta: PaginationMeta }) {
  return <span className="text-muted-foreground">Hal {meta.page} dari {meta.totalPages}</span>;
}

function PagerButton({ label, disabled, onClick }: ButtonProps) {
  return (
    <Button type="button" variant="outline" className="h-10 min-w-0 rounded-full px-4" disabled={disabled} onClick={onClick}>
      {label}
    </Button>
  );
}
