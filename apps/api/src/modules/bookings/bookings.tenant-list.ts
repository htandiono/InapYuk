import type { BookingListQuery, TenantBookingListItemDto } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { toDateOnly } from '../../utils/date';
import { buildPaginationMeta, toPrismaPageArgs } from '../../utils/pagination';
import { bookingListInclude, toListItemDto, type BookingListRecord } from './bookings.mapper';

const tenantListInclude = {
  ...bookingListInclude,
  user: { select: { name: true, email: true } },
};

type TenantListRecord = BookingListRecord & {
  paymentProofUrl: string | null;
  user: { name: string; email: string };
};

export async function listTenantBookings(tenantId: string, query: BookingListQuery) {
  const pageArgs = toPrismaPageArgs(query);
  const where = buildTenantWhere(tenantId, query);
  const [rows, total] = await fetchTenantPage(where, query, pageArgs);
  return {
    items: rows.map(toTenantListItem),
    meta: buildPaginationMeta(total, pageArgs.page, pageArgs.limit),
  };
}

async function fetchTenantPage(
  where: ReturnType<typeof buildTenantWhere>,
  query: BookingListQuery,
  pageArgs: ReturnType<typeof toPrismaPageArgs>,
) {
  return Promise.all([findTenantRows(where, query, pageArgs), prisma.booking.count({ where })]);
}

function findTenantRows(
  where: ReturnType<typeof buildTenantWhere>,
  query: BookingListQuery,
  pageArgs: ReturnType<typeof toPrismaPageArgs>,
) {
  return prisma.booking.findMany({
    where,
    include: tenantListInclude,
    orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
    skip: pageArgs.skip,
    take: pageArgs.take,
  });
}

function buildTenantWhere(tenantId: string, query: BookingListQuery) {
  return {
    property: {
      tenantId,
      ...(query.propertyId ? { id: query.propertyId } : {}),
    },
    ...(query.status ? { status: query.status } : {}),
    ...searchFilter(query),
    ...dateFilter(query.dateFrom, query.dateTo),
  };
}

function searchFilter(query: BookingListQuery) {
  return {
    ...(query.orderNumber
      ? { orderNumber: { contains: query.orderNumber, mode: 'insensitive' as const } }
      : {}),
    ...(query.guestName
      ? { user: { name: { contains: query.guestName, mode: 'insensitive' as const } } }
      : {}),
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

function toTenantListItem(row: TenantListRecord): TenantBookingListItemDto {
  return {
    ...toListItemDto(row),
    guestName: row.user.name,
    guestEmail: row.user.email,
    awaitingConfirmation: row.status === 'WAITING_CONFIRMATION',
    paymentProofUrl: row.paymentProofUrl,
  };
}
