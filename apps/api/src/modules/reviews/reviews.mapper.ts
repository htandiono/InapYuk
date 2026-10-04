import type { ReviewDto, ReviewReplyDto } from '@inapyuk/types';

type ReviewRow = {
  id: string;
  bookingId: string;
  propertyId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: { id: string; name: string; avatarUrl: string | null };
  reply: {
    id: string;
    comment: string;
    createdAt: Date;
    tenant: { companyName: string };
  } | null;
};

export const reviewInclude = {
  user: { select: { id: true, name: true, avatarUrl: true } },
  reply: {
    include: { tenant: { select: { companyName: true } } },
  },
};

export function toReviewDto(row: ReviewRow): ReviewDto {
  return {
    id: row.id,
    bookingId: row.bookingId,
    propertyId: row.propertyId,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
    author: row.user,
    reply: row.reply ? toReplyDto(row.reply) : null,
  };
}

function toReplyDto(reply: NonNullable<ReviewRow['reply']>): ReviewReplyDto {
  return {
    id: reply.id,
    comment: reply.comment,
    createdAt: reply.createdAt.toISOString(),
    tenantName: reply.tenant.companyName,
  };
}
