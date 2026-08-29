import type { BookingDetailDto, JwtPayload } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { conflict } from '../../utils/app-error';
import { notifyUser } from '../notifications/notify';
import { computeActions } from './bookings.actions';
import { getByOrderNumber } from './bookings.detail';
import { loadGuestBooking } from './bookings.owned';
import { assertTransition } from './status-machine';

export async function cancelGuestBooking(
  orderNumber: string,
  caller: JwtPayload,
  reason?: string,
): Promise<BookingDetailDto> {
  const booking = await loadGuestBooking(orderNumber, caller);
  assertCanCancel(booking, caller);
  await markCancelled(booking.id, reason);
  await notifyTenantOfCancel(booking.property.tenantId, booking.orderNumber, booking.id);
  return getByOrderNumber(orderNumber, caller);
}

function assertCanCancel(
  booking: Awaited<ReturnType<typeof loadGuestBooking>>,
  caller: JwtPayload,
): void {
  if (!computeActions(booking, caller).canBeCancelled) {
    throw conflict('Pesanan ini sudah tidak bisa dibatalkan');
  }
  assertTransition(booking.status, 'CANCELLED');
}

async function markCancelled(bookingId: string, reason?: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      cancelledBy: 'USER',
      cancelledAt: new Date(),
      cancelReason: reason ?? 'Dibatalkan oleh tamu',
    },
  });
}

async function notifyTenantOfCancel(tenantId: string, orderNumber: string, bookingId: string) {
  const tenant = await prisma.tenantProfile.findUnique({
    where: { id: tenantId },
    select: { userId: true },
  });
  if (!tenant) return;
  await notifyUser({
    userId: tenant.userId,
    type: 'BOOKING_CANCELLED',
    title: 'Pesanan dibatalkan tamu',
    body: `Tamu membatalkan pesanan ${orderNumber}. Kamarnya sudah tersedia lagi.`,
    bookingId,
  });
}
