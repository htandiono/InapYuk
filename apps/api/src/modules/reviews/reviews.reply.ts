import type { ReviewDto } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';
import { conflict, notFound } from '../../utils/app-error';
import { notifyUser } from '../notifications/notify';
import { reviewInclude, toReviewDto } from './reviews.mapper';

export async function replyToReview(
  tenantId: string,
  reviewId: string,
  comment: string,
): Promise<ReviewDto> {
  const review = await loadOwnedReview(tenantId, reviewId);
  if (review.reply) throw conflict('Ulasan ini sudah dibalas');
  await prisma.reviewReply.create({
    data: { reviewId: review.id, tenantId, comment },
  });
  await notifyReviewer(review);
  const updated = await prisma.review.findUniqueOrThrow({
    where: { id: review.id },
    include: reviewInclude,
  });
  return toReviewDto(updated);
}

async function notifyReviewer(review: { userId: string; property: { name: string }; bookingId: string }) {
  await notifyUser({
    userId: review.userId,
    type: 'REVIEW_REPLY',
    title: 'Pemilik membalas ulasanmu',
    body: `Ada balasan untuk ulasanmu di ${review.property.name}.`,
    bookingId: review.bookingId,
  });
}

async function loadOwnedReview(tenantId: string, reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      reply: { select: { id: true } },
      property: { select: { name: true, tenantId: true } },
    },
  });
  if (!review || review.property.tenantId !== tenantId) {
    throw notFound('Ulasan tidak ditemukan');
  }
  return review;
}
