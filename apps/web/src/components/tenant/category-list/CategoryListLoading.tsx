import { Skeleton } from '@/components/ui/skeleton';

export function CategoryListLoading() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="hover:bg-transparent border-b border-border/40">
          <td className="h-16"><Skeleton className="h-5 w-32" /></td>
          <td className="h-16 hidden sm:table-cell"><Skeleton className="h-5 w-24" /></td>
          <td className="h-16 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></td>
        </tr>
      ))}
    </>
  );
}
