import { Router } from 'express';
import { usersController } from './controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { updateProfileSchema, changePasswordSchema } from './schemas.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/me', usersController.getMe);
usersRouter.patch('/me', validate({ body: updateProfileSchema }), usersController.updateMe);
usersRouter.post('/me/change-password', validate({ body: changePasswordSchema }), usersController.changePassword);
