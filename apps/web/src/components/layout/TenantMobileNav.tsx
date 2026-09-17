'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, CalendarDays } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { navigation } from './TenantSidebar';

function TenantMobileMenuItem({ item, pathname }: { item: typeof navigation[0]; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <DropdownMenuItem className={isActive ? 'bg-primary/10 text-primary focus:bg-primary/15' : 'text-muted-foreground'}>
      <Link href={item.href} className="flex items-center gap-3 w-full h-full py-1 cursor-pointer">
        <item.icon className="w-4 h-4" /><span className="font-medium">{item.name}</span>
      </Link>
    </DropdownMenuItem>
  );
}

function TenantMobileMenuContent({ pathname }: { pathname: string }) {
  return (
    <DropdownMenuContent align="start" className="w-56 p-2">
      {navigation.map((item) => (
        <TenantMobileMenuItem key={item.name} item={item} pathname={pathname} />
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem className={pathname.startsWith('/tenant/calendar') ? 'bg-primary/10 text-primary focus:bg-primary/15' : 'text-muted-foreground'}>
        <Link href="/tenant/calendar" className="flex items-center gap-3 w-full h-full py-1 cursor-pointer"><CalendarDays className="w-4 h-4" /><span className="font-medium">Kalender Properti</span></Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export function TenantMobileNav() {
  const pathname = usePathname();
  return (
    <div className="flex md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors text-foreground focus:outline-none focus-visible:ring-2 ring-primary">
          <Menu className="w-5 h-5" />
        </DropdownMenuTrigger>
        <TenantMobileMenuContent pathname={pathname} />
      </DropdownMenu>
    </div>
  );
}
