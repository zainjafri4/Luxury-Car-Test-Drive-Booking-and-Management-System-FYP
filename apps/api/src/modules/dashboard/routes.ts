import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { hashPassword } from '../../lib/password.js';
import { ConflictError, NotFoundError } from '../../lib/errors.js';
import { z } from 'zod';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth, requireRole('STAFF'));

// GET /api/v1/admin/dashboard/summary (§8.8)
dashboardRouter.get('/summary', async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      pendingCount,
      approvedCount,
      rejectedCount,
      cancelledCount,
      completedCount,
      todayCount,
      upcomingSevenDaysCount,
      activeVehiclesCount,
      activeDealershipsCount,
      totalActiveFutureSlots,
      bookedActiveFutureSlots,
    ] = await Promise.all([
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'APPROVED' } }),
      prisma.booking.count({ where: { status: 'REJECTED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({
        where: {
          slot: { startsAt: { gte: startOfToday, lte: endOfToday } },
        },
      }),
      prisma.booking.count({
        where: {
          status: 'APPROVED',
          slot: { startsAt: { gt: now, lte: sevenDaysLater } },
        },
      }),
      prisma.vehicle.count({ where: { isActive: true } }),
      prisma.dealership.count({ where: { isActive: true } }),
      prisma.timeSlot.count({
        where: { status: 'ACTIVE', startsAt: { gt: now } },
      }),
      prisma.timeSlot.count({
        where: {
          status: 'ACTIVE',
          startsAt: { gt: now },
          bookings: { some: { status: { in: ['PENDING', 'APPROVED'] } } },
        },
      }),
    ]);

    const slotUtilisationPercent =
      totalActiveFutureSlots > 0
        ? Math.round((bookedActiveFutureSlots / totalActiveFutureSlots) * 100)
        : 0;

    res.json({
      data: {
        bookingsByStatus: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          cancelled: cancelledCount,
          completed: completedCount,
        },
        pendingNeedingAction: pendingCount,
        todayBookings: todayCount,
        upcomingNext7Days: upcomingSevenDaysCount,
        activeVehicles: activeVehiclesCount,
        activeDealerships: activeDealershipsCount,
        slotUtilisationPercent,
        totalActiveFutureSlots,
        bookedActiveFutureSlots,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/dashboard/trends?days=30 (§8.8)
dashboardRouter.get('/trends', async (req, res, next) => {
  try {
    const days = req.query['days'] ? Number(req.query['days']) : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const countsByDay: Record<string, number> = {};
    for (const b of bookings) {
      const day = b.createdAt.toISOString().split('T')[0]!;
      countsByDay[day] = (countsByDay[day] || 0) + 1;
    }

    const trend = Object.entries(countsByDay).map(([date, count]) => ({ date, count }));
    res.json({ data: trend });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/customers (§8.8)
dashboardRouter.get('/customers', async (req, res, next) => {
  try {
    const q = req.query['q'] as string | undefined;
    const page = req.query['page'] ? Number(req.query['page']) : 1;
    const pageSize = req.query['pageSize'] ? Number(req.query['pageSize']) : 12;
    const skip = (page - 1) * pageSize;

    const where: any = { role: 'CUSTOMER' };
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { customerBookings: true } },
        },
      }),
    ]);

    res.json({
      data: customers.map((c) => ({
        ...c,
        totalBookings: c._count.customerBookings,
      })),
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/customers/:id (§8.8)
dashboardRouter.get('/customers/:id', async (req, res, next) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
    const customer = await prisma.user.findUnique({
      where: { id, role: 'CUSTOMER' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        customerBookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            slot: { include: { vehicle: true, dealership: true } },
          },
        },
      },
    });

    if (!customer) throw new NotFoundError('Customer not found');
    res.json({ data: customer });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/customers/:id/deactivate / activate (§8.8)
dashboardRouter.post('/customers/:id/deactivate', async (req, res, next) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
    const updated = await prisma.user.update({
      where: { id, role: 'CUSTOMER' },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true },
    });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

dashboardRouter.post('/customers/:id/activate', async (req, res, next) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
    const updated = await prisma.user.update({
      where: { id, role: 'CUSTOMER' },
      data: { isActive: true },
      select: { id: true, email: true, isActive: true },
    });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/staff (§8.8: Create another staff account)
const createStaffSchema = z
  .object({
    email: z.string().trim().email().toLowerCase(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Za-z]/)
      .regex(/[0-9]/),
    fullName: z.string().trim().min(2),
    phone: z.string().trim().optional(),
  })
  .strict();

dashboardRouter.post('/staff', validate({ body: createStaffSchema }), async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await hashPassword(req.body.password);
    const newStaff = await prisma.user.create({
      data: {
        email: req.body.email,
        passwordHash,
        fullName: req.body.fullName,
        phone: req.body.phone || null,
        role: 'STAFF',
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

    res.status(201).json({ data: newStaff });
  } catch (err) {
    next(err);
  }
});

