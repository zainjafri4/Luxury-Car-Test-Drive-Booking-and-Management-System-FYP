// Shared package — will contain shared Zod schemas, enums, and types (Phase 1+)

export const ROLES = ['CUSTOMER', 'STAFF'] as const;
export type Role = (typeof ROLES)[number];

export const BOOKING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const SLOT_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export const FUEL_TYPES = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const VEHICLE_TYPES = ['SEDAN', 'SUV', 'COUPE', 'CONVERTIBLE', 'HATCHBACK', 'SPORTS', 'OTHER'] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const NOTIFICATION_TYPES = [
  'BOOKING_CREATED',
  'BOOKING_APPROVED',
  'BOOKING_REJECTED',
  'BOOKING_CANCELLED',
  'BOOKING_RESCHEDULED',
  'BOOKING_COMPLETED',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

