import type { BookingDetailDto, JwtPayload } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { conflict } from '../../utils/app-error';
import { notifyUser } from '../notifications/notify';
import { computeActions } from './bookings.actions';
import { getByOrderNumber } from './bookings.detail';
import { loadTenantBooking } from './bookings.owned';
import { assertTransition } from './status-machine';
import type { BookingRecord } from './bookings.mapper';

export async function cancelTenantBooking(
  orderNumber: string,
  tenantId: string,
  caller: JwtPayload,
  reason?: string,
): Promise<BookingDetailDto> {
  const booking = await loadTenantBooking(orderNumber, tenantId);
  assertCanCancel(booking, caller);
  await markCancelled(booking.id, reason);
  await notifyGuestOfCancel(booking.userId, booking.orderNumber, booking.id, reason);
  return getByOrderNumber(orderNumber, caller);
}

function assertCanCancel(booking: BookingRecord, caller: JwtPayload): void {
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
      cancelledBy: 'TENANT',
      cancelledAt: new Date(),
      cancelReason: reason ?? 'Dibatalkan oleh pemilik',
    },
  });
}

async function notifyGuestOfCancel(
  userId: string,
  orderNumber: string,
  bookingId: string,
  reason?: string,
) {
  await notifyUser({
    userId,
    type: 'BOOKING_CANCELLED',
    title: 'Pesanan dibatalkan pemilik',
    body: reason
      ? `Pesanan ${orderNumber} dibatalkan: ${reason}`
      : `Pemilik membatalkan pesanan ${orderNumber}. Kamarnya sudah dilepas.`,
    bookingId,
  });
}
