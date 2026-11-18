import { Router } from 'express';
import { bookingsController } from './controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import {
  createBookingSchema,
  cancelBookingSchema,
  rejectBookingSchema,
  rescheduleBookingSchema,
  customerBookingsQuerySchema,
  adminBookingsQuerySchema,
} from './schemas.js';

export const bookingsRouter = Router();

// Customer booking routes (§8.6)
bookingsRouter.post(
  '/',
  requireAuth,
  requireRole('CUSTOMER'),
  validate({ body: createBookingSchema }),
  bookingsController.create,
);

bookingsRouter.get(
  '/mine',
  requireAuth,
  requireRole('CUSTOMER'),
  validate({ query: customerBookingsQuerySchema }),
  bookingsController.listMine,
);

bookingsRouter.get('/:id', requireAuth, bookingsController.getById);

bookingsRouter.post(
  '/:id/cancel',
  requireAuth,
  validate({ body: cancelBookingSchema }),
  bookingsController.cancel,
);

// Admin booking routes (§8.6)
export const adminBookingsRouter = Router();
adminBookingsRouter.use(requireAuth, requireRole('STAFF'));

adminBookingsRouter.get(
  '/',
  validate({ query: adminBookingsQuerySchema }),
  bookingsController.listAdmin,
);

adminBookingsRouter.post('/:id/approve', bookingsController.approve);
adminBookingsRouter.post('/:id/reject', validate({ body: rejectBookingSchema }), bookingsController.reject);
adminBookingsRouter.post('/:id/reschedule', validate({ body: rescheduleBookingSchema }), bookingsController.reschedule);
adminBookingsRouter.post('/:id/complete', bookingsController.complete);
