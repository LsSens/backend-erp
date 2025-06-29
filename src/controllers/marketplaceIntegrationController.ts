import type { NextFunction, Request, Response } from 'express';
import { createError } from '@/middlewares/errorHandler';
import type {
  ICreateMarketplaceIntegration,
  IUpdateMarketplaceIntegration,
} from '@/models/MarketplaceIntegration';
import { MarketplaceIntegrationService } from '@/services/marketplaceIntegrationService';
import type { ApiResponse } from '@/types';

export class MarketplaceIntegrationController {
  // List all marketplace integrations
  static async listMarketplaceIntegrations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = Number.parseInt((req.query as any).page as string) || 1;
      const limit = Number.parseInt((req.query as any).limit as string) || 10;

      const integrations = await MarketplaceIntegrationService.listMarketplaceIntegrations(
        page,
        limit
      );

      const response: ApiResponse = {
        success: true,
        data: integrations,
        message: 'Marketplace integrations listed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Get marketplace integration by ID
  static async getMarketplaceIntegrationById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        return next(createError('Marketplace integration ID not provided', 400));
      }

      const integration = await MarketplaceIntegrationService.getMarketplaceIntegrationById(id);

      if (!integration) {
        return next(createError('Marketplace integration not found', 404));
      }

      const response: ApiResponse = {
        success: true,
        data: integration,
        message: 'Marketplace integration found successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Get marketplace integrations by user ID
  static async getMarketplaceIntegrationsByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return next(createError('User ID not provided', 400));
      }

      const integrations =
        await MarketplaceIntegrationService.getMarketplaceIntegrationsByUserId(userId);

      const response: ApiResponse = {
        success: true,
        data: integrations,
        message: 'User marketplace integrations found successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Get marketplace integrations by marketplace type
  static async getMarketplaceIntegrationsByType(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { marketplaceType } = req.params;

      if (!marketplaceType) {
        return next(createError('Marketplace type not provided', 400));
      }

      const integrations = await MarketplaceIntegrationService.getMarketplaceIntegrationsByType(
        marketplaceType as any
      );

      const response: ApiResponse = {
        success: true,
        data: integrations,
        message: 'Marketplace integrations by type found successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Create new marketplace integration
  static async createMarketplaceIntegration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const integrationData: ICreateMarketplaceIntegration = req.body;
      const userId = req.user?.id as string;

      const integration =
        await MarketplaceIntegrationService.createMarketplaceIntegration(integrationData, userId);

      const response: ApiResponse = {
        success: true,
        data: integration,
        message: 'Marketplace integration created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Update marketplace integration
  static async updateMarketplaceIntegration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updates: IUpdateMarketplaceIntegration = req.body;

      if (!id) {
        return next(createError('Marketplace integration ID not provided', 400));
      }

      const integration = await MarketplaceIntegrationService.updateMarketplaceIntegration(
        id,
        updates
      );

      const response: ApiResponse = {
        success: true,
        data: integration,
        message: 'Marketplace integration updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Delete marketplace integration
  static async deleteMarketplaceIntegration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, marketplaceType, id } = req.params;

      if (!userId || !marketplaceType || !id) {
        return next(createError('User ID, marketplace type, or integration ID not provided', 400));
      }

      await MarketplaceIntegrationService.deleteMarketplaceIntegration(
        userId,
        marketplaceType as any,
        id
      );

      const response: ApiResponse = {
        success: true,
        message: 'Marketplace integration deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Update integration status
  static async updateIntegrationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status, errorMessage } = req.body;

      if (!id) {
        return next(createError('Marketplace integration ID not provided', 400));
      }

      if (!status) {
        return next(createError('Status not provided', 400));
      }

      const integration = await MarketplaceIntegrationService.updateIntegrationStatus(
        id,
        status,
        errorMessage
      );

      const response: ApiResponse = {
        success: true,
        data: integration,
        message: 'Integration status updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }

  // Refresh access token
  static async refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { accessToken, refreshToken } = req.body;

      if (!id) {
        return next(createError('Marketplace integration ID not provided', 400));
      }

      if (!accessToken) {
        return next(createError('Access token not provided', 400));
      }

      const integration = await MarketplaceIntegrationService.refreshAccessToken(
        id,
        accessToken,
        refreshToken
      );

      const response: ApiResponse = {
        success: true,
        data: integration,
        message: 'Access token refreshed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(createError(error instanceof Error ? error.message : 'Internal server error', 500));
    }
  }
}
