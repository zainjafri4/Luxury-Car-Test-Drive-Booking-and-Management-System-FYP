import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

export const bookingStatusEnum = z.nativeEnum(BookingStatus);

export const createBookingSchema = z
  .object({
    slotId: z.string().uuid('Invalid slot ID'),
    customerNote: z.string().trim().max(500, 'Customer note cannot exceed 500 characters').optional(),
  })
  .strict();

export const cancelBookingSchema = z
  .object({
    reason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters').optional(),
  })
  .strict();

export const rejectBookingSchema = z
  .object({
    staffNote: z.string().trim().min(3, 'Staff note is required when rejecting a booking').max(500),
  })
  .strict();

export const rescheduleBookingSchema = z
  .object({
    newSlotId: z.string().uuid('Invalid new slot ID'),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export const customerBookingsQuerySchema = z
  .object({
    group: z.enum(['pending', 'upcoming', 'completed', 'cancelled', 'past', 'all']).default('all'),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(12),
  })
  .strict();

export const adminBookingsQuerySchema = z
  .object({
    status: bookingStatusEnum.optional(),
    dealershipId: z.string().uuid().optional(),
    vehicleId: z.string().uuid().optional(),
    customer: z.string().trim().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    sort: z.enum(['newest', 'slotTimeAsc', 'slotTimeDesc']).default('newest'),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(12),
  })
  .strict();

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type RejectBookingInput = z.infer<typeof rejectBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
export type CustomerBookingsQueryInput = z.infer<typeof customerBookingsQuerySchema>;
export type AdminBookingsQueryInput = z.infer<typeof adminBookingsQuerySchema>;

