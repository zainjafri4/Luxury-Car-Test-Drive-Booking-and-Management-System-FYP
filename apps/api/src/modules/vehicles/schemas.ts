import { z } from 'zod';
import { VehicleType, FuelType } from '@prisma/client';

export const vehicleTypeEnum = z.nativeEnum(VehicleType);
export const fuelTypeEnum = z.nativeEnum(FuelType);

export const createVehicleSchema = z
  .object({
    dealershipId: z.string().uuid('Invalid dealership ID'),
    manufacturer: z.string().trim().min(2, 'Manufacturer is required'),
    model: z.string().trim().min(1, 'Model is required'),
    year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 2),
    type: vehicleTypeEnum,
    fuelType: fuelTypeEnum,
    transmission: z.string().trim().min(2, 'Transmission is required'),
    engine: z.string().trim().min(2, 'Engine is required'),
    powerHp: z.coerce.number().int().positive().optional(),
    topSpeedKmh: z.coerce.number().int().positive().optional(),
    acceleration0to100: z.coerce.number().positive().max(30).optional(),
    seats: z.coerce.number().int().min(1).max(12),
    color: z.string().trim().optional(),
    priceUsd: z.coerce.number().positive().optional(),
    description: z.string().trim().min(10, 'Description must be at least 10 characters'),
    features: z.array(z.string().trim()).default([]),
    imageUrls: z.array(z.string().trim()).default([]),
    isAvailable: z.boolean().default(true),
  })
  .strict();

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleQuerySchema = z
  .object({
    q: z.string().trim().optional(),
    manufacturer: z.string().trim().optional(),
    model: z.string().trim().optional(),
    type: vehicleTypeEnum.optional(),
    fuelType: fuelTypeEnum.optional(),
    dealershipId: z.string().uuid().optional(),
    yearMin: z.coerce.number().int().optional(),
    yearMax: z.coerce.number().int().optional(),
    sort: z.enum(['newest', 'manufacturer', 'year', 'priceAsc', 'priceDesc']).default('newest'),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(12),
    includeInactive: z
      .enum(['true', 'false'])
      .optional()
      .transform((val) => val === 'true'),
  })
  .strict();

export const removeImageSchema = z
  .object({
    imageUrl: z.string().min(1, 'imageUrl is required'),
  })
  .strict();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleQueryInput = z.infer<typeof vehicleQuerySchema>;

