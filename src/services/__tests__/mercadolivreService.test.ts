import axios from 'axios';
import { MarketplaceType } from '../../types/integration';
import { MercadoLivreService } from '../marketplaces/mercadolivreService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock environment variables
const originalEnv = process.env;

describe('MercadoLivreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      ML_CLIENT_ID: 'test-client-id',
      ML_CLIENT_SECRET: 'test-client-secret',
      ML_REDIRECT_URI: 'http://localhost:3000/callback',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getMarketplaceAuthInfo', () => {
    const mockCode = 'test-authorization-code';
    const mockAccessToken = 'test-access-token';
    const mockRefreshToken = 'test-refresh-token';
    const mockUserId = 'test-user-id';
    const mockNickname = 'test-store-name';

    it('should successfully get marketplace auth info', async () => {
      // Mock first API call (OAuth token)
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: mockAccessToken,
          refresh_token: mockRefreshToken,
          user_id: mockUserId,
        },
      });

      // Mock second API call (user info)
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          nickname: mockNickname,
        },
      });

      const result = await MercadoLivreService.getMarketplaceAuthInfo(mockCode);

      // Verify OAuth token request
      expect(mockedAxios.post).toHaveBeenCalledWith('https://api.mercadolibre.com/oauth/token', {
        grant_type: 'authorization_code',
        code: mockCode,
        client_id: undefined,
        client_secret: undefined,
        redirect_uri: undefined,
        code_verifier: '25a1106a6a207280d3a0d558a816cbdf6711e8860062a7b22fff838eef56e828',
      });

      // Verify user info request
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.mercadolibre.com/users/me', {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      });

      // Verify returned data
      expect(result).toEqual({
        marketplaceType: MarketplaceType.MERCADOLIVRE,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        sellerId: mockUserId,
        storeName: mockNickname,
      });
    });

    it('should throw error when OAuth token request fails', async () => {
      const errorMessage = 'Invalid authorization code';
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      await expect(MercadoLivreService.getMarketplaceAuthInfo(mockCode)).rejects.toThrow(
        errorMessage
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.mercadolibre.com/oauth/token',
        expect.objectContaining({
          code: mockCode,
        })
      );

      // Should not call the second API
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should throw error when user info request fails', async () => {
      const errorMessage = 'Invalid access token';

      // Mock successful OAuth token request
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: mockAccessToken,
          refresh_token: mockRefreshToken,
          user_id: mockUserId,
        },
      });

      // Mock failed user info request
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(MercadoLivreService.getMarketplaceAuthInfo(mockCode)).rejects.toThrow(
        errorMessage
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.mercadolibre.com/users/me', {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      });
    });

    it('should handle missing environment variables', async () => {
      // Remove environment variables
      delete process.env.ML_CLIENT_ID;
      delete process.env.ML_CLIENT_SECRET;
      delete process.env.ML_REDIRECT_URI;

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: mockAccessToken,
          refresh_token: mockRefreshToken,
          user_id: mockUserId,
        },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          nickname: mockNickname,
        },
      });

      const result = await MercadoLivreService.getMarketplaceAuthInfo(mockCode);

      // Should still work with undefined values
      expect(mockedAxios.post).toHaveBeenCalledWith('https://api.mercadolibre.com/oauth/token', {
        grant_type: 'authorization_code',
        code: mockCode,
        client_id: undefined,
        client_secret: undefined,
        redirect_uri: undefined,
        code_verifier: '25a1106a6a207280d3a0d558a816cbdf6711e8860062a7b22fff838eef56e828',
      });

      expect(result).toEqual({
        marketplaceType: MarketplaceType.MERCADOLIVRE,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        sellerId: mockUserId,
        storeName: mockNickname,
      });
    });

    it('should handle API response with missing fields', async () => {
      // Mock OAuth token response with missing fields
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: mockAccessToken,
          // Missing refresh_token and user_id
        },
      });

      // Mock user info response with missing nickname
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          // Missing nickname
        },
      });

      const result = await MercadoLivreService.getMarketplaceAuthInfo(mockCode);

      expect(result).toEqual({
        marketplaceType: MarketplaceType.MERCADOLIVRE,
        accessToken: mockAccessToken,
        refreshToken: undefined,
        sellerId: undefined,
        storeName: undefined,
      });
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';

      mockedAxios.post.mockRejectedValueOnce(timeoutError);

      await expect(MercadoLivreService.getMarketplaceAuthInfo(mockCode)).rejects.toThrow(
        'Network timeout'
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should handle HTTP error responses', async () => {
      const httpError = {
        response: {
          status: 400,
          data: {
            message: 'Bad Request',
            error: 'invalid_grant',
          },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(httpError);

      await expect(MercadoLivreService.getMarketplaceAuthInfo(mockCode)).rejects.toEqual(httpError);

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });
});
