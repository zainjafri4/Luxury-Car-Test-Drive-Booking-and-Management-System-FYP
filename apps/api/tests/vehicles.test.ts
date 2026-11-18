import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { generateAccessToken } from '../src/lib/jwt.js';

vi.mock('../src/lib/prisma.js', () => {
  return {
    prisma: {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
      dealership: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      vehicle: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      booking: {
        findMany: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn((fn) => fn(prisma)),
    },
  };
});

describe('Dealerships and Vehicles Endpoints (FR-03, FR-04)', () => {
  const staffToken = generateAccessToken({
    id: 'staff-uuid-1',
    email: 'staff@example.com',
    role: 'STAFF',
  });

  const customerToken = generateAccessToken({
    id: 'cust-uuid-1',
    email: 'cust@example.com',
    role: 'CUSTOMER',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'staff-uuid-1',
      email: 'staff@example.com',
      role: 'STAFF',
      isActive: true,
    } as any);
  });

  describe('GET /api/v1/dealerships', () => {
    it('returns paginated active dealerships publicly', async () => {
      vi.mocked(prisma.dealership.count).mockResolvedValue(1);
      vi.mocked(prisma.dealership.findMany).mockResolvedValue([
        {
          id: 'dealership-1',
          name: 'Aurum Drive Central',
          city: 'Karachi',
          address: 'Main Shahrah-e-Faisal',
          phone: '+922134567890',
          openingTime: '09:00',
          closingTime: '18:00',
          isActive: true,
          _count: { vehicles: 4 },
        },
      ] as any);

      const res = await request(app).get('/api/v1/dealerships');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].availableVehiclesCount).toBe(4);
      expect(res.body.meta.total).toBe(1);
    });
  });

  describe('POST /api/v1/dealerships', () => {
    it('prevents non-staff from creating a dealership', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'cust-uuid-1',
        email: 'cust@example.com',
        role: 'CUSTOMER',
        isActive: true,
      } as any);

      const res = await request(app)
        .post('/api/v1/dealerships')
        .set('Authorization', `Bearer ${customerToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          name: 'Hacker Motors',
          address: 'Street 1',
          city: 'Karachi',
          phone: '+923001234567',
          openingTime: '09:00',
          closingTime: '18:00',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows staff to create a dealership', async () => {
      vi.mocked(prisma.dealership.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.dealership.create).mockResolvedValue({
        id: 'new-dealership-id',
        name: 'Aurum Drive Islamabad',
        city: 'Islamabad',
      } as any);

      const res = await request(app)
        .post('/api/v1/dealerships')
        .set('Authorization', `Bearer ${staffToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          name: 'Aurum Drive Islamabad',
          address: 'Diplomatic Enclave Road',
          city: 'Islamabad',
          phone: '+92512345678',
          openingTime: '09:00',
          closingTime: '18:00',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Aurum Drive Islamabad');
    });
  });

  describe('GET /api/v1/vehicles', () => {
    it('returns filtered and paginated vehicle list publicly', async () => {
      vi.mocked(prisma.vehicle.count).mockResolvedValue(1);
      vi.mocked(prisma.vehicle.findMany).mockResolvedValue([
        {
          id: 'v-1',
          manufacturer: 'Porsche',
          model: '911 Carrera 4S',
          year: 2024,
          type: 'SPORTS',
          fuelType: 'PETROL',
          priceUsd: '140000',
          isActive: true,
          isAvailable: true,
          dealership: { id: 'd-1', name: 'Aurum Drive Central', city: 'Karachi' },
        },
      ] as any);

      const res = await request(app).get('/api/v1/vehicles?manufacturer=Porsche&sort=year');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].manufacturer).toBe('Porsche');
    });

    it('returns available filters metadata', async () => {
      vi.mocked(prisma.vehicle.findMany)
        .mockResolvedValueOnce([{ manufacturer: 'BMW' }, { manufacturer: 'Porsche' }] as any)
        .mockResolvedValueOnce([{ type: 'SEDAN' }, { type: 'SPORTS' }] as any)
        .mockResolvedValueOnce([{ fuelType: 'ELECTRIC' }, { fuelType: 'PETROL' }] as any);

      const res = await request(app).get('/api/v1/vehicles/filters');
      expect(res.status).toBe(200);
      expect(res.body.data.manufacturers).toContain('Porsche');
      expect(res.body.data.types).toContain('SPORTS');
    });
  });

  describe('POST /api/v1/vehicles/:id/deactivate', () => {
    it('blocks deactivation when active bookings exist without cascade=true', async () => {
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue({
        id: 'v-1',
        manufacturer: 'Mercedes-Benz',
      } as any);

      vi.mocked(prisma.booking.findMany).mockResolvedValue([
        { id: 'b-1', status: 'PENDING', customerId: 'cust-1' },
      ] as any);

      const res = await request(app)
        .post('/api/v1/vehicles/v-1/deactivate')
        .set('Authorization', `Bearer ${staffToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({ cascade: false });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('VEHICLE_HAS_ACTIVE_BOOKINGS');
    });
  });
});

