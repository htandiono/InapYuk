'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import type { NotificationDto, Paginated } from '@inapyuk/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { bookingGet, bookingPatch } from './booking-api';
import { useSession } from './session';

export function NotificationBell() {
  const session = useSession();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationDto[]>([]);

  useEffect(() => {
    if (!session) return;
    void refreshUnread(setUnread);
    const timer = window.setInterval(() => void refreshUnread(setUnread), 30000);
    return () => window.clearInterval(timer);
  }, [session]);

  if (!session) return null;
  return (
    <DropdownMenu onOpenChange={(open) => open && void openBell(setUnread, setItems)}>
      <DropdownMenuTrigger className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
        <Bell className="h-4 w-4" />
        {unread > 0 ? <UnreadBadge count={unread} /> : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
        <BellList items={items} role={session.role} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UnreadBadge({ count }: { count: number }) {
  return (
    <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
      {count > 9 ? '9+' : count}
    </span>
  );
}

function BellList({ items, role }: { items: NotificationDto[]; role: string }) {
  if (items.length === 0) {
    return <p className="px-2 py-3 text-sm text-muted-foreground">Belum ada kabar baru.</p>;
  }
  return (
    <>
      {items.map((item) => (
        <DropdownMenuItem key={item.id} className="items-start whitespace-normal">
          <BellLink item={item} role={role} />
        </DropdownMenuItem>
      ))}
    </>
  );
}

function BellLink({ item, role }: { item: NotificationDto; role: string }) {
  const href = hrefFor(item.orderNumber, role);
  return (
    <Link href={href} className="block w-full text-left">
      <p className="text-sm font-medium">{item.title}</p>
      <p className="text-xs text-muted-foreground">{item.body}</p>
    </Link>
  );
}

function hrefFor(orderNumber: string | null, role: string) {
  if (!orderNumber) return '#';
  if (role === 'TENANT') return `/tenant/transactions?order=${orderNumber}`;
  return `/orders/${orderNumber}`;
}

async function refreshUnread(setUnread: (count: number) => void) {
  try {
    const data = await bookingGet<{ unreadCount: number }>('/notifications/unread-count');
    setUnread(data.unreadCount);
  } catch {
    setUnread(0);
  }
}

async function openBell(
  setUnread: (count: number) => void,
  setItems: (items: NotificationDto[]) => void,
) {
  try {
    const data = await bookingGet<Paginated<NotificationDto>>('/notifications?limit=8');
    setItems(data.items);
    await bookingPatch('/notifications/read-all', {});
    setUnread(0);
  } catch {
    setItems([]);
  }
}
