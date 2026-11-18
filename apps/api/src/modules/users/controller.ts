import type { Request, Response, NextFunction } from 'express';
import { usersService } from './service.js';

export class UsersController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await usersService.getProfile(req.user!.id);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await usersService.updateProfile(req.user!.id, req.body);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await usersService.changePassword(req.user!.id, req.body);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();

