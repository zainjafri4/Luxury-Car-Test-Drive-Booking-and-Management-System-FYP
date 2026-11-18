import type { Request, Response, NextFunction } from 'express';
import { notificationsService } from './service.js';
import type { NotificationsQueryInput } from './schemas.js';

export class NotificationsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as NotificationsQueryInput;
      const result = await notificationsService.list(req.user!.id, query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await notificationsService.getUnreadCount(req.user!.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
      const result = await notificationsService.markAsRead(req.user!.id, id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await notificationsService.markAllAsRead(req.user!.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationsController = new NotificationsController();

