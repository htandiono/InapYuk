import { Request, Response, NextFunction } from 'express';
import { sendPaginated, sendSuccess, sendError } from '../../utils/api-response';
import { getUniqueCities, searchProperties, getPropertyBySlug } from './properties.service';
import { getPropertiesQuerySchema, getPropertyPricingSchema } from './properties.schema';
import { resolveRoomPricing } from '../../services/pricing.service';
import { dayjs } from '../../utils/date';

export async function getCities(
  req: Request, res: Response, next: NextFunction
) {
  try {
    const cities = await getUniqueCities();
    sendSuccess(res, cities, 'Success fetching cities');
  } catch (error) {
    next(error);
  }
}

export async function getProperties(
  req: Request, res: Response, next: NextFunction
) {
  try {
    const query = getPropertiesQuerySchema.parse(req.query);
    const { items, meta } = await searchProperties(query);
    sendPaginated(res, items, meta, 'Success fetching properties');
  } catch (error) {
    next(error);
  }
}

export async function getPropertyDetail(
  req: Request, res: Response, next: NextFunction
) {
  try {
    const property = await getPropertyBySlug(req.params.slug as string);
    if (!property) return sendError(res, 404, 'Property tidak ditemukan');
    sendSuccess(res, property, 'Success fetching property detail');
  } catch (error) {
    next(error);
  }
}

function buildMonthDateRange(year: number, month: number) {
  const start = dayjs.utc().year(year).month(month - 1).date(1);
  return {
    checkIn: start.format('YYYY-MM-DD'),
    checkOut: start.add(1, 'month').format('YYYY-MM-DD'),
  };
}

import { prisma } from '../../libs/prisma';

export async function getPropertyCalendar(
  req: Request, res: Response, next: NextFunction
) {
  try {
    const query = getPropertyPricingSchema.parse(req.query);
    const room = await prisma.room.findFirst({ 
      where: { id: query.roomId, property: { slug: req.params.slug as string } } 
    });
    if (!room) return sendError(res, 404, 'Room not found for this property');

    const { checkIn, checkOut } = buildMonthDateRange(query.year, query.month);
    const pricing = await resolveRoomPricing({ roomId: query.roomId, checkIn, checkOut });
    sendSuccess(res, pricing.nights, 'Success fetching room pricing');
  } catch (error) {
    next(error);
  }
}
