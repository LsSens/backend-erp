import { IntegrationStatus, MarketplaceType } from '../../types/integration';
import { MarketplaceIntegrationRepository } from '../marketplaceIntegrationRepository';

// Mock DynamoDB
jest.mock('@/config/database', () => ({
  dynamoDB: {
    put: jest.fn().mockReturnValue({ promise: jest.fn() }),
    get: jest.fn().mockReturnValue({ promise: jest.fn() }),
    query: jest.fn().mockReturnValue({ promise: jest.fn() }),
    update: jest.fn().mockReturnValue({ promise: jest.fn() }),
    delete: jest.fn().mockReturnValue({ promise: jest.fn() }),
    scan: jest.fn().mockReturnValue({ promise: jest.fn() }),
  },
}));

describe('MarketplaceIntegrationRepository', () => {
  const mockIntegration = {
    PK: 'USER#123e4567-e89b-12d3-a456-426614174001',
    SK: 'MARKETPLACE#mercadolivre#123e4567-e89b-12d3-a456-426614174000',
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    marketplaceType: MarketplaceType.MERCADOLIVRE,
    accessToken: 'valid-access-token',
    refreshToken: 'valid-refresh-token',
    sellerId: 'seller123',
    storeName: 'Minha Loja',
    status: IntegrationStatus.ACTIVE,
    lastSyncAt: '2024-01-01T00:00:00.000Z',
    errorMessage: undefined,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    GSI1PK: 'MARKETPLACE#mercadolivre',
    GSI1SK: 'USER#123e4567-e89b-12d3-a456-426614174001#123e4567-e89b-12d3-a456-426614174000',
    GSI2PK: 'STATUS#active',
    GSI2SK:
      'USER#123e4567-e89b-12d3-a456-426614174001#mercadolivre#123e4567-e89b-12d3-a456-426614174000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMarketplaceIntegrationRecord', () => {
    it('should create correct DynamoDB parameters for marketplace integration', () => {
      const params =
        MarketplaceIntegrationRepository.createMarketplaceIntegrationRecord(mockIntegration);

      expect(params).toEqual({
        TableName: 'marketplace_integrations',
        Item: mockIntegration,
      });
    });
  });

  describe('getMarketplaceIntegrationById', () => {
    it('should create correct DynamoDB parameters for getting integration by ID', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const params = MarketplaceIntegrationRepository.getMarketplaceIntegrationById(id);

      expect(params).toEqual({
        TableName: 'marketplace_integrations',
        Key: {
          PK: 'MARKETPLACE_INTEGRATION#123e4567-e89b-12d3-a456-426614174000',
          SK: 'MARKETPLACE_INTEGRATION#123e4567-e89b-12d3-a456-426614174000',
        },
      });
    });
  });

  describe('getMarketplaceIntegrationsByUserId', () => {
    it('should create correct DynamoDB parameters for getting integrations by user ID', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      const params = MarketplaceIntegrationRepository.getMarketplaceIntegrationsByUserId(userId);

      expect(params).toEqual({
        TableName: 'marketplace_integrations',
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': 'USER#123e4567-e89b-12d3-a456-426614174001',
        },
      });
    });
  });

  describe('getMarketplaceIntegrationsByType', () => {
    it('should create correct DynamoDB parameters for getting integrations by marketplace type', () => {
      const marketplaceType = MarketplaceType.MERCADOLIVRE;
      const params =
        MarketplaceIntegrationRepository.getMarketplaceIntegrationsByType(marketplaceType);

      expect(params).toEqual({
        TableName: 'marketplace_integrations',
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :marketplaceType',
        ExpressionAttributeValues: {
          ':marketplaceType': 'MARKETPLACE#mercadolivre',
        },
      });
    });
  });

  describe('getMarketplaceIntegrationsByStatus', () => {
    it('should create correct DynamoDB parameters for getting integrations by status', () => {
      const status = IntegrationStatus.ACTIVE;
      const params = MarketplaceIntegrationRepository.getMarketplaceIntegrationsByStatus(status);

      expect(params).toEqual({
        TableName: 'marketplace_integrations',
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :status',
        ExpressionAttributeValues: {
          ':status': 'STATUS#active',
        },
      });
    });
  });

  describe('getMarketplaceIntegrationByUserAndType', () => {
    it('should create correct DynamoDB parameters for getting integration by user and type', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      const marketplaceType = MarketplaceType.MERCADOLIVRE;
      const params = MarketplaceIntegrationRepository.getMarketplaceIntegrationByUserAndType(
        userId,
        marketplaceType
      );

      expect(params).toEqual({
        TableName: 'marketplace_integrations',
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': 'USER#123e4567-e89b-12d3-a456-426614174001',
          ':sk': 'MARKETPLACE#mercadolivre',
        },
      });
    });
  });

  describe('updateMarketplaceIntegrationRecord', () => {
    it('should create correct DynamoDB parameters for updating integration', () => {
      const id =
        'USER#123e4567-e89b-12d3-a456-426614174001#MARKETPLACE#mercadolivre#123e4567-e89b-12d3-a456-426614174000';
      const updates = {
        accessToken: 'new-access-token',
        status: IntegrationStatus.INACTIVE,
      };

      const params = MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord(
        id,
        updates
      );

      expect(params).toEqual({
        TableName: 'marketplace_integrations',
        Key: {
          PK: 'USER#123e4567-e89b-12d3-a456-426614174001',
          SK: 'MARKETPLACE#mercadolivre#123e4567-e89b-12d3-a456-426614174000',
        },
        UpdateExpression: 'SET #accessToken = :accessToken, #status = :status',
        ExpressionAttributeNames: {
          '#accessToken': 'accessToken',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':accessToken': 'new-access-token',
          ':status': IntegrationStatus.INACTIVE,
        },
        ReturnValues: 'ALL_NEW',
      });
    });

    it('should handle multiple updates correctly', () => {
      const id =
        'USER#123e4567-e89b-12d3-a456-426614174001#MARKETPLACE#mercadolivre#123e4567-e89b-12d3-a456-426614174000';
      const updates = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        sellerId: 'new-seller-id',
        storeName: 'Nova Loja',
      };

      const params = MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord(
        id,
        updates
      );

      expect(params.UpdateExpression).toBe(
        'SET #accessToken = :accessToken, #refreshToken = :refreshToken, #sellerId = :sellerId, #storeName = :storeName'
      );
      expect(Object.keys(params.ExpressionAttributeNames)).toHaveLength(4);
      expect(Object.keys(params.ExpressionAttributeValues)).toHaveLength(4);
    });
  });

  describe('deleteMarketplaceIntegrationRecord', () => {
    it('should create correct DynamoDB parameters for deleting integration', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      const marketplaceType = MarketplaceType.MERCADOLIVRE;
      const id = '123e4567-e89b-12d3-a456-426614174000';

      const params = MarketplaceIntegrationRepository.deleteMarketplaceIntegrationRecord(
        userId,
        marketplaceType,
        id
      );

      expect(params).toEqual({
        TableName: 'marketplace_integrations',
        Key: {
          PK: 'USER#123e4567-e89b-12d3-a456-426614174001',
          SK: 'MARKETPLACE#mercadolivre#123e4567-e89b-12d3-a456-426614174000',
        },
      });
    });
  });

  describe('scanMarketplaceIntegrations', () => {
    it('should create correct DynamoDB parameters for scanning integrations', () => {
      const params = MarketplaceIntegrationRepository.scanMarketplaceIntegrations(50);

      expect(params).toEqual({
        TableName: 'marketplace_integrations',
        FilterExpression: 'begins_with(PK, :pk)',
        ExpressionAttributeValues: {
          ':pk': 'USER#',
        },
        Limit: 50,
      });
    });

    it('should include ExclusiveStartKey when provided', () => {
      const lastEvaluatedKey = { PK: 'USER#123', SK: 'MARKETPLACE#mercadolivre#456' };
      const params = MarketplaceIntegrationRepository.scanMarketplaceIntegrations(
        50,
        lastEvaluatedKey
      );

      expect(params).toEqual({
        TableName: 'marketplace_integrations',
        FilterExpression: 'begins_with(PK, :pk)',
        ExpressionAttributeValues: {
          ':pk': 'USER#',
        },
        Limit: 50,
        ExclusiveStartKey: lastEvaluatedKey,
      });
    });
  });

  describe('Database operations', () => {
    it('should call put method correctly', async () => {
      const params = { TableName: 'test', Item: {} };
      await MarketplaceIntegrationRepository.put(params);

      const { dynamoDB } = require('@/config/database');
      expect(dynamoDB.put).toHaveBeenCalledWith(params);
      expect(dynamoDB.put().promise).toHaveBeenCalled();
    });

    it('should call get method correctly', async () => {
      const params = { TableName: 'test', Key: {} };
      await MarketplaceIntegrationRepository.get(params);

      const { dynamoDB } = require('@/config/database');
      expect(dynamoDB.get).toHaveBeenCalledWith(params);
      expect(dynamoDB.get().promise).toHaveBeenCalled();
    });

    it('should call query method correctly', async () => {
      const params = { TableName: 'test', KeyConditionExpression: 'PK = :pk' };
      await MarketplaceIntegrationRepository.query(params);

      const { dynamoDB } = require('@/config/database');
      expect(dynamoDB.query).toHaveBeenCalledWith(params);
      expect(dynamoDB.query().promise).toHaveBeenCalled();
    });

    it('should call update method correctly', async () => {
      const params = { TableName: 'test', Key: {}, UpdateExpression: 'SET #field = :value' };
      await MarketplaceIntegrationRepository.update(params);

      const { dynamoDB } = require('@/config/database');
      expect(dynamoDB.update).toHaveBeenCalledWith(params);
      expect(dynamoDB.update().promise).toHaveBeenCalled();
    });

    it('should call delete method correctly', async () => {
      const params = { TableName: 'test', Key: {} };
      await MarketplaceIntegrationRepository.delete(params);

      const { dynamoDB } = require('@/config/database');
      expect(dynamoDB.delete).toHaveBeenCalledWith(params);
      expect(dynamoDB.delete().promise).toHaveBeenCalled();
    });

    it('should call scan method correctly', async () => {
      const params = { TableName: 'test' };
      await MarketplaceIntegrationRepository.scan(params);

      const { dynamoDB } = require('@/config/database');
      expect(dynamoDB.scan).toHaveBeenCalledWith(params);
      expect(dynamoDB.scan().promise).toHaveBeenCalled();
    });
  });
});
