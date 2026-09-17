import type { BookingDetailDto, JwtPayload } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { notFound } from '../../utils/app-error';
import { bookingDetailInclude, toDetailDto, type BookingRecord } from './bookings.mapper';

export async function getByOrderNumber(
  orderNumber: string,
  caller: JwtPayload,
): Promise<BookingDetailDto> {
  const booking = await prisma.booking.findUnique({
    where: { orderNumber },
    include: bookingDetailInclude,
  });
  if (!booking) throw notFound('Booking not found');
  await assertCanRead(booking, caller);
  return toDetailDto(booking, caller);
}

async function assertCanRead(booking: BookingRecord, caller: JwtPayload): Promise<void> {
  if (caller.role === 'USER' && booking.userId === caller.sub) return;
  if (caller.role === 'TENANT' && (await ownsProperty(caller.sub, booking.property.tenantId))) {
    return;
  }
  throw notFound('Booking not found');
}

async function ownsProperty(userId: string, tenantId: string): Promise<boolean> {
  const profile = await prisma.tenantProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id === tenantId;
}
