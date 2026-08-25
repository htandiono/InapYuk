import { Request, Response, NextFunction } from 'express';
import { sendPaginated, sendSuccess } from '../../utils/api-response';
import { getUniqueCities, searchProperties } from './properties.service';
import { getPropertiesQuerySchema } from './properties.schema';

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
