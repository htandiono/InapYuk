import type {
  PropertyReportDay,
  PropertyReportQuery,
  PropertyReportResponse,
  PropertyReportRoom,
} from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { dayjs, formatDateKey, toDateOnly } from '../../utils/date';
import { notFound } from '../../utils/app-error';

const HOLDING = ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'PROCESSED', 'COMPLETED'] as const;

export async function occupancyReport(
  tenantId: string,
  query: PropertyReportQuery,
): Promise<PropertyReportResponse> {
  const catalog = await listProperties(tenantId);
  const property = pickProperty(catalog, query.propertyId);
  const range = monthRange(query.month);
  const rooms = await loadRooms(property.id);
  const mapped = await Promise.all(rooms.map((room) => mapRoom(room, range)));
  return {
    propertyId: property.id,
    propertyName: property.name,
    month: query.month,
    rooms: mapped,
    availableProperties: catalog,
  };
}

async function listProperties(tenantId: string) {
  return prisma.property.findMany({
    where: { tenantId, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

function pickProperty(catalog: Array<{ id: string; name: string }>, propertyId?: string) {
  const match = propertyId ? catalog.find((item) => item.id === propertyId) : catalog[0];
  if (!match) throw notFound('Properti tidak ditemukan');
  return match;
}

function monthRange(month: string) {
  const start = toDateOnly(`${month}-01`);
  const end = dayjs.utc(formatDateKey(start)).add(1, 'month').toDate();
  return { start, end };
}

async function loadRooms(propertyId: string) {
  return prisma.room.findMany({
    where: { propertyId, deletedAt: null },
    select: { id: true, name: true, totalUnits: true },
    orderBy: { name: 'asc' },
  });
}

async function mapRoom(
  room: { id: string; name: string; totalUnits: number },
  range: { start: Date; end: Date },
): Promise<PropertyReportRoom> {
  const stock = await loadStock(room.id, range);
  return {
    roomId: room.id,
    roomName: room.name,
    days: eachDay(range).map((date) => toDay(date, room.totalUnits, stock)),
  };
}

async function loadStock(roomId: string, range: { start: Date; end: Date }) {
  const [booked, overrides] = await Promise.all([
    countHeld(roomId, range),
    loadOverrides(roomId, range),
  ]);
  return { booked, overrides };
}

async function countHeld(roomId: string, range: { start: Date; end: Date }) {
  const rows = await prisma.bookingNight.groupBy({
    by: ['date'],
    where: {
      date: { gte: range.start, lt: range.end },
      booking: { roomId, status: { in: [...HOLDING] } },
    },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [formatDateKey(row.date), row._count._all]));
}

async function loadOverrides(roomId: string, range: { start: Date; end: Date }) {
  const rows = await prisma.roomAvailability.findMany({
    where: { roomId, date: { gte: range.start, lt: range.end } },
    select: { date: true, isAvailable: true, availableUnits: true },
  });
  return new Map(rows.map((row) => [formatDateKey(row.date), row]));
}

function eachDay(range: { start: Date; end: Date }) {
  const days: Date[] = [];
  for (
    let cursor = dayjs.utc(formatDateKey(range.start));
    cursor.isBefore(dayjs.utc(formatDateKey(range.end)));
    cursor = cursor.add(1, 'day')
  ) {
    days.push(cursor.toDate());
  }
  return days;
}

function toDay(
  date: Date,
  totalUnits: number,
  stock: {
    booked: Map<string, number>;
    overrides: Map<string, { isAvailable: boolean; availableUnits: number | null }>;
  },
): PropertyReportDay {
  const key = formatDateKey(date);
  const override = stock.overrides.get(key);
  const blocked = override?.isAvailable === false;
  const capacity = override?.availableUnits ?? totalUnits;
  const bookedUnits = stock.booked.get(key) ?? 0;
  return {
    date: key,
    totalUnits: capacity,
    bookedUnits,
    availableUnits: blocked ? 0 : Math.max(0, capacity - bookedUnits),
    isBlocked: blocked,
  };
}
