import { v4 as uuidv4 } from 'uuid';
import { createError } from '@/middlewares/errorHandler';
import type {
  ICreateMarketplaceIntegration,
  IMarketplaceIntegration,
  IUpdateMarketplaceIntegration,
} from '@/models/MarketplaceIntegration';
import { MarketplaceIntegrationRepository } from '@/repositories/marketplaceIntegrationRepository';
import type { PaginatedResponse } from '@/types';
import {
  type DynamoDBMarketplaceIntegration,
  IntegrationStatus,
  MarketplaceType,
} from '@/types/integration';
import { MercadoLivreService } from './marketplaces/mercadolivreService';

export class MarketplaceIntegrationService {
  // Create marketplace integration
  static async createMarketplaceIntegration(
    data: ICreateMarketplaceIntegration,
    userId: string
  ): Promise<IMarketplaceIntegration> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const { accessToken, refreshToken, sellerId, storeName } =
      await MarketplaceIntegrationService.getMarketplaceAuthInfo(data.marketplaceType, data.code);

    const integration: DynamoDBMarketplaceIntegration = {
      PK: `USER#${userId}`,
      SK: `MARKETPLACE#${data.marketplaceType}#${id}`,
      id,
      userId,
      marketplaceType: data.marketplaceType,
      accessToken,
      refreshToken,
      sellerId,
      storeName,
      status: IntegrationStatus.ACTIVE,
      lastSyncAt: undefined,
      errorMessage: undefined,
      createdAt: now,
      updatedAt: now,
      GSI1PK: `MARKETPLACE#${data.marketplaceType}`,
      GSI1SK: `USER#${userId}#${id}`,
      GSI2PK: `STATUS#${IntegrationStatus.ACTIVE}`,
      GSI2SK: `USER#${userId}#${data.marketplaceType}#${id}`,
    };

    const params = MarketplaceIntegrationRepository.createMarketplaceIntegrationRecord(integration);
    await MarketplaceIntegrationRepository.put(params);

