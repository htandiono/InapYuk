import type { JwtPayload } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { notFound } from '../../utils/app-error';
import { bookingDetailInclude, type BookingRecord } from './bookings.mapper';

export async function loadGuestBooking(
  orderNumber: string,
  caller: JwtPayload,
): Promise<BookingRecord> {
  const booking = await prisma.booking.findUnique({
    where: { orderNumber },
    include: bookingDetailInclude,
  });
  if (!booking || booking.userId !== caller.sub) {
    throw notFound('Pesanan tidak ditemukan');
  }
  return booking;
}
