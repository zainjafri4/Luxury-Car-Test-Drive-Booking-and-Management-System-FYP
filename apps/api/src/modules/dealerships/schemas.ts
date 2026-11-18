import { z } from 'zod';

export const createDealershipSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    address: z.string().trim().min(5, 'Address is required'),
    city: z.string().trim().min(2, 'City is required'),
    phone: z.string().trim().min(7, 'Valid phone number is required'),
    email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
    openingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format must be HH:mm (24h)'),
    closingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format must be HH:mm (24h)'),
    description: z.string().trim().optional(),
  })
  .strict();

export const updateDealershipSchema = createDealershipSchema.partial();

export const dealershipQuerySchema = z
  .object({
    includeInactive: z
      .enum(['true', 'false'])
      .optional()
      .transform((val) => val === 'true'),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(12),
  })
  .strict();

export type CreateDealershipInput = z.infer<typeof createDealershipSchema>;
export type UpdateDealershipInput = z.infer<typeof updateDealershipSchema>;

