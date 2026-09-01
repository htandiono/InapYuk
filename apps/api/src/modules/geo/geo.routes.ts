import { Router } from 'express';
import { autocompleteAddress, reverseAddress } from './geo.controller';
import { optionalAuthenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Geocoding endpoints are public — they just search addresses, no data access
router.get('/autocomplete', optionalAuthenticate, autocompleteAddress);
router.get('/reverse', optionalAuthenticate, reverseAddress);

export default router;
