'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { navigation } from './TenantSidebar';

type NavItem = (typeof navigation)[0];

function TenantMobileMenuItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <DropdownMenuItem className={itemClass(isActive)}>
      <ItemLink item={item} />
    </DropdownMenuItem>
  );
}

function itemClass(isActive: boolean) {
  if (isActive) return 'bg-primary/10 text-primary focus:bg-primary/15';
  return 'text-muted-foreground';
}

function ItemLink({ item }: { item: NavItem }) {
  return (
    <Link href={item.href} className="flex items-center gap-3 w-full h-full py-1 cursor-pointer">
      <item.icon className="w-4 h-4" />
      <span className="font-medium">{item.name}</span>
    </Link>
  );
}

function TenantMobileMenuContent({ pathname }: { pathname: string }) {
  return (
    <DropdownMenuContent align="start" className="w-56 p-2">
      {navigation.map((item) => (
        <TenantMobileMenuItem key={item.name} item={item} pathname={pathname} />
      ))}
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
