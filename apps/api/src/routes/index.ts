import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import usersRoutes from '../modules/users/users.routes';
import categoriesRoutes from '../modules/categories/categories.routes';
import roomsRoutes from '../modules/rooms/rooms.routes';
import propertiesRoutes from '../modules/properties/properties.routes';
import bookingsRoutes from '../modules/bookings/bookings.routes';
import reviewsRoutes from '../modules/reviews/reviews.routes';
import reportsRoutes from '../modules/reports/reports.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';
import cronRoutes from '../modules/cron/cron.routes';
import geoRoutes from '../modules/geo/geo.routes';
import { sendSuccess } from '../utils/api-response';

const router = Router();

router.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() }, 'InapYuk API is running');
});

// Feature 1 - awanstywn
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/rooms', roomsRoutes);
router.use('/properties', propertiesRoutes);
router.use('/geo', geoRoutes);

// Feature 2 - htandiono
router.use('/bookings', bookingsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/reports', reportsRoutes);
router.use('/notifications', notificationsRoutes);

// Shared
router.use('/cron', cronRoutes);

export default router;
