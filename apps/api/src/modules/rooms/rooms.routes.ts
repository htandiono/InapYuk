import { Router } from 'express';
import { RoomsController } from './rooms.controller';
import { authenticate, requireTenant, requireVerified } from '../../middlewares/auth.middleware';
import { uploadPropertyImages } from '../../middlewares/upload.middleware';

/**
 * Owner: Feature 1 - awanstywn (Sprint 3, Sprint 4)
 *
 * Planned endpoints:
 *   GET    /tenant/properties/:propertyId/rooms
 *   POST   /tenant/properties/:propertyId/rooms
 *   PATCH  /tenant/rooms/:id
 *   DELETE /tenant/rooms/:id
 *   PUT    /tenant/rooms/:id/availability     block or open a date range
 *   GET    /tenant/rooms/:id/peak-season
 *   POST   /tenant/rooms/:id/peak-season      nominal or percentage
 *   PATCH  /tenant/peak-season/:id
 *   DELETE /tenant/peak-season/:id
 */
const router = Router();

const tenantRouter = Router();
tenantRouter.use(authenticate, requireVerified, requireTenant);

// Rooms nested under property
tenantRouter.get('/properties/:propertyId/rooms', RoomsController.getList);
tenantRouter.post(
  '/properties/:propertyId/rooms',
  uploadPropertyImages.array('images', 5),
  RoomsController.create,
);

// Rooms direct
tenantRouter.patch('/rooms/:id', uploadPropertyImages.array('images', 5), RoomsController.update);
tenantRouter.delete('/rooms/:id', RoomsController.softDelete);

// Availability & Peak Season
tenantRouter.put('/rooms/:id/availability', RoomsController.updateAvailability);
tenantRouter.get('/rooms/:id/peak-season', RoomsController.getPeakSeasons);
tenantRouter.post('/rooms/:id/peak-season', RoomsController.createPeakSeason);
tenantRouter.patch('/peak-season/:id', RoomsController.updatePeakSeason);
tenantRouter.delete('/peak-season/:id', RoomsController.deletePeakSeason);

router.use('/tenant', tenantRouter);

export default router;
