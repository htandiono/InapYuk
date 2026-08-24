import { prisma } from '../../libs/prisma';
import { GetPropertiesQuery } from './properties.schema';
import { resolveRoomPricing } from '../../services/pricing.service';
import { buildPaginationMeta, toPrismaPageArgs } from '../../utils/pagination';

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

import { Prisma } from '../../generated/prisma/client';

function buildPropertyWhereClause(query: GetPropertiesQuery): Prisma.PropertyWhereInput {
  return {
    deletedAt: null,
    ...(query.city && { city: query.city }),
    ...(query.name && { name: { contains: query.name, mode: 'insensitive' } }),
    ...(query.category && { category: { slug: query.category } }),
    rooms: { some: { capacity: { gte: query.guests }, deletedAt: null } }
  };
}

async function fetchBaseProperties(query: GetPropertiesQuery) {
  return prisma.property.findMany({
    where: buildPropertyWhereClause(query),
    include: {
      category: true,
      rooms: { where: { capacity: { gte: query.guests }, deletedAt: null }, select: { id: true, basePrice: true } },
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
    },
  });
}

type BaseProperty = Awaited<ReturnType<typeof fetchBaseProperties>>[number];
type BaseRoom = BaseProperty['rooms'][number];

async function computeDynamicPrice(room: BaseRoom, checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return { isAvailable: true, price: Number(room.basePrice) };
  try {
    const p = await resolveRoomPricing({ roomId: room.id, checkIn, checkOut });
    if (!p.isAvailable || p.nightCount === 0) return { isAvailable: false, price: Infinity };
    return { isAvailable: true, price: p.totalPrice / p.nightCount };
  } catch {
    return { isAvailable: false, price: Infinity };
  }
}

async function evaluatePricesForProperties(properties: BaseProperty[], checkIn?: string, checkOut?: string) {
  const evaluatedProps = [];
  for (const prop of properties) {
    let cheapest = Infinity, isAvail = false;
    for (const room of prop.rooms) {
      const { isAvailable, price } = await computeDynamicPrice(room, checkIn, checkOut);
      if (isAvailable && price < cheapest) { isAvail = true; cheapest = price; }
    }
    if (isAvail && cheapest !== Infinity) evaluatedProps.push({ ...prop, cheapestPrice: cheapest });
  }
  return evaluatedProps;
}

function sortProperties(props: (BaseProperty & { cheapestPrice: number })[], sortBy: string, sortOrder: 'asc' | 'desc') {
  return props.sort((a, b) => {
    if (sortBy === 'price') {
      return sortOrder === 'asc' ? a.cheapestPrice - b.cheapestPrice : b.cheapestPrice - a.cheapestPrice;
    }
    return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });
}

export async function searchProperties(query: GetPropertiesQuery) {
  const rawProps = await fetchBaseProperties(query);
  const evaluated = await evaluatePricesForProperties(rawProps, query.checkIn, query.checkOut);
  const sorted = sortProperties(evaluated, query.sortBy, query.sortOrder);
  
  const { skip, take } = toPrismaPageArgs({ page: query.page, limit: query.limit });
  const paginated = sorted.slice(skip, skip + take);

  const items = paginated.map(p => ({
    id: p.id, name: p.name, slug: p.slug, city: p.city, province: p.province,
    categoryName: p.category.name, imageUrl: p.images[0]?.url || null, cheapestPrice: p.cheapestPrice
  }));

  return { items, meta: buildPaginationMeta(sorted.length, query.page, query.limit) };
}

export async function getPropertyBySlug(slug: string) {
  const property = await prisma.property.findUnique({
    where: { slug, deletedAt: null },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      rooms: {
        where: { deletedAt: null },
        orderBy: { basePrice: 'asc' },
      },
    },
  });

  if (!property) return null;

  return property;
}
