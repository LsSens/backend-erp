// Marketplace Types
export enum MarketplaceType {
  MERCADOLIVRE = 'mercadolivre',
  SHOPEE = 'shopee',
  AMAZON = 'amazon',
  MAGAZINE_LUIZA = 'magazine_luiza',
  B2W = 'b2w',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ERROR = 'error',
}

export interface MarketplaceIntegration {
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

export interface CreateMarketplaceIntegrationRequest {
  userId: string;
  marketplaceType: MarketplaceType;
  accessToken: string;
  refreshToken?: string;
  sellerId?: string;
  storeName?: string;
}

export interface UpdateMarketplaceIntegrationRequest {
  accessToken?: string;
  refreshToken?: string;
  sellerId?: string;
  storeName?: string;
  status?: IntegrationStatus;
  lastSyncAt?: string;
  errorMessage?: string;
}

export interface DynamoDBMarketplaceIntegration {
  PK: string; // USER#${userId}
  SK: string; // MARKETPLACE#${marketplaceType}#${id}
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
  GSI1PK?: string; // MARKETPLACE#${marketplaceType}
  GSI1SK?: string; // USER#${userId}#${id}
  GSI2PK?: string; // STATUS#${status}
  GSI2SK?: string; // USER#${userId}#${marketplaceType}#${id}
}
