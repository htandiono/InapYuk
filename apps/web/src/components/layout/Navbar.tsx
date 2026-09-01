import Link from 'next/link';
import { Search } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { LogoutButton } from '../LogoutButton';

interface NavbarProps {
  isAuthenticated: boolean;
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <header className="relative z-50 bg-background flex items-center justify-between px-5 py-4 sm:px-8 border-b border-border/40">
      <Link href="/" className="hover:opacity-90 transition-opacity">
        <Logo className="text-2xl" />
      </Link>
      <nav className="flex items-center gap-4 sm:gap-5 text-sm">
        <Link 
          href="/properties" 
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border shadow-sm hover:shadow text-sm text-muted-foreground transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Cari penginapan</span>
        </Link>
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
