import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../../types';
import { UserRole } from '../../types/user';
import { generateToken, hasPermission, verifyToken } from '../jwt';

// Mock JWT
jest.mock('jsonwebtoken');

const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('JWT Utils', () => {
  const mockUser: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: '123',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
  };

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate token successfully', () => {
      const mockToken = 'mock.jwt.token';
      mockJwt.sign.mockReturnValue(mockToken as any);

      const result = generateToken(mockUser);

      expect(result).toBe(mockToken);
      expect(mockJwt.sign).toHaveBeenCalledWith(mockUser, 'test-secret-key', {
        expiresIn: '24h',
      });
    });

    it('should throw error when JWT sign fails', () => {
      mockJwt.sign.mockImplementation(() => {
        throw new Error('JWT sign error');
      });

      expect(() => generateToken(mockUser)).toThrow('JWT sign error');
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', () => {
      const mockToken = 'mock.jwt.token';
      const mockPayload: JwtPayload = {
        ...mockUser,
        iat: 1234567890,
        exp: 1234567890,
      };
      mockJwt.verify.mockReturnValue(mockPayload as any);

      const result = verifyToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(mockJwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret-key');
    });

    it('should throw error when JWT verify fails', () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('JWT verify error');
      });

      expect(() => verifyToken('invalid-token')).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      mockJwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      expect(() => verifyToken('expired-token')).toThrow('Invalid token');
    });

    it('should throw error for malformed token', () => {
      const malformedError = new Error('jwt malformed');
      malformedError.name = 'JsonWebTokenError';
      mockJwt.verify.mockImplementation(() => {
        throw malformedError;
      });

      expect(() => verifyToken('malformed-token')).toThrow('Invalid token');
    });
  });

  describe('hasPermission', () => {
    it('should return true when user role is higher than required role', () => {
      expect(hasPermission(UserRole.ADMIN, UserRole.USER)).toBe(true);
      expect(hasPermission(UserRole.ADMIN, UserRole.MANAGER)).toBe(true);
      expect(hasPermission(UserRole.MANAGER, UserRole.USER)).toBe(true);
    });

    it('should return true when user role equals required role', () => {
      expect(hasPermission(UserRole.ADMIN, UserRole.ADMIN)).toBe(true);
      expect(hasPermission(UserRole.MANAGER, UserRole.MANAGER)).toBe(true);
      expect(hasPermission(UserRole.USER, UserRole.USER)).toBe(true);
    });

    it('should return false when user role is lower than required role', () => {
      expect(hasPermission(UserRole.USER, UserRole.MANAGER)).toBe(false);
      expect(hasPermission(UserRole.USER, UserRole.ADMIN)).toBe(false);
      expect(hasPermission(UserRole.MANAGER, UserRole.ADMIN)).toBe(false);
    });

    it('should handle role hierarchy correctly', () => {
      // Admin can access everything
      expect(hasPermission(UserRole.ADMIN, UserRole.ADMIN)).toBe(true);
      expect(hasPermission(UserRole.ADMIN, UserRole.MANAGER)).toBe(true);
      expect(hasPermission(UserRole.ADMIN, UserRole.USER)).toBe(true);

      // Manager can access manager and user levels
      expect(hasPermission(UserRole.MANAGER, UserRole.ADMIN)).toBe(false);
      expect(hasPermission(UserRole.MANAGER, UserRole.MANAGER)).toBe(true);
      expect(hasPermission(UserRole.MANAGER, UserRole.USER)).toBe(true);

      // User can only access user level
      expect(hasPermission(UserRole.USER, UserRole.ADMIN)).toBe(false);
      expect(hasPermission(UserRole.USER, UserRole.MANAGER)).toBe(false);
      expect(hasPermission(UserRole.USER, UserRole.USER)).toBe(true);
    });
  });
});
