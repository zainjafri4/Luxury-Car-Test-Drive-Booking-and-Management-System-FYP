import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import { prisma } from './lib/prisma.js';

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

// Custom header check for CSRF mitigation on state-changing requests (§10)
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const customHeader = req.header('X-Requested-With');
    // Allow browsers direct standard JSON content requests
    const contentType = req.header('Content-Type');
    if (!customHeader && (!contentType || !contentType.includes('application/json')) && !contentType?.includes('multipart/form-data')) {
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

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Global error handler
app.use(errorHandler);

export default app;
