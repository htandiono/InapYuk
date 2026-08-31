'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Tags, FileText, PieChart, CalendarDays } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const navigation = [
  { name: 'Properti', href: '/tenant/properties', icon: Building2 },
  { name: 'Kategori', href: '/tenant/categories', icon: Tags },
  { name: 'Pesanan', href: '/tenant/orders', icon: FileText },
  { name: 'Laporan', href: '/tenant/reports', icon: PieChart },
];

export function TenantSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full w-64 flex-col bg-background border-r border-border/40 shadow-sm hidden md:flex">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/40">
        <Link href="/tenant/properties" className="hover:opacity-90 transition-opacity">
          <Logo isTenant className="text-2xl" />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-2">Menu Utama</div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-8 px-2">Ketersediaan</div>
        <Link
          href="/tenant/calendar"
          className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname.startsWith('/tenant/calendar') 
              ? 'bg-primary/10 text-primary' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <CalendarDays className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
          Kalender Properti
        </Link>
      </nav>
    </div>
  );
}
