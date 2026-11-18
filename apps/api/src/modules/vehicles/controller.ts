import type { Request, Response, NextFunction } from 'express';
import { vehiclesService } from './service.js';
import type { VehicleQueryInput } from './schemas.js';

export class VehiclesController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isStaff = req.user?.role === 'STAFF';
      const filters = req.query as unknown as VehicleQueryInput;
      const result = await vehiclesService.list(filters, isStaff);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getFilters(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = await vehiclesService.getFilters();
      res.json({ data: filters });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const vehicle = await vehiclesService.getById(id);
      res.json({ data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vehicle = await vehiclesService.create(req.body);
      res.status(201).json({ data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const updated = await vehiclesService.update(id, req.body);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  }

  async uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const files = req.files as Express.Multer.File[];
      const urls = files?.map((f) => `/uploads/${f.filename}`) || [];
      const vehicle = await vehiclesService.addImages(id, urls);
      res.json({ data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  async removeImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const vehicle = await vehiclesService.removeImage(id, req.body.imageUrl);
      res.json({ data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const cascade = req.body?.cascade === true || req.query['cascade'] === 'true';
      const deactivated = await vehiclesService.deactivate(id, cascade);
      res.json({ data: deactivated });
    } catch (err) {
      next(err);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const activated = await vehiclesService.activate(id);
      res.json({ data: activated });
    } catch (err) {
      next(err);
    }
  }
}

export const vehiclesController = new VehiclesController();
