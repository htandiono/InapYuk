import Link from 'next/link';
import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { Search, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { LogoutButton } from '../LogoutButton';

interface NavbarProps {
  isAuthenticated: boolean;
  hideSearch?: boolean;
  searchHref?: string;
}

async function getNavbarUser(): Promise<{ role: string | null; displayName: string; initial: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) return { role: null, displayName: 'Pengguna', initial: 'P' };
    const payload = decodeJwt(token) as { role?: string; name?: string };
    const displayName = payload.name || 'Pengguna';
    return { role: payload.role ?? null, displayName, initial: displayName.charAt(0).toUpperCase() };
  } catch {
    return { role: null, displayName: 'Pengguna', initial: 'P' };
  }
}

import { NavbarLinks } from './NavbarLinks';

export async function Navbar({ isAuthenticated, hideSearch, searchHref }: NavbarProps) {
  const { role, displayName, initial } = isAuthenticated
    ? await getNavbarUser()
    : { role: null, displayName: 'Pengguna', initial: 'P' };

  return (
    <header className="relative z-50 bg-background flex items-center justify-between px-5 py-4 sm:px-8 border-b border-border/40">
      <Link href="/" className="hover:opacity-90 transition-opacity"><Logo className="text-2xl" /></Link>
      <NavbarLinks isAuthenticated={isAuthenticated} role={role} displayName={displayName} initial={initial} hideSearch={hideSearch} searchHref={searchHref} />
    </header>
  );
}
