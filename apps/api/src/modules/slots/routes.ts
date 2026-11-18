import { Router } from 'express';
import { slotsController } from './controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import {
  createSlotSchema,
  updateSlotSchema,
  bulkGenerateSlotsSchema,
  slotQuerySchema,
} from './schemas.js';

export const slotsRouter = Router();

// Staff slots management routes (§8.5)
slotsRouter.get('/', requireAuth, requireRole('STAFF'), validate({ query: slotQuerySchema }), slotsController.list);
slotsRouter.post('/', requireAuth, requireRole('STAFF'), validate({ body: createSlotSchema }), slotsController.create);
slotsRouter.post('/bulk', requireAuth, requireRole('STAFF'), validate({ body: bulkGenerateSlotsSchema }), slotsController.bulkGenerate);
slotsRouter.patch('/:id', requireAuth, requireRole('STAFF'), validate({ body: updateSlotSchema }), slotsController.update);
slotsRouter.post('/:id/deactivate', requireAuth, requireRole('STAFF'), slotsController.deactivate);
slotsRouter.post('/:id/activate', requireAuth, requireRole('STAFF'), slotsController.activate);

