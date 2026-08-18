import type { PaginationMeta } from '@inapyuk/types';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PrismaPageArgs {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

/**
 * The spec forbids client-side pagination, so every list endpoint turns its
 * query into `skip`/`take` here and reports the totals back to the client.
 */
export function toPrismaPageArgs(input: PaginationInput): PrismaPageArgs {
  const page = Math.max(DEFAULT_PAGE, Math.trunc(input.page ?? DEFAULT_PAGE));
  const requested = Math.trunc(input.limit ?? DEFAULT_LIMIT);
  const limit = Math.min(MAX_LIMIT, Math.max(1, requested));
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && total > 0,
  };
}
