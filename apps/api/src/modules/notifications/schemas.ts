import { z } from 'zod';

export const notificationsQuerySchema = z
  .object({
    unreadOnly: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => v === 'true'),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();

export type NotificationsQueryInput = z.infer<typeof notificationsQuerySchema>;

