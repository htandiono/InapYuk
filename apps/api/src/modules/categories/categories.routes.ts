import { Router } from 'express';

/**
 * Owner: Feature 1 - awanstywn (Sprint 3)
 *
 * Planned endpoints:
 *   GET    /categories                public, used by the catalog filter
 *   GET    /tenant/categories
 *   POST   /tenant/categories
 *   PATCH  /tenant/categories/:id
 *   DELETE /tenant/categories/:id
 */

import { CategoriesController } from './categories.controller';
import { authenticate, requireRole, requireVerified, requireTenant } from '../../middlewares/auth.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { CreateCategorySchema, UpdateCategorySchema } from './categories.schema';

const router = Router();

const tenantOnly = [
  authenticate,
  requireRole('TENANT'),
  requireVerified,
  requireTenant
];

router.get('/tenant/categories', ...tenantOnly, CategoriesController.getTenantCategories);
router.post('/tenant/categories', ...tenantOnly, validateBody(CreateCategorySchema), CategoriesController.create);
router.patch('/tenant/categories/:id', ...tenantOnly, validateBody(UpdateCategorySchema), CategoriesController.update);
router.delete('/tenant/categories/:id', ...tenantOnly, CategoriesController.softDelete);

export default router;
