import type { NotificationDto } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { buildPaginationMeta, toPrismaPageArgs } from '../../utils/pagination';
import { notFound } from '../../utils/app-error';
import type { NotificationListQuery } from '@inapyuk/types';

export async function listNotifications(userId: string, query: NotificationListQuery) {
  const pageArgs = toPrismaPageArgs(query);
  const where = { userId };
  const [rows, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pageArgs.skip,
      take: pageArgs.take,
    }),
    prisma.notification.count({ where }),
  ]);
  const orderNumbers = await loadOrderNumbers(rows.map((row) => row.bookingId));
  return {
    items: rows.map((row) => toDto(row, orderNumbers)),
    meta: buildPaginationMeta(total, pageArgs.page, pageArgs.limit),
  };
}

export async function unreadCount(userId: string) {
  const count = await prisma.notification.count({ where: { userId, readAt: null } });
  return { unreadCount: count };
}

export async function markOneRead(userId: string, id: string) {
  const updated = await prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
  if (updated.count === 0) throw notFound('Notifikasi tidak ditemukan');
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

async function loadOrderNumbers(bookingIds: Array<string | null>) {
  const ids = bookingIds.filter((id): id is string => Boolean(id));
  if (ids.length === 0) return new Map<string, string>();
  const rows = await prisma.booking.findMany({
    where: { id: { in: ids } },
    select: { id: true, orderNumber: true },
  });
  return new Map(rows.map((row) => [row.id, row.orderNumber]));
}

function toDto(
  row: {
    id: string;
    type: NotificationDto['type'];
    title: string;
    body: string;
    bookingId: string | null;
    readAt: Date | null;
    createdAt: Date;
  },
  orderNumbers: Map<string, string>,
): NotificationDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    bookingId: row.bookingId,
    orderNumber: row.bookingId ? (orderNumbers.get(row.bookingId) ?? null) : null,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}
