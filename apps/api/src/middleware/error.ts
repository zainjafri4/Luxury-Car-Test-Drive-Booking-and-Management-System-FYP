import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.['target'])
        ? (err.meta['target'] as string[]).join(', ')
        : 'unique constraint';

      // Check if slot partial active booking index
      const message = String(err.message).includes('booking_slot_active_unique')
        ? 'Selected slot already has an active booking'
        : `Duplicate value violates ${target}`;

      res.status(409).json({
        error: {
          code: String(err.message).includes('booking_slot_active_unique')
            ? 'SLOT_ALREADY_BOOKED'
            : 'DUPLICATE_ENTRY',
          message,
          details: [],
        },
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Requested record not found',
          details: [],
        },
      });
      return;
    }
  }

  logger.error({ err }, 'Unexpected server error');

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred',
      details: [],
    },
  });
};
