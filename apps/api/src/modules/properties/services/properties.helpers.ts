import type { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../../libs/prisma';
import { resolveRoomPricing } from '../../../services/pricing.service';
import { GetPropertiesQuery } from '../properties.schema';

// ── Query helpers ────────────────────────────────────────────────────────────

export function buildPropertyWhereClause(query: GetPropertiesQuery): Prisma.PropertyWhereInput {
  return {
    deletedAt: null,
    ...(query.city && { city: query.city }),
    ...(query.name && { name: { contains: query.name, mode: 'insensitive' } }),
    ...(query.category && { category: { slug: query.category } }),
    rooms: { some: { capacity: { gte: query.guests }, deletedAt: null } },
  };
}

export async function getPagedIdsByPrice(query: GetPropertiesQuery, skip: number, take: number) {
  const all = await prisma.property.findMany({
    where: buildPropertyWhereClause(query),
    select: { id: true, rooms: { select: { basePrice: true } } },
  });
  const mapped = all.map((p) => ({
    id: p.id,
    min: p.rooms.length > 0 ? Math.min(...p.rooms.map((r) => Number(r.basePrice))) : Infinity,
  }));
  mapped.sort((a, b) => (query.sortOrder === 'asc' ? a.min - b.min : b.min - a.min));
  return mapped.slice(skip, skip + take).map((p) => p.id);
}

export async function fetchBaseProperties(query: GetPropertiesQuery, skip?: number, take?: number) {
  const isPrice = query.sortBy === 'price' && skip !== undefined && take !== undefined;
  const ids = isPrice ? await getPagedIdsByPrice(query, skip!, take!) : undefined;
  const props = await prisma.property.findMany({
    where: isPrice ? { id: { in: ids } } : buildPropertyWhereClause(query),
    skip: isPrice ? undefined : skip, take: isPrice ? undefined : take, orderBy: isPrice ? undefined : { name: query.sortOrder },
    include: {
      tenant: { select: { id: true, companyName: true, logoUrl: true } }, category: true,
      rooms: { where: { capacity: { gte: query.guests }, deletedAt: null }, select: { id: true, basePrice: true } },
      images: { orderBy: { sortOrder: 'asc' }, take: 5 },
    },
  });
  if (isPrice) props.sort((a, b) => ids!.indexOf(a.id) - ids!.indexOf(b.id));
  return props;
}

export type BaseProperty = Awaited<ReturnType<typeof fetchBaseProperties>>[number];
export type BaseRoom = BaseProperty['rooms'][number];

export async function computeDynamicPrice(room: BaseRoom, checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return { isAvailable: true, price: Number(room.basePrice) };
  try {
    const p = await resolveRoomPricing({ roomId: room.id, checkIn, checkOut });
    if (!p.isAvailable || p.nightCount === 0) return { isAvailable: false, price: Infinity };
    return { isAvailable: true, price: p.totalPrice / p.nightCount };
  } catch {
    return { isAvailable: false, price: Infinity };
  }
}

export async function evaluateSingleProperty(prop: BaseProperty, checkIn?: string, checkOut?: string) {
  let cheapest = Infinity, isAvail = false;
  for (const room of prop.rooms) {
    const { isAvailable, price } = await computeDynamicPrice(room, checkIn, checkOut);
    if (isAvailable && price < cheapest) { isAvail = true; cheapest = price; }
  }
  return { isAvail, cheapest };
}

export async function evaluatePricesForProperties(
  properties: BaseProperty[],
  checkIn?: string,
  checkOut?: string,
) {
  const evaluatedProps = [];
  for (const prop of properties) {
    const { isAvail, cheapest } = await evaluateSingleProperty(prop, checkIn, checkOut);
    if (isAvail && cheapest !== Infinity) evaluatedProps.push({ ...prop, cheapestPrice: cheapest });
  }
  return evaluatedProps;
}

export function sortProperties(
  props: (BaseProperty & { cheapestPrice: number })[],
  sortBy: string,
  sortOrder: 'asc' | 'desc',
) {
  return props.sort((a, b) => {
    if (sortBy === 'price') {
      return sortOrder === 'asc'
        ? a.cheapestPrice - b.cheapestPrice
        : b.cheapestPrice - a.cheapestPrice;
    }
    return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });
}

// Shared helpers used by both queries and mutations
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.property.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

export function mapToPropertyItem(p: { id: string; name: string; slug: string; city: string; province: string; tenant?: { companyName: string } | null; category?: { name: string } | null; images: { url: string }[]; cheapestPrice?: number | null; }) {
  return {
    id: p.id, name: p.name, slug: p.slug, city: p.city, province: p.province,
    tenantName: p.tenant?.companyName || null, categoryName: p.category?.name || null,
    imageUrls: p.images.map(img => img.url), cheapestPrice: p.cheapestPrice,
  };
}
