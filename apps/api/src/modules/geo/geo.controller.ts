import { Request, Response, NextFunction } from 'express';
import { searchAddress, reverseGeocode } from '../../libs/opencage';

export const autocompleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, province, city } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, message: 'Query parameter q is required' });
      return;
    }
    const suggestions = await searchAddress(
      q, typeof province === 'string' ? province : undefined, typeof city === 'string' ? city : undefined,
    );
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) { next(error); }
};

export const reverseAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
      return;
    }

    const formattedAddress = await reverseGeocode(Number(lat), Number(lng));
    res.json({ success: true, data: formattedAddress });
  } catch (error) {
    next(error);
  }
};
