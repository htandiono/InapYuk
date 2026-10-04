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
  const page = await loadReviewPage(where, pageArgs);
  return toReviewPage(page, pageArgs);
}

async function loadReviewPage(
  where: Prisma.ReviewWhereInput,
  pageArgs: ReturnType<typeof toPrismaPageArgs>,
) {
  const [rows, total, stats] = await Promise.all([
    findReviewRows(where, pageArgs),
    prisma.review.count({ where }),
    prisma.review.aggregate({ where, _avg: { rating: true }, _count: { _all: true } }),
  ]);
  return { rows, total, stats };
}

function findReviewRows(
  where: Prisma.ReviewWhereInput,
  pageArgs: ReturnType<typeof toPrismaPageArgs>,
) {
  return prisma.review.findMany({
    where,
    include: reviewInclude,
    orderBy: { createdAt: 'desc' as const },
    skip: pageArgs.skip,
    take: pageArgs.take,
  });
}

function toReviewPage(
  page: Awaited<ReturnType<typeof loadReviewPage>>,
  pageArgs: ReturnType<typeof toPrismaPageArgs>,
): ReviewListResponse {
  return {
    items: page.rows.map(toReviewDto),
    meta: buildPaginationMeta(page.total, pageArgs.page, pageArgs.limit),
    averageRating: Number(page.stats._avg.rating ?? 0),
    reviewCount: page.stats._count._all,
  };
}

async function assertPropertyExists(propertyId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
    select: { id: true },
  });
  if (!property) throw notFound('Properti tidak ditemukan');
}
