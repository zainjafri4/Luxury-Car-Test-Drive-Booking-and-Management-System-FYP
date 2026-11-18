import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../lib/errors.js';
import { env } from '../../config/env.js';
import type { Prisma, SlotStatus } from '@prisma/client';
import type {
  CreateSlotInput,
  UpdateSlotInput,
  BulkGenerateSlotsInput,
  SlotQueryInput,
} from './schemas.js';

export class SlotsService {
  /**
   * Validates slot time bounds against dealership opening/closing hours
   */
  private validateDealershipHours(
    startsAt: Date,
    endsAt: Date,
    openingTime: string,
    closingTime: string,
  ) {
    // Compare hours in APP_TIMEZONE (default Asia/Karachi)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: env.APP_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    const startLocal = new Intl.DateTimeFormat('en-GB', options).format(startsAt);
    const endLocal = new Intl.DateTimeFormat('en-GB', options).format(endsAt);

    if (startLocal < openingTime || endLocal > closingTime) {
      throw new BadRequestError(
        `Slot (${startLocal} - ${endLocal}) falls outside dealership operating hours (${openingTime} - ${closingTime} ${env.APP_TIMEZONE})`,
      );
    }
  }

  async getPublicVehicleSlots(vehicleId: string, from?: string, to?: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle || !vehicle.isActive || !vehicle.isAvailable) {
      throw new NotFoundError('Vehicle not found or unavailable');
    }

