'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogoutButton } from '../LogoutButton';

function GuestLinks({ pathname }: { pathname: string }) {
  return (
    <>
      <Link href="/login" className={`transition-colors text-sm font-medium ${pathname === '/login' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
        Masuk
      </Link>
      <Link href="/register" className={`rounded-full px-4 py-2 transition-colors text-sm font-medium shadow-sm ${pathname === '/register' ? 'bg-primary/90 text-primary-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
        Daftar
      </Link>
    </>
  );
}

function UserAvatar({ displayName, initial, pathname }: { displayName: string; initial: string; pathname: string }) {
  const isActive = pathname === '/profile';
  return (
    <Link href="/profile" className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`}>
      <Avatar className="h-7 w-7">
        <AvatarImage src="" alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initial}</AvatarFallback>
      </Avatar>
      <span className={`hidden sm:inline text-sm font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
        Halo, {displayName}
      </span>
    </Link>
  );
}

function UserMenu({ displayName, initial, pathname }: { displayName: string; initial: string; pathname: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <UserAvatar displayName={displayName} initial={initial} pathname={pathname} />
      <LogoutButton />
    </div>
  );
}

type NavProps = { pathname: string; showTenantLink: boolean; isAuthenticated: boolean; displayName: string; initial: string; };

function DesktopNav({ pathname, showTenantLink, isAuthenticated, displayName, initial }: NavProps) {
  return (
    <div className="hidden sm:flex items-center gap-4 sm:gap-5">
      {showTenantLink && (
        <Link href="/tenant/login" className={`font-medium px-3 py-1.5 rounded-full transition-colors text-sm whitespace-nowrap ${pathname === '/tenant/login' ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted'}`}>
          Untuk Tenant
        </Link>
      )}
      {isAuthenticated ? <UserMenu displayName={displayName} initial={initial} pathname={pathname} /> : <GuestLinks pathname={pathname} />}
    </div>
  );
}

function MobileNavGuest({ pathname }: { pathname: string }) {
  return (
    <>
      <DropdownMenuItem className={pathname === '/login' ? 'bg-accent text-accent-foreground' : ''}>
        <Link href="/login" className="w-full h-full block cursor-pointer py-1 font-medium">Masuk</Link>
      </DropdownMenuItem>
      <DropdownMenuItem className={pathname === '/register' ? 'bg-accent text-accent-foreground' : ''}>
        <Link href="/register" className="w-full h-full block cursor-pointer py-1 font-medium text-primary">Daftar</Link>
      </DropdownMenuItem>
    </>
  );
}

function MobileNavAuth({ pathname, displayName }: { pathname: string; displayName: string }) {
  return (
    <>
      <DropdownMenuItem className={pathname === '/profile' ? 'bg-accent text-accent-foreground' : ''}>
        <Link href="/profile" className="w-full h-full block cursor-pointer py-1">Profil ({displayName})</Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <div className="pt-2">
        <LogoutButton variant="destructive" className="w-full h-9 text-xs" />
      </div>
    </>
  );
}

function MobileNav({ pathname, showTenantLink, isAuthenticated, displayName }: NavProps) {
  return (
    <div className="flex sm:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors text-foreground focus:outline-none focus-visible:ring-2 ring-primary">
          <Menu className="w-5 h-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-2">
          {showTenantLink && <><DropdownMenuItem className={pathname === '/tenant/login' ? 'bg-accent text-accent-foreground' : ''}><Link href="/tenant/login" className="w-full h-full block cursor-pointer py-1">Untuk Tenant</Link></DropdownMenuItem><DropdownMenuSeparator /></>}
          {isAuthenticated ? <MobileNavAuth pathname={pathname} displayName={displayName} /> : <MobileNavGuest pathname={pathname} />}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function NavbarLinks({ isAuthenticated, role, displayName, initial, hideSearch, searchHref }: { isAuthenticated: boolean; role: string | null; displayName: string; initial: string; hideSearch?: boolean; searchHref?: string; }) {
  const showTenantLink = !isAuthenticated || role !== 'USER';
  const navProps = { pathname: usePathname(), showTenantLink, isAuthenticated, displayName, initial };
  return (
    <nav className="flex items-center gap-3 sm:gap-5 text-sm">
      {!hideSearch && <Link href={searchHref || '/#search-panel'} className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-full border border-border shadow-sm hover:shadow text-muted-foreground transition-all bg-background"><Search className="w-4 h-4" /><span className="hidden lg:inline text-sm font-medium">Cari penginapan</span></Link>}
      <DesktopNav {...navProps} />
      <MobileNav {...navProps} />
    </nav>
  );
}
