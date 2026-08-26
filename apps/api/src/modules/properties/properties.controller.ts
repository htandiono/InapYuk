import { Request, Response, NextFunction } from 'express';
import { sendPaginated, sendSuccess, sendError } from '../../utils/api-response';
import { getUniqueCities, searchProperties, getPropertyBySlug } from './properties.service';
import { getPropertiesQuerySchema, getPropertyPricingSchema } from './properties.schema';
import { resolveRoomPricing } from '../../services/pricing.service';
import { dayjs } from '../../utils/date';

export async function getCities(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cities = await getUniqueCities();
    sendSuccess(res, cities, 'Success fetching cities');
  } catch (error) {
    next(error);
  }
}

export async function getProperties(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = getPropertiesQuerySchema.parse(req.query);
    const { items, meta } = await searchProperties(query);
    sendPaginated(res, items, meta, 'Success fetching properties');
  } catch (error) {
    next(error);
  }
}

export async function getPropertyDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;
    const property = await getPropertyBySlug(slug as string);
    
    if (!property) {
      return sendError(res, 404, 'Property tidak ditemukan');
    }

    sendSuccess(res, property, 'Success fetching property detail');
  } catch (error) {
    next(error);
  }
}

export async function getPropertyCalendar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = getPropertyPricingSchema.parse(req.query);
    
    // CheckIn is 1st of month, CheckOut is 1st of next month
    const checkIn = dayjs.utc().year(query.year).month(query.month - 1).date(1).format('YYYY-MM-DD');
    const checkOut = dayjs.utc().year(query.year).month(query.month - 1).date(1).add(1, 'month').format('YYYY-MM-DD');

    const pricing = await resolveRoomPricing({
      roomId: query.roomId,
      checkIn,
      checkOut,
    });

    sendSuccess(res, pricing.nights, 'Success fetching room pricing');
  } catch (error) {
    next(error);
  }
}
