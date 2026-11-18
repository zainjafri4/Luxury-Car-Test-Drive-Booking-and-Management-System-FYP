import { Router } from 'express';
import { notificationsController } from './controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { notificationsQuerySchema } from './schemas.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', validate({ query: notificationsQuerySchema }), notificationsController.list);
notificationsRouter.get('/unread-count', notificationsController.getUnreadCount);
notificationsRouter.post('/read-all', notificationsController.markAllAsRead);
notificationsRouter.post('/:id/read', notificationsController.markAsRead);
