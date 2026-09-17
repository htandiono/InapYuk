import type { CreateReviewRequest, JwtPayload, ReviewDto } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { toDateOnly } from '../../utils/date';
import { badRequest, conflict, notFound } from '../../utils/app-error';
import { reviewInclude, toReviewDto } from './reviews.mapper';

export async function createReview(
  caller: JwtPayload,
  input: CreateReviewRequest,
): Promise<ReviewDto> {
  const booking = await loadCompletedStay(input.bookingId, caller.sub);
  assertCanReview(booking);
  const created = await prisma.review.create({
    data: {
      bookingId: booking.id,
      userId: caller.sub,
      propertyId: booking.propertyId,
      rating: input.rating,
      comment: input.comment,
    },
    include: reviewInclude,
  });
  return toReviewDto(created);
}

async function loadCompletedStay(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: { select: { id: true } } },
  });
  if (!booking || booking.userId !== userId) throw notFound('Pesanan tidak ditemukan');
  return booking;
}

function assertCanReview(booking: {
  status: string;
  checkOut: Date;
  review: { id: string } | null;
}) {
  if (booking.review) throw conflict('Pesanan ini sudah pernah diulas');
  if (booking.status !== 'COMPLETED') {
    throw conflict('Ulasan hanya untuk menginap yang sudah selesai');
  }
  if (toDateOnly(booking.checkOut).getTime() > toDateOnly(new Date()).getTime()) {
    throw badRequest('Tunggu sampai tanggal check-out lewat dulu');
  }
}
