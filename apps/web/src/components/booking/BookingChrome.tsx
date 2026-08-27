import Link from 'next/link';
import { cn } from '@/lib/utils';

export function BookingChrome({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-heading text-2xl tracking-tight text-primary">
          InapYuk
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/orders" className="text-foreground hover:text-primary">
            Pesanan saya
          </Link>
          <Link href="/" className="text-muted-foreground hover:text-primary">
            Cari penginapan
          </Link>
        </nav>
      </header>
      <main
        className={cn('mx-auto w-full flex-1 px-5 pb-16 sm:px-8', wide ? 'max-w-2xl' : 'max-w-lg')}
      >
        {children}
      </main>
    </div>
  );
}
