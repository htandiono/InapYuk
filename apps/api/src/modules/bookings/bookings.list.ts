import type { BookingListItemDto, BookingListQuery } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { toDateOnly } from '../../utils/date';
import { buildPaginationMeta, toPrismaPageArgs } from '../../utils/pagination';
import { bookingListInclude, toListItemDto } from './bookings.mapper';

export async function listGuestBookings(userId: string, query: BookingListQuery) {
  const pageArgs = toPrismaPageArgs(query);
  const where = buildListWhere(userId, query);
  const [rows, total] = await fetchGuestPage(where, query, pageArgs);
  return {
    items: rows.map((row) => toListItemDto(row)) as BookingListItemDto[],
    meta: buildPaginationMeta(total, pageArgs.page, pageArgs.limit),
  };
}

async function fetchGuestPage(
  where: ReturnType<typeof buildListWhere>,
  query: BookingListQuery,
  pageArgs: ReturnType<typeof toPrismaPageArgs>,
) {
  const orderBy = { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' };
  return Promise.all([
    prisma.booking.findMany({
      where,
      include: bookingListInclude,
      orderBy,
      skip: pageArgs.skip,
      take: pageArgs.take,
    }),
    prisma.booking.count({ where }),
  ]);
}

function buildListWhere(userId: string, query: BookingListQuery) {
  return {
    userId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.orderNumber
      ? { orderNumber: { contains: query.orderNumber, mode: 'insensitive' as const } }
      : {}),
    ...dateFilter(query.dateFrom, query.dateTo),
  };
}

function dateFilter(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return {};
  return {
    checkIn: {
      ...(dateFrom ? { gte: toDateOnly(dateFrom) } : {}),
      ...(dateTo ? { lte: toDateOnly(dateTo) } : {}),
    },
  };
}
