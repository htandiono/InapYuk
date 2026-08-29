import type { PaginationMeta } from '@inapyuk/types';
import { Button } from '@/components/ui/button';

export function OrderPager({
  meta,
  onPage,
}: {
  meta: PaginationMeta;
  onPage: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <PagerButton
        label="Sebelumnya"
        disabled={!meta.hasPreviousPage}
        onClick={() => onPage(meta.page - 1)}
      />
      <span className="text-muted-foreground">
        Hal {meta.page} dari {meta.totalPages}
      </span>
      <PagerButton
        label="Berikutnya"
        disabled={!meta.hasNextPage}
        onClick={() => onPage(meta.page + 1)}
      />
    </div>
  );
}

function PagerButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button type="button" variant="outline" className="rounded-full" disabled={disabled} onClick={onClick}>
      {label}
    </Button>
  );
}
