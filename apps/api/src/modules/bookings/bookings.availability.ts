import { eachNight, formatDateKey, toDateOnly } from '../../utils/date';
import { conflict, notFound } from '../../utils/app-error';
import type { BookingDb } from './bookings.db';

const HOLDING_STATUSES = [
  'WAITING_PAYMENT',
  'WAITING_CONFIRMATION',
  'PROCESSED',
  'COMPLETED',
] as const;

interface Stock {
  booked: Map<string, number>;
  overrides: Map<string, { isAvailable: boolean; availableUnits: number | null }>;
}

export async function assertStillAvailable(
  db: BookingDb,
  roomId: string,
  checkIn: string,
  checkOut: string,
): Promise<void> {
  const room = await loadActiveRoom(db, roomId);
  const nights = eachNight(checkIn, checkOut);
  const stock = await loadStock(db, room.id, toDateOnly(checkIn), toDateOnly(checkOut));
  const blocked = nights.some((date) => unitsLeft(date, room.totalUnits, stock) <= 0);
  if (blocked) throw conflict('Room is no longer available for the selected dates');
}

async function loadActiveRoom(db: BookingDb, roomId: string) {
  const room = await db.room.findFirst({
    where: { id: roomId, deletedAt: null },
    select: { id: true, totalUnits: true },
  });
  if (!room) throw notFound('Room not found');
  return room;
}

async function loadStock(db: BookingDb, roomId: string, from: Date, to: Date): Promise<Stock> {
  const [booked, overrides] = await Promise.all([
    countHeld(db, roomId, from, to),
    loadOverrides(db, roomId, from, to),
  ]);
  return { booked, overrides };
}

async function countHeld(db: BookingDb, roomId: string, from: Date, to: Date) {
  const rows = await db.bookingNight.groupBy({
    by: ['date'],
    where: {
      date: { gte: from, lt: to },
      booking: { roomId, status: { in: [...HOLDING_STATUSES] } },
    },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [formatDateKey(row.date), row._count._all]));
}

async function loadOverrides(db: BookingDb, roomId: string, from: Date, to: Date) {
  const rows = await db.roomAvailability.findMany({
    where: { roomId, date: { gte: from, lt: to } },
    select: { date: true, isAvailable: true, availableUnits: true },
  });
  return new Map(rows.map((row) => [formatDateKey(row.date), row]));
}

function unitsLeft(date: Date, totalUnits: number, stock: Stock): number {
  const key = formatDateKey(date);
  const override = stock.overrides.get(key);
  if (override?.isAvailable === false) return 0;
  const capacity = override?.availableUnits ?? totalUnits;
  return Math.max(0, capacity - (stock.booked.get(key) ?? 0));
}
