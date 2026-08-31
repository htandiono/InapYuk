import { Router } from 'express';
import { autocompleteAddress, reverseAddress } from './geo.controller';
import { authenticate, requireTenant } from '../../middlewares/auth.middleware';

const router = Router();

// Endpoint used by tenants when adding properties
router.get('/autocomplete', authenticate, requireTenant, autocompleteAddress);
router.get('/reverse', authenticate, requireTenant, reverseAddress);

export default router;
