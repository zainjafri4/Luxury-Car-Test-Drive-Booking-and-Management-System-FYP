import crypto from 'node:crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'STAFF';
}

export function generateAccessToken(user: TokenUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  );
}

export function generateRefreshToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return { token, tokenHash, expiresAt };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): (JwtPayload & TokenUser) | null {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload & { sub: string; email: string; role: 'CUSTOMER' | 'STAFF' };
    return {
      ...decoded,
      id: decoded.sub,
    };
  } catch {
    return null;
  }
}
