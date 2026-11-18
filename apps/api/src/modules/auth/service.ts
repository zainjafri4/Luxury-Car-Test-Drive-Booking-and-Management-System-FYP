import { prisma } from '../../lib/prisma.js';
import { hashPassword, comparePassword } from '../../lib/password.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../../lib/jwt.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../lib/errors.js';
import type { RegisterInput, LoginInput } from './schemas.js';

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictError('An account with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        phone: input.phone || null,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(input: LoginInput, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    // Timing-attack resistant & generic error per §7.8
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { token: rawRefreshToken, tokenHash, expiresAt } = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        userAgent: userAgent || null,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async refresh(rawToken: string, userAgent?: string) {
    if (!rawToken) {
      throw new UnauthorizedError('Refresh token required', 'REFRESH_TOKEN_REQUIRED');
    }

    const tokenHash = hashToken(rawToken);
    const existing = await prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existing) {
      throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Reuse detection: revoked token reuse triggers whole token family revocation (§10)
    if (existing.revokedAt !== null) {
      await prisma.refreshToken.updateMany({
        where: { userId: existing.userId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError('Token reuse detected. All sessions revoked.', 'TOKEN_FAMILY_REVOKED');
    }

    if (existing.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired', 'TOKEN_EXPIRED');
    }

    if (!existing.user.isActive) {
      throw new UnauthorizedError('User account is inactive', 'ACCOUNT_INACTIVE');
    }

    // Rotate token
    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const { token: newRawRefreshToken, tokenHash: newHash, expiresAt } = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: newHash,
        expiresAt,
        userAgent: userAgent || existing.userAgent,
      },
    });

    const accessToken = generateAccessToken({
      id: existing.user.id,
      email: existing.user.email,
      role: existing.user.role,
    });

    return {
      user: {
        id: existing.user.id,
        email: existing.user.email,
        fullName: existing.user.fullName,
        role: existing.user.role,
      },
      accessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async logout(rawToken?: string) {
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { success: true };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive', 'USER_NOT_FOUND');
    }

    return user;
  }
}

export const authService = new AuthService();
