import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';

type ChromeProps = { children: React.ReactNode; wide?: boolean };

export function BookingChrome({ children, wide = false }: ChromeProps) {
  return (
    <div className="flex min-h-full flex-col">
      <ChromeHeader />
      <ChromeMain wide={wide}>{children}</ChromeMain>
    </div>
  );
}

function ChromeHeader() {
  return (
    <header className="flex items-center justify-between px-5 py-4 sm:px-8">
      <Wordmark />
      <ChromeNav />
    </header>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="font-heading text-2xl tracking-tight text-primary">
      InapYuk
    </Link>
  );
}

function ChromeNav() {
  return (
    <nav className="flex min-w-0 items-center gap-3 overflow-x-auto text-sm sm:gap-4">
      <OrdersLink />
      <SearchLink />
      <NotificationBell />
    </nav>
  );
}

function OrdersLink() {
  return (
    <Link href="/orders" className="text-foreground hover:text-primary">
      Pesanan saya
    </Link>
  );
}

function SearchLink() {
  return (
    <Link href="/" className="text-muted-foreground hover:text-primary">
      Cari penginapan
    </Link>
  );
}

function ChromeMain({ wide, children }: { wide: boolean; children: React.ReactNode }) {
  const width = wide ? 'max-w-2xl' : 'max-w-lg';
  return (
    <main className={cn('mx-auto w-full min-w-0 flex-1 px-5 pb-16 sm:px-8', width)}>
      {children}
    </main>
  );
}
