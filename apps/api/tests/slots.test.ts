import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { generateAccessToken } from '../src/lib/jwt.js';

vi.mock('../src/lib/prisma.js', () => {
  return {
    prisma: {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
      vehicle: {
        findUnique: vi.fn(),
      },
      timeSlot: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    },
  };
});

describe('Time Slots Endpoints (FR-05)', () => {
  const staffToken = generateAccessToken({
    id: 'staff-uuid-1',
    email: 'staff@example.com',
    role: 'STAFF',
  });

  const validVehicle = {
    id: 'v-uuid-1',
    dealershipId: 'd-uuid-1',
    isActive: true,
    isAvailable: true,
    dealership: {
      id: 'd-uuid-1',
      openingTime: '09:00',
      closingTime: '18:00',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'staff-uuid-1',
      email: 'staff@example.com',
      role: 'STAFF',
      isActive: true,
    } as any);
  });

  describe('GET /api/v1/vehicles/:id/slots', () => {
    it('returns future active slots with isBooked flag', async () => {
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(validVehicle as any);
      vi.mocked(prisma.timeSlot.findMany).mockResolvedValue([
        {
          id: 'slot-1',
          vehicleId: 'v-uuid-1',
          dealershipId: 'd-uuid-1',
          startsAt: new Date(Date.now() + 86400000),
          endsAt: new Date(Date.now() + 90000000),
          status: 'ACTIVE',
          bookings: [{ id: 'b-1', status: 'PENDING' }],
        },
      ] as any);

      const res = await request(app).get('/api/v1/vehicles/v-uuid-1/slots');
      expect(res.status).toBe(200);
      expect(res.body.data.slots).toHaveLength(1);
      expect(res.body.data.slots[0].isBooked).toBe(true);
    });
  });

  describe('POST /api/v1/slots', () => {
    it('rejects slot with endsAt before startsAt', async () => {
      const res = await request(app)
        .post('/api/v1/slots')
        .set('Authorization', `Bearer ${staffToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          vehicleId: '00000000-0000-0000-0000-000000000001',
          startsAt: '2027-01-01T14:00:00.000Z',
          endsAt: '2027-01-01T13:00:00.000Z',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('rejects slot that overlaps with an existing active slot', async () => {
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(validVehicle as any);
      vi.mocked(prisma.timeSlot.findFirst).mockResolvedValue({
        id: 'existing-slot',
        status: 'ACTIVE',
      } as any);

      const res = await request(app)
        .post('/api/v1/slots')
        .set('Authorization', `Bearer ${staffToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          vehicleId: '00000000-0000-0000-0000-000000000001',
          startsAt: '2027-01-01T06:00:00.000Z', // 11:00 PKT
          endsAt: '2027-01-01T07:00:00.000Z',   // 12:00 PKT
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('SLOT_OVERLAP');
    });
  });

  describe('PATCH /api/v1/slots/:id', () => {
    it('blocks editing slot when it has an active booking', async () => {
      vi.mocked(prisma.timeSlot.findUnique).mockResolvedValue({
        id: 'slot-1',
        vehicleId: 'v-1',
        bookings: [{ id: 'b-1', status: 'PENDING' }],
        vehicle: validVehicle,
      } as any);

      const res = await request(app)
        .patch('/api/v1/slots/slot-1')
        .set('Authorization', `Bearer ${staffToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          startsAt: '2027-01-01T06:00:00.000Z',
          endsAt: '2027-01-01T07:00:00.000Z',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('SLOT_HAS_ACTIVE_BOOKING');
    });
  });
});

