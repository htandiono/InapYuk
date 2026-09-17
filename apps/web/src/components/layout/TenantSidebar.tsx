'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Tags, FileText, PieChart, CalendarDays } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export const navigation = [
  { name: 'Properti', href: '/tenant/properties', icon: Building2 },
  { name: 'Kategori', href: '/tenant/categories', icon: Tags },
  { name: 'Pesanan', href: '/tenant/orders', icon: FileText },
  { name: 'Laporan', href: '/tenant/reports', icon: PieChart },
];

function navLinkClass(isActive: boolean) {
  return `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`;
}

function iconClass(isActive: boolean) {
  return `h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`;
}

function NavItem({ item, isActive }: { item: (typeof navigation)[0]; isActive: boolean }) {
  return (
    <Link key={item.name} href={item.href} className={navLinkClass(isActive)}>
      <item.icon className={iconClass(isActive)} aria-hidden="true" />
      {item.name}
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-2">{label}</div>;
}

function CalendarLink({ pathname }: { pathname: string }) {
  const isActive = pathname.startsWith('/tenant/calendar');
  return (
    <Link href="/tenant/calendar" className={navLinkClass(isActive)}>
      <CalendarDays className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
      Kalender Properti
    </Link>
  );
}

function TenantNavContent({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-1 flex-col p-4 space-y-1 overflow-y-auto">
      <SectionLabel label="Menu Utama" />
      {navigation.map((item) => (
        <NavItem key={item.name} item={item} isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)} />
      ))}
      <div className="mt-4"><SectionLabel label="Ketersediaan" /></div>
      <CalendarLink pathname={pathname} />
    </nav>
  );
}

export function TenantSidebar() {
  const pathname = usePathname();
  return (
    <div className="h-full w-64 flex-col bg-background border-r border-border/40 shadow-sm hidden md:flex">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/40">
        <Link href="/tenant/properties" className="hover:opacity-90 transition-opacity"><Logo isTenant className="text-2xl" /></Link>
      </div>
      <TenantNavContent pathname={pathname} />
    </div>
  );
}
