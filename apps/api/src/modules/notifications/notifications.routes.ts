import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateParams, validateQuery } from '../../middlewares/validate.middleware';
import { getUnreadCount, listMine, readAll, readOne } from './notifications.controller';
import { notificationIdParamsSchema, notificationListQuerySchema } from './notifications.schema';

/**
 * Owner: Feature 2 - htandiono (Sprint 3)
 *
 *   GET    /notifications
 *   GET    /notifications/unread-count
 *   PATCH  /notifications/read-all
 *   PATCH  /notifications/:id/read
 */
const router = Router();

router.use(authenticate);
router.get('/', validateQuery(notificationListQuerySchema), listMine);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', readAll);
router.patch('/:id/read', validateParams(notificationIdParamsSchema), readOne);

export default router;
