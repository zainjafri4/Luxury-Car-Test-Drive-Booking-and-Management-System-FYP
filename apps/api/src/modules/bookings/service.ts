import { prisma } from '../../lib/prisma.js';
import { sendEmail } from '../../lib/mailer.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../lib/errors.js';
import { env } from '../../config/env.js';
import type { Prisma, BookingStatus } from '@prisma/client';
import type {
  CreateBookingInput,
  CancelBookingInput,
  RejectBookingInput,
  RescheduleBookingInput,
  CustomerBookingsQueryInput,
  AdminBookingsQueryInput,
} from './schemas.js';

export class BookingsService {
  /**
   * FR-06: Customer creates booking with §7.2 checks executed inside a single DB transaction.
   */
  async create(customerId: string, input: CreateBookingInput) {
    const minLeadMinutes = env.MIN_BOOKING_LEAD_MINUTES;
    const maxAdvanceDays = env.MAX_BOOKING_ADVANCE_DAYS;
    const maxActivePerCustomer = env.MAX_ACTIVE_BOOKINGS_PER_CUSTOMER;

    return prisma.$transaction(async (tx) => {
      // 1. Verify customer exists and is active
      const customer = await tx.user.findUnique({
        where: { id: customerId },
      });

      if (!customer || !customer.isActive || customer.role !== 'CUSTOMER') {
        throw new BadRequestError('Customer account invalid or inactive');
      }

      // 2. Fetch slot with vehicle and dealership availability
      const slot = await tx.timeSlot.findUnique({
        where: { id: input.slotId },
        include: {
          vehicle: true,
          dealership: true,
        },
      });

      if (!slot || slot.status !== 'ACTIVE') {
        throw new NotFoundError('Selected slot is no longer available');
      }

      if (!slot.vehicle.isActive || !slot.vehicle.isAvailable) {
        throw new ConflictError('Vehicle is currently unavailable for booking', 'VEHICLE_UNAVAILABLE');
      }

      if (!slot.dealership.isActive) {
        throw new ConflictError('Dealership is currently inactive', 'DEALERSHIP_INACTIVE');
      }

      // 3. Time checks (lead time & max advance days)
      const now = new Date();
      const minStartsAt = new Date(now.getTime() + minLeadMinutes * 60 * 1000);
      const maxStartsAt = new Date(now.getTime() + maxAdvanceDays * 24 * 60 * 60 * 1000);

      if (slot.startsAt < minStartsAt) {
        throw new BadRequestError(
          `Bookings must be requested at least ${minLeadMinutes} minutes in advance`,
        );
      }

      if (slot.startsAt > maxStartsAt) {
        throw new BadRequestError(
          `Bookings cannot be scheduled more than ${maxAdvanceDays} days in advance`,
        );
      }

      // 4. Overlap check for this customer (cannot hold two simultaneous active bookings)
      const overlappingCustomerBooking = await tx.booking.findFirst({
        where: {
          customerId,
          status: { in: ['PENDING', 'APPROVED'] },
          slot: {
            OR: [
              { startsAt: { lt: slot.endsAt, gte: slot.startsAt } },
              { endsAt: { gt: slot.startsAt, lte: slot.endsAt } },
              { startsAt: { lte: slot.startsAt }, endsAt: { gte: slot.endsAt } },
            ],
          },
        },
      });

      if (overlappingCustomerBooking) {
        throw new ConflictError(
          'You already have an active test-drive booking scheduled during this time window',
          'CUSTOMER_BOOKING_OVERLAP',
        );
      }

      // 5. Max active bookings limit per customer
      const activeBookingsCount = await tx.booking.count({
        where: {
          customerId,
          status: { in: ['PENDING', 'APPROVED'] },
          slot: { startsAt: { gt: now } },
        },
      });

      if (activeBookingsCount >= maxActivePerCustomer) {
        throw new ConflictError(
          `You have reached the maximum allowed active bookings limit (${maxActivePerCustomer})`,
          'MAX_ACTIVE_BOOKINGS_EXCEEDED',
        );
      }

      // 6. Create booking (PENDING) — partial unique index guarantees slot exclusivity under concurrency
      const booking = await tx.booking.create({
        data: {
          customerId,
          slotId: input.slotId,
          status: 'PENDING',
          customerNote: input.customerNote || null,
        },
        include: {
          slot: {
            include: { vehicle: true, dealership: true },
          },
        },
      });

      // 7. Audit history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          toStatus: 'PENDING',
          changedById: customerId,
          note: 'Booking request submitted by customer',
        },
      });