    return MarketplaceIntegrationService.mapDynamoDBToModel(integration);
  }

  // Get marketplace integration by ID
  static async getMarketplaceIntegrationById(id: string): Promise<IMarketplaceIntegration | null> {
    const params = MarketplaceIntegrationRepository.getMarketplaceIntegrationById(id);
    const result = await MarketplaceIntegrationRepository.get(params);

    if (!result.Item) {
      return null;
    }

    return MarketplaceIntegrationService.mapDynamoDBToModel(
      result.Item as DynamoDBMarketplaceIntegration
    );
  }

  // Get marketplace integrations by user ID
  static async getMarketplaceIntegrationsByUserId(
    userId: string
  ): Promise<IMarketplaceIntegration[]> {
    const params = MarketplaceIntegrationRepository.getMarketplaceIntegrationsByUserId(userId);
    const result = await MarketplaceIntegrationRepository.query(params);

    return (result.Items || []).map((item) =>
      MarketplaceIntegrationService.mapDynamoDBToModel(item as DynamoDBMarketplaceIntegration)
    );
  }

  // Get marketplace integrations by marketplace type
  static async getMarketplaceIntegrationsByType(
    marketplaceType: MarketplaceType
  ): Promise<IMarketplaceIntegration[]> {
    const params =
      MarketplaceIntegrationRepository.getMarketplaceIntegrationsByType(marketplaceType);
    const result = await MarketplaceIntegrationRepository.query(params);

    return (result.Items || []).map((item) =>
      MarketplaceIntegrationService.mapDynamoDBToModel(item as DynamoDBMarketplaceIntegration)
    );
  }

  // Get marketplace integrations by status
  static async getMarketplaceIntegrationsByStatus(
    status: IntegrationStatus
  ): Promise<IMarketplaceIntegration[]> {
    const params = MarketplaceIntegrationRepository.getMarketplaceIntegrationsByStatus(status);
    const result = await MarketplaceIntegrationRepository.query(params);

    return (result.Items || []).map((item) =>
      MarketplaceIntegrationService.mapDynamoDBToModel(item as DynamoDBMarketplaceIntegration)
    );
  }

  // Get marketplace integration by user ID and marketplace type
  static async getMarketplaceIntegrationByUserAndType(
    userId: string,
    marketplaceType: MarketplaceType
  ): Promise<IMarketplaceIntegration | null> {
    const params = MarketplaceIntegrationRepository.getMarketplaceIntegrationByUserAndType(
      userId,
      marketplaceType
    );
    const result = await MarketplaceIntegrationRepository.query(params);

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return MarketplaceIntegrationService.mapDynamoDBToModel(
      result.Items[0] as DynamoDBMarketplaceIntegration
    );
  }

  // List all marketplace integrations with pagination
  static async listMarketplaceIntegrations(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<IMarketplaceIntegration>> {
    const _offset = (page - 1) * limit;
    const params = MarketplaceIntegrationRepository.scanMarketplaceIntegrations(limit);
    const result = await MarketplaceIntegrationRepository.scan(params);

    const items = (result.Items || []).map((item) =>
      MarketplaceIntegrationService.mapDynamoDBToModel(item as DynamoDBMarketplaceIntegration)
    );

    return {
      items,
      total: result.Count || 0,
      page,
      limit,
      totalPages: Math.ceil((result.Count || 0) / limit),
    };
  }

  // Update marketplace integration
  static async updateMarketplaceIntegration(
    id: string,
    updates: IUpdateMarketplaceIntegration
  ): Promise<IMarketplaceIntegration> {
    const updateData: any = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update GSI2 if status is being updated
    if (updates.status) {
      updateData.GSI2PK = `STATUS#${updates.status}`;
    }

    const params = MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord(
      id,
      updateData
    );
    const result = await MarketplaceIntegrationRepository.update(params);

    return MarketplaceIntegrationService.mapDynamoDBToModel(
      result.Attributes as DynamoDBMarketplaceIntegration
    );
  }

  // Delete marketplace integration
  static async deleteMarketplaceIntegration(
    userId: string,
    marketplaceType: MarketplaceType,
    id: string
  ): Promise<void> {
    const params = MarketplaceIntegrationRepository.deleteMarketplaceIntegrationRecord(
      userId,
      marketplaceType,
      id
    );
    await MarketplaceIntegrationRepository.delete(params);
  }

  // Update integration status
  static async updateIntegrationStatus(
    id: string,
    status: IntegrationStatus,
    errorMessage?: string
  ): Promise<IMarketplaceIntegration> {
    const updates: IUpdateMarketplaceIntegration = {
      status,
      errorMessage,
      lastSyncAt: status === IntegrationStatus.ACTIVE ? new Date().toISOString() : undefined,
    };

    return MarketplaceIntegrationService.updateMarketplaceIntegration(id, updates);
  }

  // Refresh access token
  static async refreshAccessToken(
    id: string,
    newAccessToken: string,
    newRefreshToken?: string
  ): Promise<IMarketplaceIntegration> {
    const updates: IUpdateMarketplaceIntegration = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    return MarketplaceIntegrationService.updateMarketplaceIntegration(id, updates);
  }

  // Map DynamoDB record to model
  private static mapDynamoDBToModel(item: DynamoDBMarketplaceIntegration): IMarketplaceIntegration {
    return {
      id: item.id,
      userId: item.userId,
      marketplaceType: item.marketplaceType,
      accessToken: item.accessToken,
      refreshToken: item.refreshToken,
      sellerId: item.sellerId,
      storeName: item.storeName,
      status: item.status,
      lastSyncAt: item.lastSyncAt,
      errorMessage: item.errorMessage,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  static async getMarketplaceAuthInfo(
    marketplaceType: MarketplaceType,
    code: string
  ): Promise<{
    marketplaceType: MarketplaceType;
    accessToken: string;
    refreshToken: string;
    sellerId: string;
    storeName: string;
  }> {
    try {
      if (marketplaceType === MarketplaceType.MERCADOLIVRE) {
        const { accessToken, refreshToken, sellerId, storeName } =
          await MercadoLivreService.getMarketplaceAuthInfo(code);
        return {
          marketplaceType,
          accessToken,
          refreshToken,
          sellerId,
          storeName,
        };
      }
      throw createError('Marketplace type not supported', 400);
    } catch (_error) {
      throw createError('Error getting marketplace info', 500);
    }
  }
}
