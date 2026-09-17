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

async function getPagedIdsByPrice(query: GetPropertiesQuery, skip: number, take: number) {
  const all = await prisma.property.findMany({
    where: buildPropertyWhereClause(query),
    select: { id: true, rooms: { select: { basePrice: true } } }
  });
  const mapped = all.map(p => ({
    id: p.id,
    min: p.rooms.length > 0 ? Math.min(...p.rooms.map(r => Number(r.basePrice))) : Infinity
  }));
  mapped.sort((a, b) => query.sortOrder === 'asc' ? a.min - b.min : b.min - a.min);
  return mapped.slice(skip, skip + take).map(p => p.id);
}

async function fetchBaseProperties(query: GetPropertiesQuery, skip: number, take: number) {
  const isPrice = query.sortBy === 'price';
  const ids = isPrice ? await getPagedIdsByPrice(query, skip, take) : undefined;
  
  const props = await prisma.property.findMany({
    where: isPrice ? { id: { in: ids } } : buildPropertyWhereClause(query),
    skip: isPrice ? undefined : skip, take: isPrice ? undefined : take,
    orderBy: isPrice ? undefined : { name: query.sortOrder },
    include: {
      category: true,
      rooms: { where: { capacity: { gte: query.guests }, deletedAt: null }, select: { id: true, basePrice: true } },
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
    },
  });

  if (isPrice) props.sort((a, b) => ids!.indexOf(a.id) - ids!.indexOf(b.id));
  return props;
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

export async function searchProperties(query: GetPropertiesQuery) {
  const { skip, take } = toPrismaPageArgs({ page: query.page, limit: query.limit });
  
  const [total, rawProps] = await Promise.all([
    prisma.property.count({ where: buildPropertyWhereClause(query) }),
    fetchBaseProperties(query, skip, take)
  ]);

  const evaluated = await evaluatePricesForProperties(rawProps, query.checkIn, query.checkOut);
  
  const items = evaluated.map(p => ({
    id: p.id, name: p.name, slug: p.slug, city: p.city, province: p.province,
    categoryName: p.category.name, imageUrl: p.images[0]?.url || null, cheapestPrice: p.cheapestPrice
  }));

  return { items, meta: buildPaginationMeta(total, query.page, query.limit) };
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
