import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { LogoutButton } from '../LogoutButton';
import { TenantMobileNav } from './TenantMobileNav';

async function getTenantName(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) return 'Tenant';
    const payload = decodeJwt(token) as { name?: string };
    return payload.name || 'Tenant';
  } catch {
    return 'Tenant';
  }
}

function TenantAvatarLink({ displayName, initial }: { displayName: string; initial: string }) {
  return (
    <Link href="/tenant/profile" className="flex items-center gap-3 hover:bg-muted/50 px-3 py-1.5 rounded-lg transition-colors group">
      <Avatar className="h-8 w-8 shadow-sm border border-border/30">
        <AvatarImage src="" alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">{initial}</AvatarFallback>
      </Avatar>
      <div className="hidden md:flex flex-col items-start min-w-0">
        <span className="text-sm font-medium leading-none text-foreground truncate max-w-30 lg:max-w-50">Halo, {displayName}</span>
      </div>
    </Link>
  );
}

function TenantMobileNavBrand() {
  return (
    <div className="md:hidden flex items-center gap-2">
      <TenantMobileNav />
      <Link href="/tenant/properties" className="hover:opacity-90 transition-opacity"><Logo isTenant className="text-xl" /></Link>
    </div>
  );
}

function TenantTopbarHeader({ displayName, initial }: { displayName: string; initial: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/40 bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <TenantMobileNavBrand />
      <div className="h-6 w-px bg-border/40 md:hidden ml-2" aria-hidden="true" />
      <div className="flex flex-1 gap-x-2 self-stretch lg:gap-x-4 justify-end items-center">
        <TenantAvatarLink displayName={displayName} initial={initial} />
        <div className="hidden md:block h-6 w-px bg-border/60 mx-2" aria-hidden="true" />
        <LogoutButton variant="ghost" className="hidden md:flex px-4 h-9 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" />
        <LogoutButton variant="ghost" iconOnly className="md:hidden text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9 p-0 rounded-full flex items-center justify-center" />
      </div>
    </header>
  );
}

export async function TenantTopbar() {
  const userName = await getTenantName();
  const displayName = userName || 'Tenant';
  const initial = displayName.charAt(0).toUpperCase();

  return <TenantTopbarHeader displayName={displayName} initial={initial} />;
}
