import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/api-response';
import { getUniqueCities } from './properties.service';

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
