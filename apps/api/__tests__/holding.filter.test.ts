import { beforeEach, describe, expect, it, vi } from 'vitest';
import { holdingBookingWhere } from '../src/services/holding.filter';
import { assertStillAvailable } from '../src/modules/bookings/bookings.availability';
import type { BookingDb } from '../src/modules/bookings/bookings.db';

vi.mock('../src/libs/prisma', () => ({
  prisma: {
    room: { findFirst: vi.fn() },
    bookingNight: { groupBy: vi.fn() },
    roomAvailability: { findMany: vi.fn() },
    peakSeasonRate: { findMany: vi.fn() },
  },
}));

import { prisma } from '../src/libs/prisma';
import { resolveRoomPricing } from '../src/services/pricing.service';

describe('holdingBookingWhere', () => {
  it('drops unpaid bookings only after the payment deadline', () => {
    const now = new Date('2026-10-05T02:00:00.000Z');

    expect(holdingBookingWhere(now)).toEqual({
      status: {
        in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'PROCESSED', 'COMPLETED'],
      },
      OR: [
        { status: { not: 'WAITING_PAYMENT' } },
        { paymentDeadline: null },
        { paymentDeadline: { gt: now } },
      ],
    });
  });
});

describe('room hold queries', () => {
  beforeEach(() => {
    vi.mocked(prisma.room.findFirst).mockResolvedValue({
      id: 'room-1',
      propertyId: 'prop-1',
      basePrice: 100000,
      capacity: 2,
      totalUnits: 1,
    } as never);
    vi.mocked(prisma.bookingNight.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.roomAvailability.findMany).mockResolvedValue([]);
    vi.mocked(prisma.peakSeasonRate.findMany).mockResolvedValue([]);
  });

  it('asks pricing to ignore unpaid bookings past the deadline', async () => {
    await resolveRoomPricing({
      roomId: 'room-1',
      checkIn: '2026-10-10',
      checkOut: '2026-10-11',
    });

    expect(vi.mocked(prisma.bookingNight.groupBy)).toHaveBeenCalledWith(
      expect.objectContaining({ where: { date: expect.any(Object), booking: heldRoom('room-1') } }),
    );
  });

  it('asks the booking check to ignore unpaid bookings past the deadline', async () => {
    const groupBy = vi.fn().mockResolvedValue([]);
    const db = {
      room: { findFirst: vi.fn().mockResolvedValue({ id: 'room-1', totalUnits: 1 }) },
      bookingNight: { groupBy },
      roomAvailability: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as BookingDb;

    await assertStillAvailable(db, 'room-1', '2026-10-10', '2026-10-11');

    expect(groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { date: expect.any(Object), booking: heldRoom('room-1') } }),
    );
  });
});

function heldRoom(roomId: string) {
  return expect.objectContaining({
    roomId,
    status: { in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'PROCESSED', 'COMPLETED'] },
    OR: [
      { status: { not: 'WAITING_PAYMENT' } },
      { paymentDeadline: null },
      { paymentDeadline: { gt: expect.any(Date) } },
    ],
  });
}
