import Link from 'next/link';
import { LogoutButton } from '../LogoutButton';

interface NavbarProps {
  isAuthenticated: boolean;
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <header className="flex items-center justify-between px-5 py-4 sm:px-8 border-b border-border/40">
      <Link href="/" className="font-heading text-2xl tracking-tight text-primary">
        InapYuk
      </Link>
      <nav className="flex items-center gap-4 sm:gap-5 text-sm">
        <span className="hidden text-muted-foreground sm:inline">Cari penginapan</span>
        <Link 
          href="/tenant/login" 
          className="hidden sm:inline-flex font-medium text-foreground hover:bg-muted px-3 py-1.5 rounded-full transition-colors"
        >
          Untuk Tenant
        </Link>
        
        {isAuthenticated ? (
          <LogoutButton />
        ) : (
          <>
            <Link 
              href="/login" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="rounded-full bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Daftar
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
