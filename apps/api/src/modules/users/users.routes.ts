import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { uploadProfileImage } from '../../middlewares/upload.middleware';
import { changeEmailLimiter } from '../../middlewares/rate-limit.middleware';
import {
  updateProfileSchema,
  requestEmailChangeSchema,
  verifyEmailChangeSchema,
  changePasswordSchema,
} from './users.schema';
import {
  handleGetProfile,
  handleUpdateProfile,
  handleRequestEmailChange,
  handleVerifyEmailChange,
  handleChangePassword,
  handleLinkGoogle,
} from './users.controller';

const router = Router();

router.post(
  '/email/verify',
  validateBody(verifyEmailChangeSchema),
  asyncHandler(handleVerifyEmailChange),
);

router.use(authenticate);

router.get('/profile', asyncHandler(handleGetProfile));

router.patch(
  '/profile',
  uploadProfileImage.single('avatar'),
  validateBody(updateProfileSchema),
  asyncHandler(handleUpdateProfile),
);

router.post(
  '/email',
  changeEmailLimiter,
  validateBody(requestEmailChangeSchema),
  asyncHandler(handleRequestEmailChange),
);



router.post('/password', validateBody(changePasswordSchema), asyncHandler(handleChangePassword));

router.post('/google-link', asyncHandler(handleLinkGoogle));

export default router;
