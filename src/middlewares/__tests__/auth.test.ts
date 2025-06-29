const mockShouldSkipAuth = jest.fn().mockReturnValue(false);
jest.mock('../auth', () => {
  const originalModule = jest.requireActual('../auth');
  return {
    ...originalModule,
    shouldSkipAuth: mockShouldSkipAuth,
  };
});

import type { NextFunction, Request, Response } from 'express';
import { UserRole } from '../../types/user';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

import jwt from 'jsonwebtoken';
import { authenticateToken, requireAdmin, requireManager, requireUser } from '../auth';

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
    mockShouldSkipAuth.mockReturnValue(false);
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

      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next with error when no authorization header', () => {
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when invalid token format', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when token verification fails', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('requireUser', () => {
    it('should allow access when user is authenticated', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        id: '123',
      };

      requireUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next with error when user not authenticated', () => {
      requireUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('requireManager', () => {
    it('should allow access when user has manager role', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.MANAGER,
        id: '123',
      };

      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access when user has admin role', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        id: '123',
      };

      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next with error when user has user role', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        id: '123',
      };

      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when user not authenticated', () => {
      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow access when user has admin role', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        id: '123',
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next with error when user has manager role', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.MANAGER,
        id: '123',
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when user has user role', () => {
      mockRequest.user = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        id: '123',
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when user not authenticated', () => {
      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
