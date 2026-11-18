import type { Request, Response, NextFunction } from 'express';
import { bookingsService } from './service.js';
import type { CustomerBookingsQueryInput, AdminBookingsQueryInput } from './schemas.js';

export class BookingsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingsService.create(req.user!.id, req.body);
      res.status(201).json({ data: booking });
    } catch (err) {
      next(err);
    }
  }

  async listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as CustomerBookingsQueryInput;
      const result = await bookingsService.listCustomerBookings(req.user!.id, query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const isStaff = req.user?.role === 'STAFF';
      const booking = await bookingsService.getById(id, req.user!.id, isStaff);
      res.json({ data: booking });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const isStaff = req.user?.role === 'STAFF';
      const cancelled = await bookingsService.cancel(id, req.user!.id, isStaff, req.body);
      res.json({ data: cancelled });
    } catch (err) {
      next(err);
    }
  }

  async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as AdminBookingsQueryInput;
      const result = await bookingsService.listAdminBookings(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const approved = await bookingsService.approve(id, req.user!.id);
      res.json({ data: approved });
    } catch (err) {
      next(err);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const rejected = await bookingsService.reject(id, req.user!.id, req.body);
      res.json({ data: rejected });
    } catch (err) {
      next(err);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const completed = await bookingsService.complete(id, req.user!.id);
      res.json({ data: completed });
    } catch (err) {
      next(err);
    }
  }

  async reschedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const rescheduled = await bookingsService.reschedule(id, req.user!.id, req.body);
      res.json({ data: rescheduled });
    } catch (err) {
      next(err);
    }
  }
}

export const bookingsController = new BookingsController();

