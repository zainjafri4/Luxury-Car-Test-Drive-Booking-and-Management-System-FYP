import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import type { Prisma } from '@prisma/client';
import type { CreateVehicleInput, UpdateVehicleInput, VehicleQueryInput } from './schemas.js';

export class VehiclesService {
  async list(filters: VehicleQueryInput, isStaff = false) {
    const where: Prisma.VehicleWhereInput = {};

    if (!isStaff || !filters.includeInactive) {
      where.isActive = true;
      where.isAvailable = true;
    }

    if (filters.q) {
      where.OR = [
        { manufacturer: { contains: filters.q, mode: 'insensitive' } },
        { model: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters.manufacturer) {
      where.manufacturer = { equals: filters.manufacturer, mode: 'insensitive' };
    }

    if (filters.model) {
      where.model = { equals: filters.model, mode: 'insensitive' };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.fuelType) {
      where.fuelType = filters.fuelType;
    }

    if (filters.dealershipId) {
      where.dealershipId = filters.dealershipId;
    }

    if (filters.yearMin || filters.yearMax) {
      where.year = {};
      if (filters.yearMin) where.year.gte = filters.yearMin;
      if (filters.yearMax) where.year.lte = filters.yearMax;
    }

    let orderBy: Prisma.VehicleOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sort === 'manufacturer') {
      orderBy = { manufacturer: 'asc' };
    } else if (filters.sort === 'year') {
      orderBy = { year: 'desc' };
    } else if (filters.sort === 'priceAsc') {
      orderBy = { priceUsd: 'asc' };
    } else if (filters.sort === 'priceDesc') {
      orderBy = { priceUsd: 'desc' };
    }

    const skip = (filters.page - 1) * filters.pageSize;

    const [total, vehicles] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where,
        skip,
        take: filters.pageSize,
        orderBy,
        include: {
          dealership: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
        },
      }),
    ]);

    return {
      data: vehicles,
      meta: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async getFilters() {
    const [manufacturers, types, fuelTypes] = await Promise.all([
      prisma.vehicle.findMany({
        where: { isActive: true, isAvailable: true },
        distinct: ['manufacturer'],
        select: { manufacturer: true },
        orderBy: { manufacturer: 'asc' },
      }),
      prisma.vehicle.findMany({
        where: { isActive: true, isAvailable: true },
        distinct: ['type'],
        select: { type: true },
        orderBy: { type: 'asc' },
      }),
      prisma.vehicle.findMany({
        where: { isActive: true, isAvailable: true },
        distinct: ['fuelType'],
        select: { fuelType: true },
        orderBy: { fuelType: 'asc' },
      }),
    ]);

    return {
      manufacturers: manufacturers.map((m) => m.manufacturer),
      types: types.map((t) => t.type),
      fuelTypes: fuelTypes.map((f) => f.fuelType),
    };
  }

  async getById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        dealership: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    return vehicle;
  }

  async create(input: CreateVehicleInput) {
    const dealership = await prisma.dealership.findUnique({
      where: { id: input.dealershipId },
    });

    if (!dealership || !dealership.isActive) {
      throw new NotFoundError('Dealership not found or inactive');
    }

    return prisma.vehicle.create({
      data: {
        ...input,
        powerHp: input.powerHp || null,
        topSpeedKmh: input.topSpeedKmh || null,
        acceleration0to100: input.acceleration0to100 || null,
        priceUsd: input.priceUsd || null,
        color: input.color || null,
      },
      include: { dealership: true },
    });
  }

  async update(id: string, input: UpdateVehicleInput) {
    await this.getById(id);

    const updateData: Prisma.VehicleUpdateInput = {};
    if (input.manufacturer !== undefined) updateData.manufacturer = input.manufacturer;
    if (input.model !== undefined) updateData.model = input.model;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.fuelType !== undefined) updateData.fuelType = input.fuelType;
    if (input.transmission !== undefined) updateData.transmission = input.transmission;
    if (input.engine !== undefined) updateData.engine = input.engine;
    if (input.powerHp !== undefined) updateData.powerHp = input.powerHp || null;
    if (input.topSpeedKmh !== undefined) updateData.topSpeedKmh = input.topSpeedKmh || null;
    if (input.acceleration0to100 !== undefined)
      updateData.acceleration0to100 = input.acceleration0to100 || null;
    if (input.seats !== undefined) updateData.seats = input.seats;
    if (input.color !== undefined) updateData.color = input.color || null;
    if (input.priceUsd !== undefined) updateData.priceUsd = input.priceUsd || null;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.features !== undefined) updateData.features = input.features;
    if (input.imageUrls !== undefined) updateData.imageUrls = input.imageUrls;
    if (input.isAvailable !== undefined) updateData.isAvailable = input.isAvailable;

    if (input.dealershipId !== undefined) {
      updateData.dealership = { connect: { id: input.dealershipId } };
    }

    return prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: { dealership: true },
    });
  }

  async addImages(id: string, newImageUrls: string[]) {
    const vehicle = await this.getById(id);
    const combined = [...vehicle.imageUrls, ...newImageUrls];

    if (combined.length > 8) {
      throw new ConflictError('A vehicle cannot have more than 8 images');
    }

    return prisma.vehicle.update({
      where: { id },
      data: { imageUrls: combined },
    });
  }

  async removeImage(id: string, imageUrl: string) {
    const vehicle = await this.getById(id);
    const updatedImages = vehicle.imageUrls.filter((url) => url !== imageUrl);

    return prisma.vehicle.update({
      where: { id },
      data: { imageUrls: updatedImages },
    });
  }

  async deactivate(id: string, cascade = false) {
    await this.getById(id);

    const futureBookings = await prisma.booking.findMany({
      where: {
        slot: {
          vehicleId: id,
          startsAt: { gt: new Date() },
        },
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (futureBookings.length > 0 && !cascade) {
      throw new ConflictError(
        `Cannot deactivate vehicle: has ${futureBookings.length} future active booking(s). Set cascade=true to cancel them.`,
        'VEHICLE_HAS_ACTIVE_BOOKINGS',
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
              cancelReason: 'Vehicle no longer available',
            },
          });

          await tx.bookingStatusHistory.create({
            data: {
              bookingId: b.id,
              fromStatus: b.status,
              toStatus: 'CANCELLED',
              changedById: b.customerId,
              note: 'Cancelled due to vehicle deactivation (cascade)',
            },
          });

          await tx.notification.create({
            data: {
              userId: b.customerId,
              bookingId: b.id,
              type: 'BOOKING_CANCELLED',
              title: 'Booking Cancelled',
              message: 'Your test-drive booking was cancelled because the vehicle is no longer available.',
            },
          });
        }
      }

      return tx.vehicle.update({
        where: { id },
        data: { isActive: false, isAvailable: false },
      });
    });
  }

  async activate(id: string) {
    await this.getById(id);
    return prisma.vehicle.update({
      where: { id },
      data: { isActive: true, isAvailable: true },
    });
  }
}

export const vehiclesService = new VehiclesService();
