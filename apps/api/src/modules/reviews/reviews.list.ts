import type { ReviewListQuery, ReviewListResponse } from '@inapyuk/types';
import { Prisma } from '../../generated/prisma/client';
import { prisma } from '../../libs/prisma';
import { notFound } from '../../utils/app-error';
import { buildPaginationMeta, toPrismaPageArgs } from '../../utils/pagination';
import { reviewInclude, toReviewDto } from './reviews.mapper';

export async function listPropertyReviews(
  propertyId: string,
  query: ReviewListQuery,
): Promise<ReviewListResponse> {
  await assertPropertyExists(propertyId);
  return paginateReviews({ propertyId }, query);
}

export async function listTenantReviews(
  tenantId: string,
  query: ReviewListQuery,
): Promise<ReviewListResponse> {
  return paginateReviews(
    {
      property: { tenantId, ...(query.propertyId ? { id: query.propertyId } : {}) },
      ...(query.hasReply === undefined
        ? {}
        : { reply: query.hasReply ? { isNot: null } : { is: null } }),
    },
    query,
  );
}

async function paginateReviews(
  where: Prisma.ReviewWhereInput,
  query: ReviewListQuery,
): Promise<ReviewListResponse> {
  const pageArgs = toPrismaPageArgs(query);
  const [rows, total, stats] = await Promise.all([
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
      skip: pageArgs.skip,
      take: pageArgs.take,
    }),
    prisma.review.count({ where }),
    prisma.review.aggregate({ where, _avg: { rating: true }, _count: { _all: true } }),
  ]);
  return {
    items: rows.map(toReviewDto),
    meta: buildPaginationMeta(total, pageArgs.page, pageArgs.limit),
    averageRating: Number(stats._avg.rating ?? 0),
    reviewCount: stats._count._all,
  };
}

async function assertPropertyExists(propertyId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
    select: { id: true },
  });
  if (!property) throw notFound('Properti tidak ditemukan');
}
