import type { SalesReportQuery, SalesReportResponse, SalesReportRow } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { toDateOnly } from '../../utils/date';
import { toAmount } from '../bookings/bookings.mapper';

const PAID = ['PROCESSED', 'COMPLETED'] as const;

type NightRow = {
  finalPrice: unknown;
  date: Date;
  booking: {
    id: string;
    orderNumber: string;
    createdAt: Date;
    confirmedAt: Date | null;
    user: { id: string; name: string };
    property: { id: string; name: string };
  };
};

export async function salesReport(
  tenantId: string,
  query: SalesReportQuery,
): Promise<SalesReportResponse> {
  const nights = await loadPaidNights(tenantId, query);
  const rows = sortRows(groupNights(nights, query.groupBy), query);
  return { groupBy: query.groupBy, rows, summary: summarise(rows) };
}

async function loadPaidNights(tenantId: string, query: SalesReportQuery) {
  return prisma.bookingNight.findMany({
    where: {
      booking: {
        status: { in: [...PAID] },
        property: {
          tenantId,
          ...(query.propertyId ? { id: query.propertyId } : {}),
        },
      },
      ...nightDateFilter(query.dateFrom, query.dateTo),
    },
    select: {
      finalPrice: true,
      date: true,
      booking: {
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          confirmedAt: true,
          user: { select: { id: true, name: true } },
          property: { select: { id: true, name: true } },
        },
      },
    },
  });
}

function nightDateFilter(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return {};
  return {
    date: {
      ...(dateFrom ? { gte: toDateOnly(dateFrom) } : {}),
      ...(dateTo ? { lte: toDateOnly(dateTo) } : {}),
    },
  };
}

type Bucket = SalesReportRow & { bookingIds: Set<string> };

function groupNights(nights: NightRow[], groupBy: SalesReportQuery['groupBy']) {
  const buckets = new Map<string, Bucket>();
  for (const night of nights) addNight(buckets, night, groupBy);
  return [...buckets.values()].map(toRow);
}

function addNight(
  buckets: Map<string, Bucket>,
  night: NightRow,
  groupBy: SalesReportQuery['groupBy'],
) {
  const key = groupKey(night, groupBy);
  const current = buckets.get(key) ?? emptyBucket(key, groupLabel(night, groupBy));
  const stamp = (night.booking.confirmedAt ?? night.booking.createdAt).toISOString();
  current.nightCount += 1;
  current.totalRevenue += toAmount(night.finalPrice);
  current.lastTransactionAt = later(current.lastTransactionAt, stamp);
  current.bookingIds.add(night.booking.id);
  buckets.set(key, current);
}

function emptyBucket(key: string, label: string): Bucket {
  return {
    key,
    label,
    bookingCount: 0,
    nightCount: 0,
    totalRevenue: 0,
    lastTransactionAt: null,
    bookingIds: new Set<string>(),
  };
}

function toRow(bucket: Bucket): SalesReportRow {
  const { bookingIds, ...row } = bucket;
  return { ...row, bookingCount: bookingIds.size };
}

function groupKey(night: NightRow, groupBy: SalesReportQuery['groupBy']) {
  if (groupBy === 'property') return night.booking.property.id;
  if (groupBy === 'user') return night.booking.user.id;
  return night.booking.id;
}

function groupLabel(night: NightRow, groupBy: SalesReportQuery['groupBy']) {
  if (groupBy === 'property') return night.booking.property.name;
  if (groupBy === 'user') return night.booking.user.name;
  return night.booking.orderNumber;
}

function sortRows(rows: SalesReportRow[], query: SalesReportQuery) {
  const order = query.sortOrder === 'asc' ? 1 : -1;
  return rows.sort((a, b) => compareRows(a, b, query.sortBy ?? 'date', order));
}

function compareRows(a: SalesReportRow, b: SalesReportRow, sortBy: 'date' | 'total', order: number) {
  if (sortBy === 'total') return (a.totalRevenue - b.totalRevenue) * order;
  return String(a.lastTransactionAt).localeCompare(String(b.lastTransactionAt)) * order;
}

function later(current: string | null, next: string) {
  if (!current || next > current) return next;
  return current;
}

function summarise(rows: SalesReportRow[]) {
  const totalRevenue = rows.reduce((sum, row) => sum + row.totalRevenue, 0);
  const totalBookings = rows.reduce((sum, row) => sum + row.bookingCount, 0);
  return {
    totalRevenue,
    totalBookings,
    averageBookingValue: totalBookings === 0 ? 0 : totalRevenue / totalBookings,
  };
}
