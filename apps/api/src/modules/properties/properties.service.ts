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

export async function searchProperties(query: GetPropertiesQuery) {
  const { page, limit, city, checkIn, checkOut, guests, name, category, sortBy, sortOrder } = query;
  
  // 1. Fetch properties matching base criteria
  const properties = await prisma.property.findMany({
    where: {
      deletedAt: null,
      ...(city && { city }),
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(category && { category: { slug: category } }),
      rooms: {
        some: { capacity: { gte: guests }, deletedAt: null }
      }
    },
    include: {
      category: true,
      rooms: {
        where: { capacity: { gte: guests }, deletedAt: null },
        select: { id: true, basePrice: true },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
    },
  });

  // 2. Evaluate pricing for each property's rooms
  const evaluatedProps = [];
  
  for (const prop of properties) {
    if (prop.rooms.length === 0) continue;

    let cheapestPrice = Infinity;
    let isAvailable = false;

    if (checkIn && checkOut) {
      // Calculate real price using the shared pricing service
      for (const room of prop.rooms) {
        try {
          const pricing = await resolveRoomPricing({
            roomId: room.id,
            checkIn,
            checkOut
          });
          
          if (pricing.isAvailable) {
            isAvailable = true;
            // Average nightly price
            const nightly = pricing.nightCount > 0 ? pricing.totalPrice / pricing.nightCount : 0;
            if (nightly < cheapestPrice) cheapestPrice = nightly;
          }
        } catch {
          // Ignore rooms that fail resolution
        }
      }
    } else {
      // Fallback: just use lowest basePrice if no dates provided
      isAvailable = true;
      cheapestPrice = Math.min(...prop.rooms.map((r) => Number(r.basePrice)));
    }

    if (isAvailable && cheapestPrice !== Infinity) {
      evaluatedProps.push({
        ...prop,
        cheapestPrice,
      });
    }
  }

  // 3. Sort in-memory
  evaluatedProps.sort((a, b) => {
    if (sortBy === 'price') {
      return sortOrder === 'asc' ? a.cheapestPrice - b.cheapestPrice : b.cheapestPrice - a.cheapestPrice;
    }
    // Sort by name
    return sortOrder === 'asc' 
      ? a.name.localeCompare(b.name) 
      : b.name.localeCompare(a.name);
  });

  // 4. Paginate
  const pageArgs = toPrismaPageArgs({ page, limit });
  const paginated = evaluatedProps.slice(pageArgs.skip, pageArgs.skip + pageArgs.take);

  // 5. Format response
  const items = paginated.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    city: p.city,
    province: p.province,
    categoryName: p.category.name,
    imageUrl: p.images[0]?.url || null,
    cheapestPrice: p.cheapestPrice,
  }));

  const meta = buildPaginationMeta(evaluatedProps.length, pageArgs.page, pageArgs.limit);

  return { items, meta };
}
