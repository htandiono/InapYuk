import { Router } from 'express';
import { getCities, getProperties, getPropertyDetail, getPropertyCalendar } from './properties.controller';

const router = Router();

router.get('/cities', getCities);
router.get('/', getProperties);
router.get('/:slug', getPropertyDetail);
router.get('/:slug/calendar', getPropertyCalendar);

export default router;
