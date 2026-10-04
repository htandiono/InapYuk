import Link from 'next/link';
import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { Logo } from '@/components/ui/logo';
import { NotificationBell } from '@/components/booking/NotificationBell';
import { NavbarLinks } from './NavbarLinks';

interface NavbarProps {
  isAuthenticated: boolean;
  hideSearch?: boolean;
  searchHref?: string;
}

type NavUser = { role: string | null; displayName: string; initial: string };

const GUEST: NavUser = { role: null, displayName: 'Pengguna', initial: 'P' };

async function getNavbarUser(): Promise<NavUser> {
  try {
    return userFromToken(await readAccessToken());
  } catch {
    return GUEST;
  }
}

async function readAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
}

function userFromToken(token?: string): NavUser {
  if (!token) return GUEST;
  const payload = decodeJwt(token) as { role?: string; name?: string };
  const displayName = payload.name || GUEST.displayName;
  return { role: payload.role ?? null, displayName, initial: displayName.charAt(0).toUpperCase() };
}

export async function Navbar(props: NavbarProps) {
  const user = props.isAuthenticated ? await getNavbarUser() : GUEST;
  return <NavbarBar {...props} user={user} />;
}

function NavbarBar({ isAuthenticated, hideSearch, searchHref, user }: NavbarProps & { user: NavUser }) {
  return (
    <header className="relative z-50 bg-background flex items-center justify-between px-5 py-4 sm:px-8 border-b border-border/40">
      <HomeLink />
      <NavbarTools user={user} isAuthenticated={isAuthenticated} hideSearch={hideSearch} searchHref={searchHref} />
    </header>
  );
}

function HomeLink() {
  return (
    <Link href="/" className="hover:opacity-90 transition-opacity">
      <Logo className="text-2xl" />
    </Link>
  );
}

function NavbarTools({ user, isAuthenticated, hideSearch, searchHref }: NavbarProps & { user: NavUser }) {
  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? <NotificationBell /> : null}
      <NavbarLinks {...user} isAuthenticated={isAuthenticated} hideSearch={hideSearch} searchHref={searchHref} />
    </div>
  );
}
