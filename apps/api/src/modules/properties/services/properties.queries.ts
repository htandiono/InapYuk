import { prisma } from '../../../libs/prisma';
import { buildPaginationMeta, toPrismaPageArgs } from '../../../utils/pagination';
import { GetPropertiesQuery } from '../properties.schema';
import {
  fetchBaseProperties,
  evaluatePricesForProperties,
  mapToPropertyItem,
} from './properties.helpers';

export interface CityResult {
  city: string;
  province: string;
}

export async function getUniqueCities(): Promise<CityResult[]> {
  const properties = await prisma.property.findMany({
    where: { deletedAt: null },
    select: { city: true, province: true },
    distinct: ['city', 'province'],
    orderBy: { city: 'asc' },
  });
  return properties;
}

import { buildPropertyWhereClause } from './properties.helpers';

export async function searchProperties(query: GetPropertiesQuery) {
  const { skip, take } = toPrismaPageArgs({ page: query.page, limit: query.limit });

  const [total, rawProps] = await Promise.all([
    prisma.property.count({ where: buildPropertyWhereClause(query) }),
    fetchBaseProperties(query, skip, take)
  ]);

  const evaluated = await evaluatePricesForProperties(rawProps, query.checkIn, query.checkOut);

  return {
    items: evaluated.map(mapToPropertyItem),
    meta: buildPaginationMeta(total, query.page, query.limit),
  };
}

export async function getPropertyBySlug(slug: string) {
  return prisma.property.findUnique({
    where: { slug, deletedAt: null },
    include: {
      tenant: { select: { id: true, companyName: true, logoUrl: true } },
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      rooms: {
        where: { deletedAt: null },
        orderBy: { basePrice: 'asc' },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });
}

export async function getTenantProperties(tenantId: string, page: number = 1, limit: number = 10) {
  const { take, skip } = toPrismaPageArgs({ page, limit });
  const where = { tenantId, deletedAt: null };

  const [data, total] = await Promise.all([
    prisma.property.findMany({
      where, take, skip,
      include: { 
        category: true, 
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        rooms: { where: { deletedAt: null }, select: { name: true, basePrice: true } }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.property.count({ where }),
  ]);

  return { data, meta: buildPaginationMeta(total, page, limit) };
}
