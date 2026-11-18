import { z } from 'zod';
import { SlotStatus } from '@prisma/client';

export const slotStatusEnum = z.nativeEnum(SlotStatus);

export const createSlotSchema = z
  .object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    startsAt: z.string().datetime({ message: 'startsAt must be a valid ISO 8601 timestamp' }),
    endsAt: z.string().datetime({ message: 'endsAt must be a valid ISO 8601 timestamp' }),
  })
  .strict()
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: 'endsAt must be after startsAt',
    path: ['endsAt'],
  });

export const updateSlotSchema = z
  .object({
    startsAt: z.string().datetime({ message: 'startsAt must be a valid ISO 8601 timestamp' }),
    endsAt: z.string().datetime({ message: 'endsAt must be a valid ISO 8601 timestamp' }),
  })
  .strict()
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: 'endsAt must be after startsAt',
    path: ['endsAt'],
  });

export const bulkGenerateSlotsSchema = z
  .object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
    dailyStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'dailyStartTime must be HH:mm'),
    dailyEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'dailyEndTime must be HH:mm'),
    durationMinutes: z.coerce.number().int().min(15).max(240).default(60),
    gapMinutes: z.coerce.number().int().min(0).max(60).default(0),
  })
  .strict();

export const slotQuerySchema = z
  .object({
    vehicleId: z.string().uuid().optional(),
    dealershipId: z.string().uuid().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    status: slotStatusEnum.optional(),
  })
  .strict();

export const vehicleSlotsQuerySchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .strict();

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
export type BulkGenerateSlotsInput = z.infer<typeof bulkGenerateSlotsSchema>;
export type SlotQueryInput = z.infer<typeof slotQuerySchema>;
