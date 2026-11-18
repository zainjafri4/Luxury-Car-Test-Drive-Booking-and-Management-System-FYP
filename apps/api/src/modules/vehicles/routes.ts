import { Router } from 'express';
import { vehiclesController } from './controller.js';
import { slotsController } from '../slots/controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { uploadVehicleImages } from '../../middleware/upload.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
  removeImageSchema,
} from './schemas.js';

export const vehiclesRouter = Router();

// Public endpoints (§8.4, §8.5)
vehiclesRouter.get('/', validate({ query: vehicleQuerySchema }), vehiclesController.list);
vehiclesRouter.get('/filters', vehiclesController.getFilters);
vehiclesRouter.get('/:id', vehiclesController.getById);
vehiclesRouter.get('/:id/slots', slotsController.getVehicleSlots);

// Staff management endpoints (§8.4)
vehiclesRouter.post(
  '/',
  requireAuth,
  requireRole('STAFF'),
  validate({ body: createVehicleSchema }),
  vehiclesController.create,
);

vehiclesRouter.patch(
  '/:id',
  requireAuth,
  requireRole('STAFF'),
  validate({ body: updateVehicleSchema }),
  vehiclesController.update,
);

vehiclesRouter.post(
  '/:id/images',
  requireAuth,
  requireRole('STAFF'),
  uploadVehicleImages.array('images', 8),
  vehiclesController.uploadImages,
);

vehiclesRouter.delete(
  '/:id/images',
  requireAuth,
  requireRole('STAFF'),
  validate({ body: removeImageSchema }),
  vehiclesController.removeImage,
);

vehiclesRouter.post(
  '/:id/deactivate',
  requireAuth,
  requireRole('STAFF'),
  vehiclesController.deactivate,
);

vehiclesRouter.post(
  '/:id/activate',
  requireAuth,
  requireRole('STAFF'),
  vehiclesController.activate,
);
