import type { BookingDetailDto, JwtPayload } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { uploadImage } from '../../libs/cloudinary';
import { badRequest, conflict } from '../../utils/app-error';
import { computeActions } from './bookings.actions';
import { getByOrderNumber } from './bookings.detail';
import { loadGuestBooking } from './bookings.owned';
import { assertTransition } from './status-machine';

export async function uploadPaymentProof(
  orderNumber: string,
  caller: JwtPayload,
  file: Express.Multer.File | undefined,
): Promise<BookingDetailDto> {
  if (!file) throw badRequest('Kirim foto bukti transfer (.jpg atau .png, max 1MB)');
  const booking = await loadGuestBooking(orderNumber, caller);
  assertCanUpload(booking, caller);
  const proofUrl = await uploadImage(file, 'payment-proofs');
  await markProofUploaded(booking.id, proofUrl);
  return getByOrderNumber(orderNumber, caller);
}

function assertCanUpload(
  booking: Awaited<ReturnType<typeof loadGuestBooking>>,
  caller: JwtPayload,
): void {
  const actions = computeActions(booking, caller);
  if (!actions.canUploadPaymentProof) {
    throw conflict('Bukti transfer hanya bisa diunggah selama jendela pembayaran masih terbuka');
  }
  assertTransition(booking.status, 'WAITING_CONFIRMATION');
}

async function markProofUploaded(bookingId: string, paymentProofUrl: string) {
  const now = new Date();
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'WAITING_CONFIRMATION',
      paymentProofUrl,
      paymentProofUploadedAt: now,
    },
  });
}
