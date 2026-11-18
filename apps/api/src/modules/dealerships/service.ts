import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import type { Prisma } from '@prisma/client';
import type { CreateDealershipInput, UpdateDealershipInput } from './schemas.js';

export class DealershipsService {
  async list(includeInactive = false, page = 1, pageSize = 12) {
    const where = includeInactive ? {} : { isActive: true };
    const skip = (page - 1) * pageSize;

    const [total, dealerships] = await Promise.all([
      prisma.dealership.count({ where }),
      prisma.dealership.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              vehicles: { where: { isActive: true, isAvailable: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: dealerships.map((d) => ({
        ...d,
        availableVehiclesCount: d._count.vehicles,
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getById(id: string) {
    const dealership = await prisma.dealership.findUnique({
      where: { id },
      include: {
        vehicles: {
          where: { isActive: true, isAvailable: true },
          select: {
            id: true,
            manufacturer: true,
            model: true,
            year: true,
            type: true,
            fuelType: true,
            imageUrls: true,
          },
        },
      },
    });

    if (!dealership) {
      throw new NotFoundError('Dealership not found');
    }

    return dealership;
  }

  async create(input: CreateDealershipInput) {
    const existing = await prisma.dealership.findUnique({
      where: {
        name_city: {
          name: input.name,
          city: input.city,
        },
      },
    });

    if (existing) {
      throw new ConflictError('A dealership with this name in this city already exists');
    }

    return prisma.dealership.create({
      data: {
        ...input,
        email: input.email || null,
        description: input.description || null,
      },
    });
  }

  async update(id: string, input: UpdateDealershipInput) {
    await this.getById(id);

    const updateData: Prisma.DealershipUpdateInput = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.email !== undefined) updateData.email = input.email || null;
    if (input.openingTime !== undefined) updateData.openingTime = input.openingTime;
    if (input.closingTime !== undefined) updateData.closingTime = input.closingTime;
    if (input.description !== undefined) updateData.description = input.description || null;

    return prisma.dealership.update({
      where: { id },
      data: updateData,
    });
  }

  async deactivate(id: string, cascade = false) {
    await this.getById(id);

    const futureBookings = await prisma.booking.findMany({
      where: {
        slot: {
          dealershipId: id,
          startsAt: { gt: new Date() },
        },
        status: { in: ['PENDING', 'APPROVED'] },
      },
      include: { customer: true },
    });

    if (futureBookings.length > 0 && !cascade) {
      throw new ConflictError(
        `Cannot deactivate dealership: has ${futureBookings.length} future active booking(s). Set cascade=true to cancel them.`,
        'DEALERSHIP_HAS_ACTIVE_BOOKINGS',
      );
    }

    return prisma.$transaction(async (tx) => {
      if (futureBookings.length > 0 && cascade) {
        for (const b of futureBookings) {
          await tx.booking.update({
            where: { id: b.id },
            data: {
              status: 'CANCELLED',
              cancelledBy: 'STAFF',
              cancelReason: 'Dealership has been deactivated',
            },
          });

          await tx.bookingStatusHistory.create({
            data: {
              bookingId: b.id,
              fromStatus: b.status,
              toStatus: 'CANCELLED',
              changedById: b.customerId,
              note: 'Cancelled due to dealership deactivation (cascade)',
            },
          });

          await tx.notification.create({
            data: {
              userId: b.customerId,
              bookingId: b.id,
              type: 'BOOKING_CANCELLED',
              title: 'Booking Cancelled',
              message: 'Your booking has been cancelled because the dealership is no longer active.',
            },
          });
        }
      }

      return tx.dealership.update({
        where: { id },
        data: { isActive: false },
      });
    });
  }

  async activate(id: string) {
    await this.getById(id);
    return prisma.dealership.update({
      where: { id },
      data: { isActive: true },
    });
  }
}

export const dealershipsService = new DealershipsService();
