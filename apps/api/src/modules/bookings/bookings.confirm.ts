import type { BookingDetailDto, ConfirmPaymentRequest, JwtPayload } from '@inapyuk/types';
import { env } from '../../config/env';
import { prisma } from '../../libs/prisma';
import { addMinutes } from '../../utils/date';
import { conflict } from '../../utils/app-error';
import { notifyUser } from '../notifications/notify';
import { computeActions } from './bookings.actions';
import { getByOrderNumber } from './bookings.detail';
import { loadTenantBooking } from './bookings.owned';
import { assertTransition } from './status-machine';
import type { BookingRecord } from './bookings.mapper';

export async function confirmPayment(
  orderNumber: string,
  tenantId: string,
  caller: JwtPayload,
  input: ConfirmPaymentRequest,
): Promise<BookingDetailDto> {
  const booking = await loadTenantBooking(orderNumber, tenantId);
  assertCanDecide(booking, caller);
  if (input.accept) await acceptProof(booking.id);
  else await rejectProof(booking.id, input.rejectionReason);
  await notifyGuestOfDecision(booking, input);
  return getByOrderNumber(orderNumber, caller);
}

function assertCanDecide(booking: BookingRecord, caller: JwtPayload): void {
  if (!computeActions(booking, caller).canConfirmPayment) {
    throw conflict('Bukti transfer ini belum bisa dikonfirmasi');
  }
}

async function acceptProof(bookingId: string) {
  assertTransition('WAITING_CONFIRMATION', 'PROCESSED');
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'PROCESSED', confirmedAt: new Date(), cancelReason: null },
  });
}

async function rejectProof(bookingId: string, reason?: string) {
  assertTransition('WAITING_CONFIRMATION', 'WAITING_PAYMENT');
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'WAITING_PAYMENT',
      paymentProofUrl: null,
      paymentProofUploadedAt: null,
      paymentDeadline: addMinutes(new Date(), env.PAYMENT_DEADLINE_MINUTES),
      cancelReason: reason ?? 'Bukti transfer ditolak',
    },
  });
}

async function notifyGuestOfDecision(booking: BookingRecord, input: ConfirmPaymentRequest) {
  if (input.accept) await notifyAccepted(booking);
  else await notifyRejected(booking, input.rejectionReason);
}

async function notifyAccepted(booking: BookingRecord) {
  await notifyUser({
    userId: booking.userId,
    type: 'PAYMENT_ACCEPTED',
    title: 'Pembayaran diterima',
    body: `Pembayaran untuk ${booking.orderNumber} sudah dikonfirmasi. Siap menginap!`,
    bookingId: booking.id,
  });
}

async function notifyRejected(booking: BookingRecord, reason?: string) {
  await notifyUser({
    userId: booking.userId,
    type: 'PAYMENT_REJECTED',
    title: 'Bukti transfer ditolak',
    body: rejectBody(booking.orderNumber, reason),
    bookingId: booking.id,
  });
}

function rejectBody(orderNumber: string, reason?: string) {
  if (reason) return `Bukti untuk ${orderNumber} ditolak: ${reason}`;
  return `Bukti untuk ${orderNumber} ditolak. Unggah ulang sebelum waktunya habis.`;
}
