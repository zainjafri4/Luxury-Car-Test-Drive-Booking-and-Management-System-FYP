import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import { prisma } from './lib/prisma.js';
import { authRouter } from './modules/auth/routes.js';
import { usersRouter } from './modules/users/routes.js';
import { dealershipsRouter } from './modules/dealerships/routes.js';
import { vehiclesRouter } from './modules/vehicles/routes.js';
import { slotsRouter } from './modules/slots/routes.js';
import { bookingsRouter, adminBookingsRouter } from './modules/bookings/routes.js';
import { notificationsRouter } from './modules/notifications/routes.js';
import { dashboardRouter } from './modules/dashboard/routes.js';
import { generalRateLimiter } from './middleware/rateLimit.js';
import { openapiDoc } from './docs/openapi.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// General rate limiter on all API endpoints (§10)
app.use('/api', generalRateLimiter);

// Serve OpenAPI Swagger UI (§8.9)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));
app.get('/api/docs.json', (_req, res) => res.json(openapiDoc));

// Serve static vehicle uploads (§2, §8.4)
const uploadDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// Custom header check for CSRF mitigation on state-changing requests (§10)
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const customHeader = req.header('X-Requested-With');
    const contentType = req.header('Content-Type');
    if (
      !customHeader &&
      (!contentType || !contentType.includes('application/json')) &&
      !contentType?.includes('multipart/form-data')
    ) {
      res.status(403).json({
        error: {
          code: 'CSRF_BLOCKED',
          message: 'Missing required custom header or valid content-type',
          details: [],
        },
      });
      return;
    }
  }
  next();
});

// Health check with real DB ping
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' });
  }
});

// API routes (§8)
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/dealerships', dealershipsRouter);
app.use('/api/v1/vehicles', vehiclesRouter);
app.use('/api/v1/slots', slotsRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/admin/bookings', adminBookingsRouter);
app.use('/api/v1/admin/dashboard', dashboardRouter);
app.use('/api/v1/admin', dashboardRouter);
app.use('/api/v1/notifications', notificationsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Global error handler
app.use(errorHandler);

export default app;
