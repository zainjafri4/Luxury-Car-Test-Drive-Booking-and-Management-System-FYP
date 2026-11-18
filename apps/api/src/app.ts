import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env['WEB_ORIGIN'] ?? 'http://localhost:3000',
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', async (_req, res) => {
  res.json({ status: 'ok', db: 'up' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

export default app;

