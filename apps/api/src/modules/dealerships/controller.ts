import type { Request, Response, NextFunction } from 'express';
import { dealershipsService } from './service.js';

export class DealershipsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isStaff = req.user?.role === 'STAFF';
      const includeInactive = isStaff && req.query['includeInactive'] === 'true';
      const page = req.query['page'] ? Number(req.query['page']) : 1;
      const pageSize = req.query['pageSize'] ? Number(req.query['pageSize']) : 12;

      const result = await dealershipsService.list(includeInactive, page, pageSize);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const dealership = await dealershipsService.getById(id);
      res.json({ data: dealership });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await dealershipsService.create(req.body);
      res.status(201).json({ data: created });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const updated = await dealershipsService.update(id, req.body);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const cascade = req.body?.cascade === true || req.query['cascade'] === 'true';
      const deactivated = await dealershipsService.deactivate(id, cascade);
      res.json({ data: deactivated });
    } catch (err) {
      next(err);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const activated = await dealershipsService.activate(id);
      res.json({ data: activated });
    } catch (err) {
      next(err);
    }
  }
}

export const dealershipsController = new DealershipsController();
