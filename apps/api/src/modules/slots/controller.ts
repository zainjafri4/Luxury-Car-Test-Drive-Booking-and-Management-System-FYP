import type { Request, Response, NextFunction } from 'express';
import { slotsService } from './service.js';
import type { SlotQueryInput } from './schemas.js';

export class SlotsController {
  async getVehicleSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vehicleId = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const from = req.query['from'] as string | undefined;
      const to = req.query['to'] as string | undefined;

      const result = await slotsService.getPublicVehicleSlots(vehicleId, from, to);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query as unknown as SlotQueryInput;
      const slots = await slotsService.list(filters);
      res.json({ data: slots });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slot = await slotsService.create(req.body);
      res.status(201).json({ data: slot });
    } catch (err) {
      next(err);
    }
  }

  async bulkGenerate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await slotsService.bulkGenerate(req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const updated = await slotsService.update(id, req.body);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const deactivated = await slotsService.deactivate(id);
      res.json({ data: deactivated });
    } catch (err) {
      next(err);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const activated = await slotsService.activate(id);
      res.json({ data: activated });
    } catch (err) {
      next(err);
    }
  }
}

export const slotsController = new SlotsController();
