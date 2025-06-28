import type { Request, Response } from 'express';
import type { ICreateUser, IUpdateUser } from '@/models/User';
import { UserService } from '@/services/userService';
import type { ApiResponse } from '@/types';

export class UserController {
  // List all users
  static async listUsers(req: Request, res: Response): Promise<void> {
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
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      };

      res.status(500).json(response);
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not provided',
        };
        res.status(400).json(response);
        return;
      }

      const user = await UserService.getUserById(id);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };

        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User found successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      };

      res.status(500).json(response);
    }
  }

  // Create new user
  static async createUser(req: Request, res: Response): Promise<void> {
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
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      };

      res.status(500).json(response);
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates: IUpdateUser = req.body;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not provided',
        };
        res.status(400).json(response);
        return;
      }

      const user = await UserService.updateUser(id, updates);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      };

      res.status(500).json(response);
    }
  }

  // Delete user
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID not provided',
        };
        res.status(400).json(response);
        return;
      }

      await UserService.deleteUser(id);

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      };

      res.status(500).json(response);
    }
  }
}
