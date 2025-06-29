import type {
  ICreateMarketplaceIntegration,
  IUpdateMarketplaceIntegration,
} from '../../models/MarketplaceIntegration';
import { MarketplaceIntegrationRepository } from '../../repositories/marketplaceIntegrationRepository';
import { IntegrationStatus, MarketplaceType } from '../../types/integration';
import { MarketplaceIntegrationService } from '../marketplaceIntegrationService';

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
}));

// Mock Repository
jest.mock('@/repositories/marketplaceIntegrationRepository', () => ({
  MarketplaceIntegrationRepository: {
    createMarketplaceIntegrationRecord: jest.fn(),
    getMarketplaceIntegrationById: jest.fn(),
    getMarketplaceIntegrationsByUserId: jest.fn(),
    getMarketplaceIntegrationsByType: jest.fn(),
    getMarketplaceIntegrationsByStatus: jest.fn(),
    getMarketplaceIntegrationByUserAndType: jest.fn(),
    scanMarketplaceIntegrations: jest.fn(),
    updateMarketplaceIntegrationRecord: jest.fn(),
    deleteMarketplaceIntegrationRecord: jest.fn(),
    put: jest.fn(),
    get: jest.fn(),
    query: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    scan: jest.fn(),
  },
}));

describe('MarketplaceIntegrationService', () => {
  const mockIntegration = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    marketplaceType: MarketplaceType.MERCADOLIVRE,
    accessToken: 'valid-access-token',
    refreshToken: 'valid-refresh-token',
    sellerId: 'seller123',
    storeName: 'Minha Loja',
    status: IntegrationStatus.PENDING,
    lastSyncAt: undefined,
    errorMessage: undefined,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockDynamoDBIntegration = {
    PK: 'USER#123e4567-e89b-12d3-a456-426614174001',
    SK: 'MARKETPLACE#mercadolivre#123e4567-e89b-12d3-a456-426614174000',
    ...mockIntegration,
    GSI1PK: 'MARKETPLACE#mercadolivre',
    GSI1SK: 'USER#123e4567-e89b-12d3-a456-426614174001#123e4567-e89b-12d3-a456-426614174000',
    GSI2PK: 'STATUS#pending',
    GSI2SK:
      'USER#123e4567-e89b-12d3-a456-426614174001#mercadolivre#123e4567-e89b-12d3-a456-426614174000',
  };

  const mockCreateData: ICreateMarketplaceIntegration = {
    marketplaceType: MarketplaceType.MERCADOLIVRE,
    accessToken: 'valid-access-token',
    refreshToken: 'valid-refresh-token',
    sellerId: 'seller123',
    storeName: 'Minha Loja',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createMarketplaceIntegration', () => {
    it('should create a new marketplace integration successfully', async () => {
      const mockParams = { TableName: 'test', Item: mockDynamoDBIntegration };
      (
        MarketplaceIntegrationRepository.createMarketplaceIntegrationRecord as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.put as jest.Mock).mockResolvedValue({});

      const userId = '123e4567-e89b-12d3-a456-426614174001';
      const result =
        await MarketplaceIntegrationService.createMarketplaceIntegration(mockCreateData, userId);

      expect(
        MarketplaceIntegrationRepository.createMarketplaceIntegrationRecord
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId,
          marketplaceType: mockCreateData.marketplaceType,
          accessToken: mockCreateData.accessToken,
          refreshToken: mockCreateData.refreshToken,
          sellerId: mockCreateData.sellerId,
          storeName: mockCreateData.storeName,
          status: IntegrationStatus.PENDING,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        })
      );

      expect(MarketplaceIntegrationRepository.put).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(mockIntegration);
    });

    it('should create integration with minimal required data', async () => {
      const minimalData = {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        marketplaceType: MarketplaceType.MERCADOLIVRE,
        accessToken: 'valid-access-token',
      };

      const mockParams = { TableName: 'test', Item: mockDynamoDBIntegration };
      (
        MarketplaceIntegrationRepository.createMarketplaceIntegrationRecord as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.put as jest.Mock).mockResolvedValue({});

      await MarketplaceIntegrationService.createMarketplaceIntegration(minimalData, '123e4567-e89b-12d3-a456-426614174001');

      expect(
        MarketplaceIntegrationRepository.createMarketplaceIntegrationRecord
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          refreshToken: undefined,
          sellerId: undefined,
          storeName: undefined,
        })
      );
    });
  });

  describe('getMarketplaceIntegrationById', () => {
    it('should return integration when found', async () => {
      const mockParams = { TableName: 'test', Key: {} };
      (MarketplaceIntegrationRepository.getMarketplaceIntegrationById as jest.Mock).mockReturnValue(
        mockParams
      );
      (MarketplaceIntegrationRepository.get as jest.Mock).mockResolvedValue({
        Item: mockDynamoDBIntegration,
      });

      const result = await MarketplaceIntegrationService.getMarketplaceIntegrationById('test-id');

      expect(MarketplaceIntegrationRepository.getMarketplaceIntegrationById).toHaveBeenCalledWith(
        'test-id'
      );
      expect(MarketplaceIntegrationRepository.get).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(mockIntegration);
    });

    it('should return null when integration not found', async () => {
      const mockParams = { TableName: 'test', Key: {} };
      (MarketplaceIntegrationRepository.getMarketplaceIntegrationById as jest.Mock).mockReturnValue(
        mockParams
      );
      (MarketplaceIntegrationRepository.get as jest.Mock).mockResolvedValue({
        Item: null,
      });

      const result = await MarketplaceIntegrationService.getMarketplaceIntegrationById('test-id');

      expect(result).toBeNull();
    });
  });

  describe('getMarketplaceIntegrationsByUserId', () => {
    it('should return integrations for user', async () => {
      const mockParams = {
        TableName: 'test',
        KeyConditionExpression: 'PK = :pk',
      };
      (
        MarketplaceIntegrationRepository.getMarketplaceIntegrationsByUserId as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.query as jest.Mock).mockResolvedValue({
        Items: [mockDynamoDBIntegration],
      });

      const result =
        await MarketplaceIntegrationService.getMarketplaceIntegrationsByUserId('user-id');

      expect(
        MarketplaceIntegrationRepository.getMarketplaceIntegrationsByUserId
      ).toHaveBeenCalledWith('user-id');
      expect(MarketplaceIntegrationRepository.query).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual([mockIntegration]);
    });

    it('should return empty array when no integrations found', async () => {
      const mockParams = {
        TableName: 'test',
        KeyConditionExpression: 'PK = :pk',
      };
      (
        MarketplaceIntegrationRepository.getMarketplaceIntegrationsByUserId as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.query as jest.Mock).mockResolvedValue({
        Items: [],
      });

      const result =
        await MarketplaceIntegrationService.getMarketplaceIntegrationsByUserId('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('getMarketplaceIntegrationsByType', () => {
    it('should return integrations for marketplace type', async () => {
      const mockParams = { TableName: 'test', IndexName: 'GSI1' };
      (
        MarketplaceIntegrationRepository.getMarketplaceIntegrationsByType as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.query as jest.Mock).mockResolvedValue({
        Items: [mockDynamoDBIntegration],
      });

      const result = await MarketplaceIntegrationService.getMarketplaceIntegrationsByType(
        MarketplaceType.MERCADOLIVRE
      );

      expect(
        MarketplaceIntegrationRepository.getMarketplaceIntegrationsByType
      ).toHaveBeenCalledWith(MarketplaceType.MERCADOLIVRE);
      expect(MarketplaceIntegrationRepository.query).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual([mockIntegration]);
    });
  });

  describe('getMarketplaceIntegrationsByStatus', () => {
    it('should return integrations for status', async () => {
      const mockParams = { TableName: 'test', IndexName: 'GSI2' };
      (
        MarketplaceIntegrationRepository.getMarketplaceIntegrationsByStatus as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.query as jest.Mock).mockResolvedValue({
        Items: [mockDynamoDBIntegration],
      });

      const result = await MarketplaceIntegrationService.getMarketplaceIntegrationsByStatus(
        IntegrationStatus.ACTIVE
      );

      expect(
        MarketplaceIntegrationRepository.getMarketplaceIntegrationsByStatus
      ).toHaveBeenCalledWith(IntegrationStatus.ACTIVE);
      expect(MarketplaceIntegrationRepository.query).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual([mockIntegration]);
    });
  });

  describe('getMarketplaceIntegrationByUserAndType', () => {
    it('should return integration when found', async () => {
      const mockParams = {
        TableName: 'test',
        KeyConditionExpression: 'PK = :pk',
      };
      (
        MarketplaceIntegrationRepository.getMarketplaceIntegrationByUserAndType as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.query as jest.Mock).mockResolvedValue({
        Items: [mockDynamoDBIntegration],
      });

      const result = await MarketplaceIntegrationService.getMarketplaceIntegrationByUserAndType(
        'user-id',
        MarketplaceType.MERCADOLIVRE
      );

      expect(
        MarketplaceIntegrationRepository.getMarketplaceIntegrationByUserAndType
      ).toHaveBeenCalledWith('user-id', MarketplaceType.MERCADOLIVRE);
      expect(MarketplaceIntegrationRepository.query).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(mockIntegration);
    });

    it('should return null when integration not found', async () => {
      const mockParams = {
        TableName: 'test',
        KeyConditionExpression: 'PK = :pk',
      };
      (
        MarketplaceIntegrationRepository.getMarketplaceIntegrationByUserAndType as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.query as jest.Mock).mockResolvedValue({
        Items: [],
      });

      const result = await MarketplaceIntegrationService.getMarketplaceIntegrationByUserAndType(
        'user-id',
        MarketplaceType.MERCADOLIVRE
      );

      expect(result).toBeNull();
    });
  });

  describe('listMarketplaceIntegrations', () => {
    it('should return paginated integrations', async () => {
      const mockParams = { TableName: 'test' };
      (MarketplaceIntegrationRepository.scanMarketplaceIntegrations as jest.Mock).mockReturnValue(
        mockParams
      );
      (MarketplaceIntegrationRepository.scan as jest.Mock).mockResolvedValue({
        Items: [mockDynamoDBIntegration],
        Count: 1,
      });

      const result = await MarketplaceIntegrationService.listMarketplaceIntegrations(1, 10);

      expect(MarketplaceIntegrationRepository.scanMarketplaceIntegrations).toHaveBeenCalledWith(10);
      expect(MarketplaceIntegrationRepository.scan).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual({
        items: [mockIntegration],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('updateMarketplaceIntegration', () => {
    it('should update integration successfully', async () => {
      const updates: IUpdateMarketplaceIntegration = {
        accessToken: 'new-access-token',
        status: IntegrationStatus.INACTIVE,
      };

      const mockParams = {
        TableName: 'test',
        UpdateExpression: 'SET #field = :value',
      };
      (
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.update as jest.Mock).mockResolvedValue({
        Attributes: mockDynamoDBIntegration,
      });

      const result = await MarketplaceIntegrationService.updateMarketplaceIntegration(
        'test-id',
        updates
      );

      expect(
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord
      ).toHaveBeenCalledWith('test-id', {
        ...updates,
        updatedAt: '2024-01-01T00:00:00.000Z',
        GSI2PK: 'STATUS#inactive',
      });
      expect(MarketplaceIntegrationRepository.update).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(mockIntegration);
    });

    it('should update GSI2PK when status is updated', async () => {
      const updates: IUpdateMarketplaceIntegration = {
        status: IntegrationStatus.ERROR,
      };

      const mockParams = {
        TableName: 'test',
        UpdateExpression: 'SET #field = :value',
      };
      (
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.update as jest.Mock).mockResolvedValue({
        Attributes: mockDynamoDBIntegration,
      });

      await MarketplaceIntegrationService.updateMarketplaceIntegration('test-id', updates);

      expect(
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord
      ).toHaveBeenCalledWith('test-id', {
        ...updates,
        updatedAt: '2024-01-01T00:00:00.000Z',
        GSI2PK: 'STATUS#error',
      });
    });
  });

  describe('deleteMarketplaceIntegration', () => {
    it('should delete integration successfully', async () => {
      const mockParams = { TableName: 'test', Key: {} };
      (
        MarketplaceIntegrationRepository.deleteMarketplaceIntegrationRecord as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.delete as jest.Mock).mockResolvedValue({});

      await MarketplaceIntegrationService.deleteMarketplaceIntegration(
        'user-id',
        MarketplaceType.MERCADOLIVRE,
        'integration-id'
      );

      expect(
        MarketplaceIntegrationRepository.deleteMarketplaceIntegrationRecord
      ).toHaveBeenCalledWith('user-id', MarketplaceType.MERCADOLIVRE, 'integration-id');
      expect(MarketplaceIntegrationRepository.delete).toHaveBeenCalledWith(mockParams);
    });
  });

  describe('updateIntegrationStatus', () => {
    it('should update status successfully', async () => {
      const mockParams = {
        TableName: 'test',
        UpdateExpression: 'SET #field = :value',
      };
      (
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.update as jest.Mock).mockResolvedValue({
        Attributes: mockDynamoDBIntegration,
      });

      const result = await MarketplaceIntegrationService.updateIntegrationStatus(
        'test-id',
        IntegrationStatus.ACTIVE,
        'Error message'
      );

      expect(
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord
      ).toHaveBeenCalledWith('test-id', {
        status: IntegrationStatus.ACTIVE,
        errorMessage: 'Error message',
        lastSyncAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        GSI2PK: 'STATUS#active',
      });
      expect(result).toEqual(mockIntegration);
    });

    it('should set lastSyncAt when status is ACTIVE', async () => {
      const mockParams = {
        TableName: 'test',
        UpdateExpression: 'SET #field = :value',
      };
      (
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.update as jest.Mock).mockResolvedValue({
        Attributes: mockDynamoDBIntegration,
      });

      await MarketplaceIntegrationService.updateIntegrationStatus(
        'test-id',
        IntegrationStatus.ACTIVE
      );

      expect(
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord
      ).toHaveBeenCalledWith('test-id', {
        status: IntegrationStatus.ACTIVE,
        errorMessage: undefined,
        lastSyncAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        GSI2PK: 'STATUS#active',
      });
    });

    it('should not set lastSyncAt when status is not ACTIVE', async () => {
      const mockParams = {
        TableName: 'test',
        UpdateExpression: 'SET #field = :value',
      };
      (
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.update as jest.Mock).mockResolvedValue({
        Attributes: mockDynamoDBIntegration,
      });

      await MarketplaceIntegrationService.updateIntegrationStatus(
        'test-id',
        IntegrationStatus.ERROR
      );

      expect(
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord
      ).toHaveBeenCalledWith('test-id', {
        status: IntegrationStatus.ERROR,
        errorMessage: undefined,
        lastSyncAt: undefined,
        updatedAt: '2024-01-01T00:00:00.000Z',
        GSI2PK: 'STATUS#error',
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const mockParams = {
        TableName: 'test',
        UpdateExpression: 'SET #field = :value',
      };
      (
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.update as jest.Mock).mockResolvedValue({
        Attributes: mockDynamoDBIntegration,
      });

      const result = await MarketplaceIntegrationService.refreshAccessToken(
        'test-id',
        'new-access-token',
        'new-refresh-token'
      );

      expect(
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord
      ).toHaveBeenCalledWith('test-id', {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result).toEqual(mockIntegration);
    });

    it('should handle refresh without new refresh token', async () => {
      const mockParams = {
        TableName: 'test',
        UpdateExpression: 'SET #field = :value',
      };
      (
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord as jest.Mock
      ).mockReturnValue(mockParams);
      (MarketplaceIntegrationRepository.update as jest.Mock).mockResolvedValue({
        Attributes: mockDynamoDBIntegration,
      });

      await MarketplaceIntegrationService.refreshAccessToken('test-id', 'new-access-token');

      expect(
        MarketplaceIntegrationRepository.updateMarketplaceIntegrationRecord
      ).toHaveBeenCalledWith('test-id', {
        accessToken: 'new-access-token',
        refreshToken: undefined,
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });
});
