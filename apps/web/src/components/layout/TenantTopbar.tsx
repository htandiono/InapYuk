'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { LogoutButton } from '../LogoutButton';

function MobileBrand() {
  return (
    <div className="md:hidden flex items-center gap-2">
      <Link href="/tenant/properties" className="hover:opacity-90 transition-opacity">
        <Logo isTenant className="text-xl" />
      </Link>
    </div>
  );
}

function ProfileLink() {
  return (
    <Link href="/tenant/profile" className="flex items-center gap-3 hover:bg-muted/50 px-3 py-1.5 rounded-lg transition-colors group">
      <Avatar className="h-8 w-8 shadow-sm border border-border/30">
        <AvatarImage src="" alt="Tenant" />
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">T</AvatarFallback>
      </Avatar>
      <div className="hidden sm:flex flex-col items-start">
        <span className="text-sm font-medium leading-none text-foreground">Halo, Tenant</span>
      </div>
    </Link>
  );
}

export function TenantTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/40 bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <MobileBrand />
      <div className="h-6 w-px bg-border/40 md:hidden" aria-hidden="true" />
      <div className="flex flex-1 gap-x-2 self-stretch lg:gap-x-4 justify-end items-center">
        <ProfileLink />
        <div className="hidden sm:block h-6 w-px bg-border/60 mx-2" aria-hidden="true" />
        <LogoutButton variant="ghost" className="hidden sm:flex px-4 h-9 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" />
        <LogoutButton variant="ghost" className="sm:hidden text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2 h-9" />
      </div>
    </header>
  );
}
