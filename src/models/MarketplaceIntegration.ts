import Joi from 'joi';
import { IntegrationStatus, MarketplaceType } from '@/types/integration';

// Marketplace Integration validation schemas
export const MarketplaceIntegrationSchema = Joi.object({
  id: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  marketplaceType: Joi.string()
    .valid(...Object.values(MarketplaceType))
    .required(),
  accessToken: Joi.string().required(),
  refreshToken: Joi.string().optional(),
  sellerId: Joi.string().optional(),
  storeName: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(IntegrationStatus))
    .required(),
  lastSyncAt: Joi.string().isoDate().optional(),
  errorMessage: Joi.string().optional(),
  createdAt: Joi.string().isoDate().required(),
  updatedAt: Joi.string().isoDate().required(),
});

export const createMarketplaceIntegrationSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  marketplaceType: Joi.string()
    .valid(...Object.values(MarketplaceType))
    .required(),
  accessToken: Joi.string().required(),
  refreshToken: Joi.string().optional(),
  sellerId: Joi.string().optional(),
  storeName: Joi.string().optional(),
});

export const updateMarketplaceIntegrationSchema = Joi.object({
  accessToken: Joi.string().optional(),
  refreshToken: Joi.string().optional(),
  sellerId: Joi.string().optional(),
  storeName: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(IntegrationStatus))
    .optional(),
  lastSyncAt: Joi.string().isoDate().optional(),
  errorMessage: Joi.string().optional(),
});

export const marketplaceIntegrationIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const userIdSchema = Joi.object({
  userId: Joi.string().uuid().required(),
});

export const marketplaceTypeSchema = Joi.object({
  marketplaceType: Joi.string()
    .valid(...Object.values(MarketplaceType))
    .required(),
});

// Marketplace Integration model interface
export interface IMarketplaceIntegration {
  id: string;
  userId: string;
  marketplaceType: MarketplaceType;
  accessToken: string;
  refreshToken?: string;
  sellerId?: string;
  storeName?: string;
  status: IntegrationStatus;
  lastSyncAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Marketplace Integration creation interface
export interface ICreateMarketplaceIntegration {
  userId: string;
  marketplaceType: MarketplaceType;
  accessToken: string;
  refreshToken?: string;
  sellerId?: string;
  storeName?: string;
}

// Marketplace Integration update interface
export interface IUpdateMarketplaceIntegration {
  accessToken?: string;
  refreshToken?: string;
  sellerId?: string;
  storeName?: string;
  status?: IntegrationStatus;
  lastSyncAt?: string;
  errorMessage?: string;
}
