import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestError, AppError, ConflictError } from '../src/lib/errors.js';
import { validate } from '../src/middleware/validate.js';
import { z } from 'zod';
import type { Request, Response } from 'express';

describe('Error classes & validation middleware', () => {
  it('instantiates custom errors with correct status and shape', () => {
    const err = new BadRequestError('Bad input', [{ field: 'email', message: 'invalid email' }]);
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.details).toHaveLength(1);
    expect(err.details[0]?.field).toBe('email');
  });

  it('validates schema correctly and passes through valid body', async () => {
    const schema = z.object({
      name: z.string(),
      count: z.number().int().positive(),
    });

    const middleware = validate({ body: schema });
    const req = { body: { name: 'Sedan', count: 5 } } as Request;
    const res = {} as Response;
    const next = vi.fn();

    await middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('catches invalid fields and forwards BadRequestError', async () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const middleware = validate({ body: schema });
    const req = { body: { email: 'not-an-email' } } as Request;
    const res = {} as Response;
    const next = vi.fn();

    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    const calledError = next.mock.calls[0]![0];
    expect(calledError).toBeInstanceOf(BadRequestError);
    expect(calledError.details[0]?.field).toBe('email');
  });

  it('ConflictError formats slot already booked correctly', () => {
    const err = new ConflictError('Slot booked', 'SLOT_ALREADY_BOOKED');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('SLOT_ALREADY_BOOKED');
  });
});