    const now = new Date();
    const startDate = from ? new Date(from) : now;
    // Default to 14 days ahead if no 'to' param
    const endDate = to ? new Date(to) : new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    const slots = await prisma.timeSlot.findMany({
      where: {
        vehicleId,
        status: 'ACTIVE',
        startsAt: {
          gt: now, // Past slots never shown as available (§7.5)
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { startsAt: 'asc' },
      include: {
        bookings: {
          where: {
            status: { in: ['PENDING', 'APPROVED'] },
          },
          select: { id: true, status: true },
        },
      },
    });

    return {
      timezone: env.APP_TIMEZONE,
      slots: slots.map((s) => ({
        id: s.id,
        vehicleId: s.vehicleId,
        dealershipId: s.dealershipId,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        isBooked: s.bookings.length > 0,
      })),
    };
  }

  async list(filters: SlotQueryInput) {
    const where: Prisma.TimeSlotWhereInput = {};

    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.dealershipId) where.dealershipId = filters.dealershipId;
    if (filters.status) where.status = filters.status;

    if (filters.from || filters.to) {
      where.startsAt = {};
      if (filters.from) where.startsAt.gte = new Date(filters.from);
      if (filters.to) where.startsAt.lte = new Date(filters.to);
    }

    return prisma.timeSlot.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      include: {
        vehicle: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
          },
        },
        dealership: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        bookings: {
          where: {
            status: { in: ['PENDING', 'APPROVED'] },
          },
          select: {
            id: true,
            status: true,
            customer: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });
  }

  async create(input: CreateSlotInput) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: input.vehicleId },
      include: { dealership: true },
    });

    if (!vehicle || !vehicle.isActive) {
      throw new NotFoundError('Vehicle not found or inactive');
    }

    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);

    if (startsAt <= new Date()) {
      throw new BadRequestError('Slot must be in the future');
    }

    this.validateDealershipHours(
      startsAt,
      endsAt,
      vehicle.dealership.openingTime,
      vehicle.dealership.closingTime,
    );

    // Overlap prevention (§6.2, §7.5)
    const overlapping = await prisma.timeSlot.findFirst({
      where: {
        vehicleId: input.vehicleId,
        status: 'ACTIVE',
        OR: [
          { startsAt: { lt: endsAt, gte: startsAt } },
          { endsAt: { gt: startsAt, lte: endsAt } },
          { startsAt: { lte: startsAt }, endsAt: { gte: endsAt } },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictError(
        'An active slot for this vehicle already overlaps with the requested time interval',
        'SLOT_OVERLAP',
      );
    }

    return prisma.timeSlot.create({
      data: {
        vehicleId: input.vehicleId,
        dealershipId: vehicle.dealershipId,
        startsAt,
        endsAt,
        status: 'ACTIVE',
      },
      include: { vehicle: true, dealership: true },
    });
  }

  async bulkGenerate(input: BulkGenerateSlotsInput) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: input.vehicleId },
      include: { dealership: true },
    });

    if (!vehicle || !vehicle.isActive) {
      throw new NotFoundError('Vehicle not found or inactive');
    }

    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const now = new Date();

    if (start > end) {
      throw new BadRequestError('startDate must be before or equal to endDate');
    }

    const createdSlots: string[] = [];
    const skippedSlots: { date: string; time: string; reason: string }[] = [];

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0]!;

      // Parse daily window
      const [startH, startM] = input.dailyStartTime.split(':').map(Number);
      const [endH, endM] = input.dailyEndTime.split(':').map(Number);

      const dayWindowStart = new Date(currentDate);
      dayWindowStart.setHours(startH!, startM!, 0, 0);

      const dayWindowEnd = new Date(currentDate);
      dayWindowEnd.setHours(endH!, endM!, 0, 0);

      let slotStart = new Date(dayWindowStart);
      while (
        new Date(slotStart.getTime() + input.durationMinutes * 60000) <= dayWindowEnd
      ) {
        const slotEnd = new Date(slotStart.getTime() + input.durationMinutes * 60000);

        if (slotStart <= now) {
          skippedSlots.push({
            date: dateString,
            time: slotStart.toTimeString().slice(0, 5),
            reason: 'Past timestamp',
          });
        } else {
          // Check operating hours
          try {
            this.validateDealershipHours(
              slotStart,
              slotEnd,
              vehicle.dealership.openingTime,
              vehicle.dealership.closingTime,
            );

            // Check existing overlap
            const overlapping = await prisma.timeSlot.findFirst({
              where: {
                vehicleId: input.vehicleId,
                status: 'ACTIVE',
                OR: [
                  { startsAt: { lt: slotEnd, gte: slotStart } },
                  { endsAt: { gt: slotStart, lte: slotEnd } },
                  { startsAt: { lte: slotStart }, endsAt: { gte: slotEnd } },
                ],
              },
            });

            if (overlapping) {
              skippedSlots.push({
                date: dateString,
                time: slotStart.toTimeString().slice(0, 5),
                reason: 'Overlaps existing active slot',
              });
            } else {
              const created = await prisma.timeSlot.create({
                data: {
                  vehicleId: input.vehicleId,
                  dealershipId: vehicle.dealershipId,
                  startsAt: slotStart,
                  endsAt: slotEnd,
                  status: 'ACTIVE',
                },
              });
              createdSlots.push(created.id);
            }
          } catch (e: any) {
            skippedSlots.push({
              date: dateString,
              time: slotStart.toTimeString().slice(0, 5),
              reason: e.message || 'Outside opening hours',
            });
          }
        }

        // Advance by duration + gap
        slotStart = new Date(slotEnd.getTime() + input.gapMinutes * 60000);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      createdCount: createdSlots.length,
      skippedCount: skippedSlots.length,
      skippedDetails: skippedSlots,
    };
  }

  async update(id: string, input: UpdateSlotInput) {
    const slot = await prisma.timeSlot.findUnique({
      where: { id },
      include: {
        vehicle: { include: { dealership: true } },
        bookings: {
          where: { status: { in: ['PENDING', 'APPROVED'] } },
        },
      },
    });

    if (!slot) {
      throw new NotFoundError('Time slot not found');
    }

    // Protection rule: cannot edit slot with active booking (§7.5)
    if (slot.bookings.length > 0) {
      throw new ConflictError(
        'Cannot edit slot: it has a pending or approved booking. Reschedule or cancel the booking first.',
        'SLOT_HAS_ACTIVE_BOOKING',
      );
    }

    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);

    this.validateDealershipHours(
      startsAt,
      endsAt,
      slot.vehicle.dealership.openingTime,
      slot.vehicle.dealership.closingTime,
    );

    // Overlap check
    const overlapping = await prisma.timeSlot.findFirst({
      where: {
        id: { not: id },
        vehicleId: slot.vehicleId,
        status: 'ACTIVE',
        OR: [
          { startsAt: { lt: endsAt, gte: startsAt } },
          { endsAt: { gt: startsAt, lte: endsAt } },
          { startsAt: { lte: startsAt }, endsAt: { gte: endsAt } },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictError(
        'Another active slot for this vehicle overlaps with the requested time',
        'SLOT_OVERLAP',
      );
    }

    return prisma.timeSlot.update({
      where: { id },
      data: { startsAt, endsAt },
    });
  }

  async deactivate(id: string) {
    const slot = await prisma.timeSlot.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: { in: ['PENDING', 'APPROVED'] } },
        },
      },
    });

    if (!slot) {
      throw new NotFoundError('Time slot not found');
    }

    // Protection rule: cannot deactivate slot with active booking (§7.5)
    if (slot.bookings.length > 0) {
      throw new ConflictError(
        'Cannot deactivate slot: it has an active booking. Cancel or reschedule the booking first.',
        'SLOT_HAS_ACTIVE_BOOKING',
      );
    }

    return prisma.timeSlot.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async activate(id: string) {
    const slot = await prisma.timeSlot.findUnique({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundError('Time slot not found');
    }

    return prisma.timeSlot.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }
}

export const slotsService = new SlotsService();
