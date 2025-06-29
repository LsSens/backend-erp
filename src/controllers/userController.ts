import { Request, Response, NextFunction } from 'express';
import type { ICreateUser, IUpdateUser } from '@/models/User';
import { UserService } from '@/services/userService';
import { ApiResponse } from '@/types';
import { createError } from '@/middlewares/errorHandler';

export class UserController {
  // List all users
  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number.parseInt((req.query as any).page as string) || 1;
      const limit = Number.parseInt((req.query as any).limit as string) || 10;

      const users = await UserService.listUsers(page, limit);

      const response: ApiResponse = {
        success: true,
        data: users,
        message: 'Users listed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        return next(createError('User ID not provided', 400));
      }

      const user = await UserService.getUserById(id);

      if (!user) {
        return next(createError('User not found', 404));
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User found successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Create new user
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: ICreateUser = req.body;

      const user = await UserService.createUser(userData);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates: IUpdateUser = req.body;

      if (!id) {
        return next(createError('User ID not provided', 400));
      }

      const user = await UserService.updateUser(id, updates);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Delete user
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        return next(createError('User ID not provided', 400));
      }

      await UserService.deleteUser(id);

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }
}
