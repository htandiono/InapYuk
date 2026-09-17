import type { PriceAdjustmentType } from '@inapyuk/types';
import { prisma } from '../libs/prisma';
import { eachNight, formatDateKey, toDateOnly } from '../utils/date';
import { notFound } from '../utils/app-error';

/**
 * SHARED CONTRACT between Feature 1 and Feature 2.
 *
 * Feature 1 (awanstywn) owns the tenant-facing screens that create the
 * PeakSeasonRate and RoomAvailability rows this reads. Feature 2 (htandiono)
 * calls it to quote and to snapshot booking nights.
 *
 * Changing an exported signature here needs a PR both of us approve.
 */

export interface NightlyRate {
  date: Date;
  basePrice: number;
  finalPrice: number;
  peakSeasonRateName: string | null;
  isAvailable: boolean;
  availableUnits: number;
}

export interface RoomPricing {
  roomId: string;
  propertyId: string;
  capacity: number;
  nights: NightlyRate[];
  nightCount: number;
  totalPrice: number;
  isAvailable: boolean;
  unavailableDates: string[];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value && typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

/** Rounded to whole rupiah - IDR has no minor unit in practice. */
export function applyAdjustment(
  basePrice: number,
  type: PriceAdjustmentType,
  value: number,
): number {
  const adjusted = type === 'PERCENTAGE' ? basePrice * (1 + value / 100) : basePrice + value;
  return Math.max(0, Math.round(adjusted));
}

interface RateWindow {
  name: string;
  startDate: Date;
  endDate: Date;
  adjustmentType: PriceAdjustmentType;
  adjustmentValue: number;
}

/** Later-created rates win when two windows cover the same night. */
function findRateForDate(rates: RateWindow[], date: Date): RateWindow | null {
  const key = formatDateKey(date);
  const matches = rates.filter(
    (rate) => key >= formatDateKey(rate.startDate) && key <= formatDateKey(rate.endDate),
  );
  return matches.length > 0 ? (matches[matches.length - 1] as RateWindow) : null;
}

async function loadRoom(roomId: string) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, deletedAt: null },
    select: { id: true, propertyId: true, basePrice: true, capacity: true, totalUnits: true },
  });
  if (!room) throw notFound('Room not found');
  return room;
}

/** Bookings that hold a unit on a given night, keyed by date. */
async function countBookedUnits(
  roomId: string,
  from: Date,
  to: Date,
): Promise<Map<string, number>> {
  const rows = await prisma.bookingNight.groupBy({
    by: ['date'],
    where: {
      date: { gte: from, lt: to },
      booking: {
        roomId,
        status: { in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'PROCESSED', 'COMPLETED'] },
      },
    },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [formatDateKey(row.date), row._count._all]));
}

async function loadAvailabilityOverrides(roomId: string, from: Date, to: Date) {
  const rows = await prisma.roomAvailability.findMany({
    where: { roomId, date: { gte: from, lt: to } },
    select: { date: true, isAvailable: true, availableUnits: true },
  });
  return new Map(rows.map((row) => [formatDateKey(row.date), row]));
}

async function loadRates(roomId: string, from: Date, to: Date): Promise<RateWindow[]> {
  const rows = await prisma.peakSeasonRate.findMany({
    where: { roomId, startDate: { lt: to }, endDate: { gte: from } },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((row) => ({
    name: row.name,
    startDate: row.startDate,
    endDate: row.endDate,
    adjustmentType: row.adjustmentType as PriceAdjustmentType,
    adjustmentValue: toNumber(row.adjustmentValue),
  }));
}

/**
 * Resolves the nightly price and remaining capacity for every night between
 * check-in and check-out. Check-out day is excluded.
 */
export async function resolveRoomPricing(params: {
  roomId: string;
  checkIn: Date | string;
  checkOut: Date | string;
}): Promise<RoomPricing> {
  const room = await loadRoom(params.roomId);
  const nights = eachNight(params.checkIn, params.checkOut);
  if (nights.length === 0) throw notFound('Check-out must be at least one night after check-in');
  const from = toDateOnly(params.checkIn);
  const to = toDateOnly(params.checkOut);
  const [overrides, booked, rates] = await Promise.all([
    loadAvailabilityOverrides(room.id, from, to),
    countBookedUnits(room.id, from, to),
    loadRates(room.id, from, to),
  ]);
  const basePrice = toNumber(room.basePrice);
  const resolved = nights.map((date) =>
    buildNightlyRate({ date, basePrice, room, overrides, booked, rates }),
  );
  return summarise(room, resolved);
}

interface BuildNightArgs {
  date: Date;
  basePrice: number;
  room: { totalUnits: number };
  overrides: Map<string, { isAvailable: boolean; availableUnits: number | null }>;
  booked: Map<string, number>;
  rates: RateWindow[];
}

function buildNightlyRate(args: BuildNightArgs): NightlyRate {
  const key = formatDateKey(args.date);
  const override = args.overrides.get(key);
  const capacity = override?.availableUnits ?? args.room.totalUnits;
  const remaining = Math.max(0, capacity - (args.booked.get(key) ?? 0));
  const rate = findRateForDate(args.rates, args.date);

  return {
    date: args.date,
    basePrice: args.basePrice,
    finalPrice: rate
      ? applyAdjustment(args.basePrice, rate.adjustmentType, rate.adjustmentValue)
      : args.basePrice,
    peakSeasonRateName: rate?.name ?? null,
    isAvailable: override?.isAvailable !== false && remaining > 0,
    availableUnits: remaining,
  };
}

function summarise(
  room: { id: string; propertyId: string; capacity: number },
  nights: NightlyRate[],
): RoomPricing {
  const unavailableDates = nights.filter((n) => !n.isAvailable).map((n) => formatDateKey(n.date));
  return {
    roomId: room.id,
    propertyId: room.propertyId,
    capacity: room.capacity,
    nights,
    nightCount: nights.length,
    totalPrice: nights.reduce((s, n) => s + n.finalPrice, 0),
    isAvailable: unavailableDates.length === 0,
    unavailableDates,
  };
}
