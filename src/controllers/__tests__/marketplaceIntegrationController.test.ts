import type { Request, Response } from 'express';
import { createError } from '../../middlewares/errorHandler';
import { MarketplaceIntegrationService } from '../../services/marketplaceIntegrationService';
import { IntegrationStatus, MarketplaceType } from '../../types/integration';
import { MarketplaceIntegrationController } from '../marketplaceIntegrationController';
import { UserRole } from '../../types/user';

// Mock Service
jest.mock('@/services/marketplaceIntegrationService', () => ({
  MarketplaceIntegrationService: {
    listMarketplaceIntegrations: jest.fn(),
    getMarketplaceIntegrationById: jest.fn(),
    getMarketplaceIntegrationsByUserId: jest.fn(),
    getMarketplaceIntegrationsByType: jest.fn(),
    createMarketplaceIntegration: jest.fn(),
    updateMarketplaceIntegration: jest.fn(),
    deleteMarketplaceIntegration: jest.fn(),
    updateIntegrationStatus: jest.fn(),
    refreshAccessToken: jest.fn(),
  },
}));

// Mock Error Handler
jest.mock('@/middlewares/errorHandler', () => ({
  createError: jest.fn(),
}));

describe('MarketplaceIntegrationController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  const mockIntegration = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    marketplaceType: MarketplaceType.MERCADOLIVRE,
    accessToken: 'valid-access-token',
    refreshToken: 'valid-refresh-token',
    sellerId: 'seller123',
    storeName: 'Minha Loja',
    status: IntegrationStatus.ACTIVE,
    lastSyncAt: '2024-01-01T00:00:00.000Z',
    errorMessage: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('listMarketplaceIntegrations', () => {
    it('should list marketplace integrations successfully', async () => {
      const mockPaginatedResponse = {
        items: [mockIntegration],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      (MarketplaceIntegrationService.listMarketplaceIntegrations as jest.Mock).mockResolvedValue(
        mockPaginatedResponse
      );
      mockRequest.query = { page: '1', limit: '10' };

      await MarketplaceIntegrationController.listMarketplaceIntegrations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(MarketplaceIntegrationService.listMarketplaceIntegrations).toHaveBeenCalledWith(1, 10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPaginatedResponse,
        message: 'Marketplace integrations listed successfully',
      });
    });

    it('should use default pagination when query params are not provided', async () => {
      const mockPaginatedResponse = {
        items: [mockIntegration],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      (MarketplaceIntegrationService.listMarketplaceIntegrations as jest.Mock).mockResolvedValue(
        mockPaginatedResponse
      );

      await MarketplaceIntegrationController.listMarketplaceIntegrations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(MarketplaceIntegrationService.listMarketplaceIntegrations).toHaveBeenCalledWith(1, 10);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      (MarketplaceIntegrationService.listMarketplaceIntegrations as jest.Mock).mockRejectedValue(
        error
      );
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.listMarketplaceIntegrations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getMarketplaceIntegrationById', () => {
    it('should get marketplace integration by ID successfully', async () => {
      (MarketplaceIntegrationService.getMarketplaceIntegrationById as jest.Mock).mockResolvedValue(
        mockIntegration
      );
      mockRequest.params = { id: 'test-id' };

      await MarketplaceIntegrationController.getMarketplaceIntegrationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(MarketplaceIntegrationService.getMarketplaceIntegrationById).toHaveBeenCalledWith(
        'test-id'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockIntegration,
        message: 'Marketplace integration found successfully',
      });
    });

    it('should return 400 when ID is not provided', async () => {
      const error = new Error('Marketplace integration ID not provided');
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.getMarketplaceIntegrationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should return 404 when integration not found', async () => {
      (MarketplaceIntegrationService.getMarketplaceIntegrationById as jest.Mock).mockResolvedValue(
        null
      );
      mockRequest.params = { id: 'test-id' };

      const error = new Error('Marketplace integration not found');
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.getMarketplaceIntegrationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getMarketplaceIntegrationsByUserId', () => {
    it('should get marketplace integrations by user ID successfully', async () => {
      (
        MarketplaceIntegrationService.getMarketplaceIntegrationsByUserId as jest.Mock
      ).mockResolvedValue([mockIntegration]);
      mockRequest.params = { userId: 'user-id' };

      await MarketplaceIntegrationController.getMarketplaceIntegrationsByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(MarketplaceIntegrationService.getMarketplaceIntegrationsByUserId).toHaveBeenCalledWith(
        'user-id'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockIntegration],
        message: 'User marketplace integrations found successfully',
      });
    });

    it('should return 400 when user ID is not provided', async () => {
      const error = new Error('User ID not provided');
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.getMarketplaceIntegrationsByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getMarketplaceIntegrationsByType', () => {
    it('should get marketplace integrations by type successfully', async () => {
      (
        MarketplaceIntegrationService.getMarketplaceIntegrationsByType as jest.Mock
      ).mockResolvedValue([mockIntegration]);
      mockRequest.params = { marketplaceType: MarketplaceType.MERCADOLIVRE };

      await MarketplaceIntegrationController.getMarketplaceIntegrationsByType(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(MarketplaceIntegrationService.getMarketplaceIntegrationsByType).toHaveBeenCalledWith(
        MarketplaceType.MERCADOLIVRE
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockIntegration],
        message: 'Marketplace integrations by type found successfully',
      });
    });

    it('should return 400 when marketplace type is not provided', async () => {
      const error = new Error('Marketplace type not provided');
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.getMarketplaceIntegrationsByType(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createMarketplaceIntegration', () => {
    it('should create marketplace integration successfully', async () => {
      const createData = {
        marketplaceType: MarketplaceType.MERCADOLIVRE,
        accessToken: 'access-token',
      };

      (MarketplaceIntegrationService.createMarketplaceIntegration as jest.Mock).mockResolvedValue(
        mockIntegration
      );
      mockRequest.body = createData;
      (mockRequest as any).user = {
        id: '123',
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
      };
      await MarketplaceIntegrationController.createMarketplaceIntegration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(MarketplaceIntegrationService.createMarketplaceIntegration).toHaveBeenCalledWith(
        createData,
        '123'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockIntegration,
        message: 'Marketplace integration created successfully',
      });
    });
  });

  describe('updateMarketplaceIntegration', () => {
    it('should update marketplace integration successfully', async () => {
      const updateData = {
        accessToken: 'new-access-token',
        status: IntegrationStatus.INACTIVE,
      };

      (MarketplaceIntegrationService.updateMarketplaceIntegration as jest.Mock).mockResolvedValue(
        mockIntegration
      );
      mockRequest.params = { id: 'test-id' };
      mockRequest.body = updateData;

      await MarketplaceIntegrationController.updateMarketplaceIntegration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(MarketplaceIntegrationService.updateMarketplaceIntegration).toHaveBeenCalledWith(
        'test-id',
        updateData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockIntegration,
        message: 'Marketplace integration updated successfully',
      });
    });

    it('should return 400 when ID is not provided', async () => {
      const error = new Error('Marketplace integration ID not provided');
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.updateMarketplaceIntegration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteMarketplaceIntegration', () => {
    it('should delete marketplace integration successfully', async () => {
      (MarketplaceIntegrationService.deleteMarketplaceIntegration as jest.Mock).mockResolvedValue(
        undefined
      );
      mockRequest.params = {
        userId: 'user-id',
        marketplaceType: MarketplaceType.MERCADOLIVRE,
        id: 'integration-id',
      };

      await MarketplaceIntegrationController.deleteMarketplaceIntegration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(MarketplaceIntegrationService.deleteMarketplaceIntegration).toHaveBeenCalledWith(
        'user-id',
        MarketplaceType.MERCADOLIVRE,
        'integration-id'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Marketplace integration deleted successfully',
      });
    });

    it('should return 400 when required params are missing', async () => {
      const error = new Error('User ID, marketplace type, or integration ID not provided');
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.deleteMarketplaceIntegration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateIntegrationStatus', () => {
    it('should update integration status successfully', async () => {
      const statusData = {
        status: IntegrationStatus.ACTIVE,
        errorMessage: 'Error message',
      };

      (MarketplaceIntegrationService.updateIntegrationStatus as jest.Mock).mockResolvedValue(
        mockIntegration
      );
      mockRequest.params = { id: 'test-id' };
      mockRequest.body = statusData;

      await MarketplaceIntegrationController.updateIntegrationStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(MarketplaceIntegrationService.updateIntegrationStatus).toHaveBeenCalledWith(
        'test-id',
        IntegrationStatus.ACTIVE,
        'Error message'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockIntegration,
        message: 'Integration status updated successfully',
      });
    });

    it('should return 400 when ID is not provided', async () => {
      const error = new Error('Marketplace integration ID not provided');
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.updateIntegrationStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should return 400 when status is not provided', async () => {
      mockRequest.params = { id: 'test-id' };
      const error = new Error('Status not provided');
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.updateIntegrationStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const tokenData = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (MarketplaceIntegrationService.refreshAccessToken as jest.Mock).mockResolvedValue(
        mockIntegration
      );
      mockRequest.params = { id: 'test-id' };
      mockRequest.body = tokenData;

      await MarketplaceIntegrationController.refreshAccessToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(MarketplaceIntegrationService.refreshAccessToken).toHaveBeenCalledWith(
        'test-id',
        'new-access-token',
        'new-refresh-token'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockIntegration,
        message: 'Access token refreshed successfully',
      });
    });

    it('should return 400 when ID is not provided', async () => {
      const error = new Error('Marketplace integration ID not provided');
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.refreshAccessToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should return 400 when access token is not provided', async () => {
      mockRequest.params = { id: 'test-id' };
      const error = new Error('Access token not provided');
      (createError as jest.Mock).mockReturnValue(error);

      await MarketplaceIntegrationController.refreshAccessToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
