import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { hashPassword } from '../src/lib/password.js';

vi.mock('../src/lib/prisma.js', () => {
  return {
    prisma: {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      refreshToken: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      $transaction: vi.fn((fn) => fn(prisma)),
    },
  };
});

describe('Auth & Profile Endpoints (FR-01, FR-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a customer successfully', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-uuid-1',
        email: 'newuser@example.com',
        fullName: 'New Customer',
        phone: '+923001234567',
        role: 'CUSTOMER',
        createdAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          email: 'newuser@example.com',
          password: 'Password123',
          fullName: 'New Customer',
          phone: '+923001234567',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('newuser@example.com');
      expect(res.body.data.role).toBe('CUSTOMER');
    });

    it('rejects registration with invalid weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          email: 'newuser@example.com',
          password: 'short',
          fullName: 'New Customer',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('rejects duplicate email with 409 Conflict', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'existing-id',
        email: 'duplicate@example.com',
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123',
          fullName: 'Duplicate User',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('logs in successfully and returns JWT in cookies', async () => {
      const passwordHash = await hashPassword('CorrectPassword1');
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-uuid-1',
        email: 'staff@example.com',
        fullName: 'Staff Admin',
        role: 'STAFF',
        isActive: true,
        passwordHash,
      } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          email: 'staff@example.com',
          password: 'CorrectPassword1',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('staff@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('returns 401 INVALID_CREDENTIALS for wrong password', async () => {
      const passwordHash = await hashPassword('CorrectPassword1');
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-uuid-1',
        email: 'staff@example.com',
        isActive: true,
        passwordHash,
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          email: 'staff@example.com',
          password: 'WrongPassword99',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('blocks deactivated users', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'deactivated-id',
        email: 'blocked@example.com',
        isActive: false,
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          email: 'blocked@example.com',
          password: 'AnyPassword123',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('returns 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('NOT_AUTHENTICATED');
    });
  });
});