      // 8. In-app notification
      await tx.notification.create({
        data: {
          userId: customerId,
          bookingId: booking.id,
          type: 'BOOKING_CREATED',
          title: 'Booking Request Received',
          message: `Your request to test drive the ${slot.vehicle.manufacturer} ${slot.vehicle.model} on ${slot.startsAt.toISOString()} is pending review.`,
        },
      });

      // Email dispatch (best-effort after commit)
      setTimeout(() => {
        sendEmail({
          to: customer.email,
          subject: 'Test-Drive Request Received - Aurum Drive',
          text: `Hello ${customer.fullName},\n\nYour test-drive request for the ${slot.vehicle.manufacturer} ${slot.vehicle.model} has been received. Our team will review your slot shortly.\n\nAurum Drive Concierge`,
        });
      }, 0);

      return booking;
    });
  }

  /**
   * FR-08: Customer view own bookings partitioned by group
   */
  async listCustomerBookings(customerId: string, query: CustomerBookingsQueryInput) {
    const now = new Date();
    const where: Prisma.BookingWhereInput = { customerId };

    if (query.group === 'pending') {
      where.status = 'PENDING';
    } else if (query.group === 'upcoming') {
      where.status = 'APPROVED';
      where.slot = { startsAt: { gt: now } };
    } else if (query.group === 'completed') {
      where.status = 'COMPLETED';
    } else if (query.group === 'cancelled') {
      where.status = { in: ['CANCELLED', 'REJECTED'] };
    } else if (query.group === 'past') {
      where.slot = { startsAt: { lte: now } };
    }

    const skip = (query.page - 1) * query.pageSize;

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          slot: {
            include: { vehicle: true, dealership: true },
          },
        },
      }),
    ]);

    return {
      data: bookings,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async getById(bookingId: string, userId: string, isStaff: boolean) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
        decidedByStaff: { select: { id: true, fullName: true, email: true } },
        slot: {
          include: { vehicle: true, dealership: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedBy: { select: { id: true, fullName: true, role: true } },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Ownership check (§10: 404 rather than 403 to prevent leaking existence)
    if (!isStaff && booking.customerId !== userId) {
      throw new NotFoundError('Booking not found');
    }

    return booking;
  }

  /**
   * FR-08 & §7.3: Cancellation logic (Customer or Staff)
   */
  async cancel(bookingId: string, userId: string, isStaff: boolean, input: CancelBookingInput) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: { include: { vehicle: true } },
        customer: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (!isStaff && booking.customerId !== userId) {
      throw new NotFoundError('Booking not found');
    }

    if (!['PENDING', 'APPROVED'].includes(booking.status)) {
      throw new ConflictError(
        `Cannot cancel booking with status ${booking.status}`,
        'INVALID_STATUS_TRANSITION',
      );
    }

    // Customer cancellation cutoff rule (§7.3)
    if (!isStaff) {
      const now = new Date();
      const cutoffHours = env.CANCELLATION_CUTOFF_HOURS;
      const minCancellationTime = new Date(now.getTime() + cutoffHours * 60 * 60 * 1000);

      if (booking.slot.startsAt <= minCancellationTime) {
        throw new ConflictError(
          `Bookings cannot be cancelled less than ${cutoffHours} hours before the scheduled time slot. Please contact the dealership directly.`,
          'CANCELLATION_NOT_ALLOWED',
        );
      }
    } else {
      if (!input.reason) {
        throw new BadRequestError('Staff cancellation requires a specified reason');
      }
    }

    const cancelledRole = isStaff ? 'STAFF' : 'CUSTOMER';
    const reason = input.reason || (isStaff ? 'Cancelled by dealership staff' : 'Cancelled by customer');

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelledBy: cancelledRole,
          cancelReason: reason,
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: booking.status,
          toStatus: 'CANCELLED',
          changedById: userId,
          note: reason,
        },
      });

      await tx.notification.create({
        data: {
          userId: booking.customerId,
          bookingId,
          type: 'BOOKING_CANCELLED',
          title: 'Booking Cancelled',
          message: `Your booking for ${booking.slot.vehicle.manufacturer} ${booking.slot.vehicle.model} has been cancelled. (${reason})`,
        },
      });

      return res;
    });

    // Best-effort email
    setTimeout(() => {
      sendEmail({
        to: booking.customer.email,
        subject: 'Booking Cancelled - Aurum Drive',
        text: `Hello ${booking.customer.fullName},\n\nYour test-drive booking has been cancelled.\nReason: ${reason}\n\nAurum Drive Team`,
      });
    }, 0);

    return updated;
  }

  /**
   * FR-07: Staff approve booking
   */
  async approve(bookingId: string, staffId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: { include: { vehicle: true } },
        customer: true,
      },
    });

    if (!booking) throw new NotFoundError('Booking not found');

    if (booking.status !== 'PENDING') {
      throw new ConflictError(
        `Cannot approve booking with status ${booking.status}. Allowed only from PENDING.`,
        'INVALID_STATUS_TRANSITION',
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'APPROVED',
          decidedByStaffId: staffId,
          decidedAt: new Date(),
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: 'PENDING',
          toStatus: 'APPROVED',
          changedById: staffId,
          note: 'Booking approved by staff',
        },
      });

      await tx.notification.create({
        data: {
          userId: booking.customerId,
          bookingId,
          type: 'BOOKING_APPROVED',
          title: 'Booking Approved!',
          message: `Your test-drive booking for ${booking.slot.vehicle.manufacturer} ${booking.slot.vehicle.model} is approved. We look forward to seeing you.`,
        },
      });

      return res;
    });

    setTimeout(() => {
      sendEmail({
        to: booking.customer.email,
        subject: 'Your Test Drive is Confirmed! - Aurum Drive',
        text: `Hello ${booking.customer.fullName},\n\nGreat news! Your test-drive request has been approved.\nSlot: ${booking.slot.startsAt.toISOString()}\n\nAurum Drive Concierge`,
      });
    }, 0);

    return updated;
  }

  /**
   * FR-07: Staff reject booking
   */
  async reject(bookingId: string, staffId: string, input: RejectBookingInput) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: { include: { vehicle: true } },
        customer: true,
      },
    });

    if (!booking) throw new NotFoundError('Booking not found');

    if (booking.status !== 'PENDING') {
      throw new ConflictError(
        `Cannot reject booking with status ${booking.status}. Allowed only from PENDING.`,
        'INVALID_STATUS_TRANSITION',
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'REJECTED',
          staffNote: input.staffNote,
          decidedByStaffId: staffId,
          decidedAt: new Date(),
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: 'PENDING',
          toStatus: 'REJECTED',
          changedById: staffId,
          note: input.staffNote,
        },
      });

      await tx.notification.create({
        data: {
          userId: booking.customerId,
          bookingId,
          type: 'BOOKING_REJECTED',
          title: 'Booking Request Declined',
          message: `Your test-drive request for ${booking.slot.vehicle.manufacturer} ${booking.slot.vehicle.model} could not be accepted. Note: ${input.staffNote}`,
        },
      });

      return res;
    });

    setTimeout(() => {
      sendEmail({
        to: booking.customer.email,
        subject: 'Test-Drive Request Update - Aurum Drive',
        text: `Hello ${booking.customer.fullName},\n\nUnfortunately, we were unable to approve your booking request.\nReason: ${input.staffNote}\n\nAurum Drive Concierge`,
      });
    }, 0);

    return updated;
  }

  /**
   * FR-07: Staff mark booking complete (only if slot startsAt <= now)
   */
  async complete(bookingId: string, staffId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: { include: { vehicle: true } },
        customer: true,
      },
    });

    if (!booking) throw new NotFoundError('Booking not found');

    if (booking.status !== 'APPROVED') {
      throw new ConflictError(
        `Cannot complete booking with status ${booking.status}. Only APPROVED bookings can be completed.`,
        'INVALID_STATUS_TRANSITION',
      );
    }

    if (booking.slot.startsAt > new Date()) {
      throw new BadRequestError('Cannot complete a booking before its scheduled slot has arrived');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: 'APPROVED',
          toStatus: 'COMPLETED',
          changedById: staffId,
          note: 'Test-drive completed successfully',
        },
      });

      await tx.notification.create({
        data: {
          userId: booking.customerId,
          bookingId,
          type: 'BOOKING_COMPLETED',
          title: 'Test Drive Completed',
          message: `Thank you for test-driving the ${booking.slot.vehicle.manufacturer} ${booking.slot.vehicle.model}! We hope you enjoyed the experience.`,
        },
      });

      return res;
    });

    return updated;
  }

  /**
   * FR-07 & §7.4: Staff reschedule booking to new slot on the same vehicle
   */
  async reschedule(bookingId: string, staffId: string, input: RescheduleBookingInput) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          slot: { include: { vehicle: true } },
          customer: true,
        },
      });

      if (!booking) throw new NotFoundError('Booking not found');

      if (!['PENDING', 'APPROVED'].includes(booking.status)) {
        throw new ConflictError(
          `Cannot reschedule booking with status ${booking.status}`,
          'INVALID_STATUS_TRANSITION',
        );
      }

      const newSlot = await tx.timeSlot.findUnique({
        where: { id: input.newSlotId },
        include: { vehicle: true },
      });

      if (!newSlot || newSlot.status !== 'ACTIVE') {
        throw new NotFoundError('Target slot is unavailable or inactive');
      }

      // Must be same vehicle per Decisions in progress.md
      if (newSlot.vehicleId !== booking.slot.vehicleId) {
        throw new BadRequestError('Rescheduling must be to an active slot for the same vehicle');
      }

      if (newSlot.startsAt <= new Date()) {
        throw new BadRequestError('Cannot reschedule to a past time slot');
      }

      // Check slot has no active booking
      const activeSlotBooking = await tx.booking.findFirst({
        where: {
          slotId: newSlot.id,
          status: { in: ['PENDING', 'APPROVED'] },
          id: { not: bookingId },
        },
      });

      if (activeSlotBooking) {
        throw new ConflictError('The destination slot already has an active booking', 'SLOT_ALREADY_BOOKED');
      }

      // Check customer has no other overlapping booking
      const customerOverlap = await tx.booking.findFirst({
        where: {
          customerId: booking.customerId,
          status: { in: ['PENDING', 'APPROVED'] },
          id: { not: bookingId },
          slot: {
            OR: [
              { startsAt: { lt: newSlot.endsAt, gte: newSlot.startsAt } },
              { endsAt: { gt: newSlot.startsAt, lte: newSlot.endsAt } },
              { startsAt: { lte: newSlot.startsAt }, endsAt: { gte: newSlot.endsAt } },
            ],
          },
        },
      });

      if (customerOverlap) {
        throw new ConflictError(
          'Customer has another booking that overlaps with the new slot',
          'CUSTOMER_BOOKING_OVERLAP',
        );
      }

      const oldSlotStr = booking.slot.startsAt.toISOString();
      const newSlotStr = newSlot.startsAt.toISOString();
      const note = input.note || `Rescheduled from ${oldSlotStr} to ${newSlotStr}`;

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { slotId: newSlot.id },
        include: {
          slot: { include: { vehicle: true, dealership: true } },
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: booking.status,
          toStatus: booking.status,
          changedById: staffId,
          note,
        },
      });

      await tx.notification.create({
        data: {
          userId: booking.customerId,
          bookingId,
          type: 'BOOKING_RESCHEDULED',
          title: 'Booking Rescheduled',
          message: `Your test drive has been rescheduled to ${newSlotStr}. Note: ${note}`,
        },
      });

      return updated;
    });
  }

  /**
   * FR-09: Admin view & filter all bookings
   */
  async listAdminBookings(query: AdminBookingsQueryInput) {
    const where: Prisma.BookingWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.dealershipId) where.slot = { dealershipId: query.dealershipId };
    if (query.vehicleId) {
      where.slot = { ...(where.slot as object), vehicleId: query.vehicleId };
    }

    if (query.customer) {
      where.customer = {
        OR: [
          { fullName: { contains: query.customer, mode: 'insensitive' } },
          { email: { contains: query.customer, mode: 'insensitive' } },
        ],
      };
    }

    if (query.dateFrom || query.dateTo) {
      const slotTime: Prisma.DateTimeFilter = {};
      if (query.dateFrom) slotTime.gte = new Date(query.dateFrom);
      if (query.dateTo) slotTime.lte = new Date(query.dateTo);
      where.slot = { ...(where.slot as object), startsAt: slotTime };
    }

    let orderBy: Prisma.BookingOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'slotTimeAsc') {
      orderBy = { slot: { startsAt: 'asc' } };
    } else if (query.sort === 'slotTimeDesc') {
      orderBy = { slot: { startsAt: 'desc' } };
    }

    const skip = (query.page - 1) * query.pageSize;

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy,
        include: {
          customer: { select: { id: true, fullName: true, email: true, phone: true } },
          slot: {
            include: { vehicle: true, dealership: true },
          },
        },
      }),
    ]);

    return {
      data: bookings,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }
}

export const bookingsService = new BookingsService();

