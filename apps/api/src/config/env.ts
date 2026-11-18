import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  WEB_ORIGIN: z.string().default('http://localhost:3000'),
  APP_TIMEZONE: z.string().default('Asia/Karachi'),
  MIN_BOOKING_LEAD_MINUTES: z.coerce.number().default(60),
  MAX_BOOKING_ADVANCE_DAYS: z.coerce.number().default(30),
  MAX_ACTIVE_BOOKINGS_PER_CUSTOMER: z.coerce.number().default(3),
  CANCELLATION_CUTOFF_HOURS: z.coerce.number().default(24),
  SEED_STAFF_EMAIL: z.string().email().default('staff@example.com'),
  SEED_STAFF_PASSWORD: z.string().min(8).default('ChangeMe123'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
