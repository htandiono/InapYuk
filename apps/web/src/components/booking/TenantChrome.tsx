import Link from 'next/link';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/tenant/transactions', label: 'Transaksi' },
  { href: '/tenant/reviews', label: 'Ulasan' },
  { href: '/tenant/reports/sales', label: 'Penjualan' },
  { href: '/tenant/reports/occupancy', label: 'Kalender' },
];

export function TenantChrome({
  children,
  current,
}: {
  children: React.ReactNode;
  current: string;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 px-5 py-4 sm:px-8">
        <Link href="/" className="font-heading text-2xl tracking-tight text-primary">
          InapYuk
        </Link>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto text-sm sm:gap-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5',
                current === link.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl min-w-0 flex-1 px-5 pb-16 sm:px-8">{children}</main>
    </div>
  );
}
