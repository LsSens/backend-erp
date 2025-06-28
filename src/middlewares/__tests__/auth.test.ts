import { Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole, requireAdmin, requireManager, requireUser } from '../auth';
import { UserRole } from '../../types';
import { verifyToken, hasPermission, extractTokenFromHeader } from '../../utils/jwt';

// Mock JWT utils
jest.mock('../../utils/jwt');

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockHasPermission = hasPermission as jest.MockedFunction<typeof hasPermission>;
const mockExtractTokenFromHeader = extractTokenFromHeader as jest.MockedFunction<typeof extractTokenFromHeader>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const mockUser = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        iat: 1234567890,
        exp: 1234567890,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };
      mockExtractTokenFromHeader.mockReturnValue('valid-token');
      mockVerifyToken.mockReturnValue(mockUser);

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockExtractTokenFromHeader).toHaveBeenCalledWith('Bearer valid-token');
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no authorization header', () => {
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication token not provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when invalid token format', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      mockExtractTokenFromHeader.mockImplementation(() => {
        throw new Error('Token not provided or invalid format');
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token verification fails', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };
      mockExtractTokenFromHeader.mockReturnValue('invalid-token');
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow access when user has required role', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
      };
      mockHasPermission.mockReturnValue(true);

      const middleware = requireRole(UserRole.USER);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHasPermission).toHaveBeenCalledWith(UserRole.ADMIN, UserRole.USER);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access when user lacks required role', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
      };
      mockHasPermission.mockReturnValue(false);

      const middleware = requireRole(UserRole.ADMIN);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user not authenticated', () => {
      const middleware = requireRole(UserRole.USER);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not authenticated',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('role-specific middlewares', () => {
    it('should create requireAdmin middleware', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
      };
      mockHasPermission.mockReturnValue(true);

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHasPermission).toHaveBeenCalledWith(UserRole.ADMIN, UserRole.ADMIN);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should create requireManager middleware', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.MANAGER,
      };
      mockHasPermission.mockReturnValue(true);

      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHasPermission).toHaveBeenCalledWith(UserRole.MANAGER, UserRole.MANAGER);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should create requireUser middleware', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
      };
      mockHasPermission.mockReturnValue(true);

      requireUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHasPermission).toHaveBeenCalledWith(UserRole.USER, UserRole.USER);
      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 