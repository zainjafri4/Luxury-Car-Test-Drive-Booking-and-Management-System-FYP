import { Router } from 'express';
import { dealershipsController } from './controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { createDealershipSchema, updateDealershipSchema } from './schemas.js';

export const dealershipsRouter = Router();

// Public routes
dealershipsRouter.get('/', dealershipsController.list);
dealershipsRouter.get('/:id', dealershipsController.getById);

// Staff management routes (§8.3)
dealershipsRouter.post(
  '/',
  requireAuth,
  requireRole('STAFF'),
  validate({ body: createDealershipSchema }),
  dealershipsController.create,
);

dealershipsRouter.patch(
  '/:id',
  requireAuth,
  requireRole('STAFF'),
  validate({ body: updateDealershipSchema }),
  dealershipsController.update,
);

dealershipsRouter.post(
  '/:id/deactivate',
  requireAuth,
  requireRole('STAFF'),
  dealershipsController.deactivate,
);

dealershipsRouter.post(
  '/:id/activate',
  requireAuth,
  requireRole('STAFF'),
  dealershipsController.activate,
);
