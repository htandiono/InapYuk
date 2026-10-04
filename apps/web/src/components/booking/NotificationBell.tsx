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

type Session = NonNullable<ReturnType<typeof useSession>>;
type BellState = {
  unread: number;
  setUnread: (count: number) => void;
  items: NotificationDto[];
  setItems: (items: NotificationDto[]) => void;
};

export function NotificationBell() {
  const session = useSession();
  const bell = useBell(session);
  if (!session) return null;
  return <BellMenu session={session} bell={bell} />;
}

function useBell(session: ReturnType<typeof useSession>): BellState {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationDto[]>([]);
  useUnreadPoll(session, setUnread);
  return { unread, setUnread, items, setItems };
}

function useUnreadPoll(session: ReturnType<typeof useSession>, setUnread: (count: number) => void) {
  useEffect(() => {
    if (!session) return;
    void refreshUnread(setUnread);
    const timer = window.setInterval(() => void refreshUnread(setUnread), 30000);
    return () => window.clearInterval(timer);
  }, [session, setUnread]);
}

function BellMenu({ session, bell }: { session: Session; bell: BellState }) {
  const onOpen = (open: boolean) => open && void openBell(bell.setUnread, bell.setItems);
  return (
    <DropdownMenu onOpenChange={onOpen}>
      <BellTrigger unread={bell.unread} />
      <BellPanel items={bell.items} role={session.role} />
    </DropdownMenu>
  );
}

function BellTrigger({ unread }: { unread: number }) {
  return (
    <DropdownMenuTrigger className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
      <Bell className="h-4 w-4" />
      {unread > 0 ? <UnreadBadge count={unread} /> : null}
    </DropdownMenuTrigger>
  );
}

function BellPanel({ items, role }: { items: NotificationDto[]; role: string }) {
  return (
    <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
      <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
      <BellList items={items} role={role} />
    </DropdownMenuContent>
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
  if (items.length === 0) return <p className="px-2 py-3 text-sm text-muted-foreground">Belum ada kabar baru.</p>;
  return (
    <>
      {items.map((item) => <BellItem key={item.id} item={item} role={role} />)}
    </>
  );
}

function BellItem({ item, role }: { item: NotificationDto; role: string }) {
  return (
    <DropdownMenuItem className="items-start whitespace-normal">
      <BellLink item={item} role={role} />
    </DropdownMenuItem>
  );
}

function BellLink({ item, role }: { item: NotificationDto; role: string }) {
  return (
    <Link href={hrefFor(item.orderNumber, role)} className="block w-full text-left">
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

async function openBell(setUnread: (count: number) => void, setItems: (items: NotificationDto[]) => void) {
  try {
    const data = await bookingGet<Paginated<NotificationDto>>('/notifications?limit=8');
    setItems(data.items);
    await bookingPatch('/notifications/read-all', {});
    setUnread(0);
  } catch {
    setItems([]);
  }
}
