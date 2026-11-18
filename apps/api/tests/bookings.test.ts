import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { generateAccessToken } from '../src/lib/jwt.js';

vi.mock('../src/lib/prisma.js', () => {
  return {
    prisma: {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
      user: {
        findUnique: vi.fn(),
      },
      timeSlot: {
        findUnique: vi.fn(),
      },
      booking: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      bookingStatusHistory: {
        create: vi.fn(),
      },
      notification: {
        create: vi.fn(),
      },
      $transaction: vi.fn((fn) => fn(prisma)),
    },
  };
});

describe('Bookings and State Machine (FR-06, FR-07, FR-08, FR-09)', () => {
  const staffToken = generateAccessToken({
    id: 'staff-uuid-1',
    email: 'staff@example.com',
    role: 'STAFF',
  });

  const customerToken = generateAccessToken({
    id: 'cust-uuid-1',
    email: 'customer@example.com',
    role: 'CUSTOMER',
  });

  const validSlot = {
    id: '00000000-0000-0000-0000-000000000001',
    vehicleId: 'v-1',
    dealershipId: 'd-1',
    startsAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours in future
    endsAt: new Date(Date.now() + 49 * 60 * 60 * 1000),
    status: 'ACTIVE',
    vehicle: { id: 'v-1', manufacturer: 'Porsche', model: '911', isActive: true, isAvailable: true },
    dealership: { id: 'd-1', isActive: true },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/bookings (Create Booking)', () => {
    it('creates a PENDING booking when all checks pass', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'cust-uuid-1',
        email: 'customer@example.com',
        role: 'CUSTOMER',
        isActive: true,
      } as any);

      vi.mocked(prisma.timeSlot.findUnique).mockResolvedValue(validSlot as any);
      vi.mocked(prisma.booking.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.booking.count).mockResolvedValue(0);
      vi.mocked(prisma.booking.create).mockResolvedValue({
        id: 'b-1',
        customerId: 'cust-uuid-1',
        slotId: validSlot.id,
        status: 'PENDING',
        slot: validSlot,
      } as any);

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          slotId: validSlot.id,
          customerNote: 'Looking forward to the test drive',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PENDING');
      expect(prisma.notification.create).toHaveBeenCalled();
      expect(prisma.bookingStatusHistory.create).toHaveBeenCalled();
    });

    it('rejects booking when customer has reached max active bookings limit', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'cust-uuid-1',
        role: 'CUSTOMER',
        isActive: true,
      } as any);

      vi.mocked(prisma.timeSlot.findUnique).mockResolvedValue(validSlot as any);
      vi.mocked(prisma.booking.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.booking.count).mockResolvedValue(3); // default max is 3

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({ slotId: validSlot.id });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('MAX_ACTIVE_BOOKINGS_EXCEEDED');
    });
  });

  describe('Booking Lifecycle Transitions (§7.1)', () => {
    it('allows staff to approve a PENDING booking', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'staff-uuid-1',
        role: 'STAFF',
        isActive: true,
      } as any);

      vi.mocked(prisma.booking.findUnique).mockResolvedValue({
        id: 'b-1',
        status: 'PENDING',
        customerId: 'cust-uuid-1',
        customer: { email: 'cust@example.com', fullName: 'Cust' },
        slot: validSlot,
      } as any);

      vi.mocked(prisma.booking.update).mockResolvedValue({
        id: 'b-1',
        status: 'APPROVED',
      } as any);

      const res = await request(app)
        .post('/api/v1/admin/bookings/b-1/approve')
        .set('Authorization', `Bearer ${staffToken}`)
        .set('X-Requested-With', 'XMLHttpRequest');

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('APPROVED');
    });

    it('prevents approving an already APPROVED booking with 409 INVALID_STATUS_TRANSITION', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'staff-uuid-1',
        role: 'STAFF',
        isActive: true,
      } as any);

      vi.mocked(prisma.booking.findUnique).mockResolvedValue({
        id: 'b-1',
        status: 'APPROVED',
        slot: validSlot,
      } as any);

      const res = await request(app)
        .post('/api/v1/admin/bookings/b-1/approve')
        .set('Authorization', `Bearer ${staffToken}`)
        .set('X-Requested-With', 'XMLHttpRequest');

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('enforces cancellation cutoff (<24h) for customer', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'cust-uuid-1',
        role: 'CUSTOMER',
        isActive: true,
      } as any);

      const nearSlot = {
        ...validSlot,
        startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue({
        id: 'b-1',
        customerId: 'cust-uuid-1',
        status: 'PENDING',
        slot: nearSlot,
      } as any);

      const res = await request(app)
        .post('/api/v1/bookings/b-1/cancel')
        .set('Authorization', `Bearer ${customerToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({ reason: 'Cannot make it' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CANCELLATION_NOT_ALLOWED');
    });
  });
});
