import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.js';
import { verifyAccessToken, type TokenUser } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.['access_token'] || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(new UnauthorizedError('Authentication required', 'NOT_AUTHENTICATED'));
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return next(new UnauthorizedError('Invalid or expired token', 'INVALID_TOKEN'));
  }

  // Ensure user is active in DB
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return next(new UnauthorizedError('Account inactive or deleted', 'ACCOUNT_INACTIVE'));
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  next();
}

export function requireRole(role: 'STAFF' | 'CUSTOMER') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.role !== role) {
      return next(new ForbiddenError('Insufficient permissions for this operation'));
    }

    next();
  };
}

