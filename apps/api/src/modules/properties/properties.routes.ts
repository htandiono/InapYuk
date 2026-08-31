import { Router } from 'express';
import { getCities, getProperties, getPropertyDetail, getPropertyCalendar, TenantPropertiesController } from './properties.controller';
import { authenticate, requireTenant, requireVerified } from '../../middlewares/auth.middleware';
import { uploadPropertyImages } from '../../middlewares/upload.middleware';

const router = Router();

// Public routes
router.get('/', getProperties);
router.get('/cities', getCities);
router.get('/:slug/calendar', getPropertyCalendar);
router.get('/:slug', getPropertyDetail);

// Tenant routes
const tenantRouter = Router();
tenantRouter.use(authenticate, requireVerified, requireTenant);

tenantRouter.get('/', TenantPropertiesController.getTenantPropertiesList);
tenantRouter.get('/:id', TenantPropertiesController.getById);
tenantRouter.post('/', uploadPropertyImages.array('images', 10), TenantPropertiesController.create);
tenantRouter.patch('/:id', uploadPropertyImages.array('images', 10), TenantPropertiesController.update);
tenantRouter.delete('/:id', TenantPropertiesController.softDelete);

router.use('/tenant/properties', tenantRouter);

export default router;
