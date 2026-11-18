// Environment configuration — will be expanded in Phase 1 with full Zod validation.
// For Phase 0 we just export raw process.env values so the server can start.

export const env = {
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  PORT: Number(process.env['PORT'] ?? 4000),
  DATABASE_URL: process.env['DATABASE_URL'] ?? '',
  JWT_ACCESS_SECRET: process.env['JWT_ACCESS_SECRET'] ?? '',
  JWT_REFRESH_SECRET: process.env['JWT_REFRESH_SECRET'] ?? '',
  ACCESS_TOKEN_TTL: process.env['ACCESS_TOKEN_TTL'] ?? '15m',
  REFRESH_TOKEN_TTL: process.env['REFRESH_TOKEN_TTL'] ?? '7d',
  WEB_ORIGIN: process.env['WEB_ORIGIN'] ?? 'http://localhost:3000',
  APP_TIMEZONE: process.env['APP_TIMEZONE'] ?? 'Asia/Karachi',
  MIN_BOOKING_LEAD_MINUTES: Number(process.env['MIN_BOOKING_LEAD_MINUTES'] ?? 60),
  MAX_BOOKING_ADVANCE_DAYS: Number(process.env['MAX_BOOKING_ADVANCE_DAYS'] ?? 30),
  MAX_ACTIVE_BOOKINGS_PER_CUSTOMER: Number(process.env['MAX_ACTIVE_BOOKINGS_PER_CUSTOMER'] ?? 3),
  CANCELLATION_CUTOFF_HOURS: Number(process.env['CANCELLATION_CUTOFF_HOURS'] ?? 24),
  SEED_STAFF_EMAIL: process.env['SEED_STAFF_EMAIL'] ?? 'staff@example.com',
  SEED_STAFF_PASSWORD: process.env['SEED_STAFF_PASSWORD'] ?? 'ChangeMe123',
  SMTP_HOST: process.env['SMTP_HOST'] ?? '',
  SMTP_PORT: Number(process.env['SMTP_PORT'] ?? 587),
  SMTP_USER: process.env['SMTP_USER'] ?? '',
  SMTP_PASS: process.env['SMTP_PASS'] ?? '',
  MAIL_FROM: process.env['MAIL_FROM'] ?? '',
} as const;

