// Mock AWS SDK
const mockCognito = {
  adminCreateUser: jest.fn(),
  adminSetUserPassword: jest.fn(),
  adminUpdateUserAttributes: jest.fn(),
  adminDeleteUser: jest.fn(),
};

jest.mock('aws-sdk', () => ({
  CognitoIdentityServiceProvider: jest.fn().mockImplementation(() => mockCognito),
}));

import { UserRole } from '../../types/user';
import {
  authenticateUser,
  COGNITO_CONFIG,
  cognitoIdentityServiceProvider,
  createCognitoUser,
  deleteCognitoUser,
  extractUserAttributes,
  getUserAttributes,
  setUserPassword,
  updateUserAttributes,
} from '../cognito';

describe('Cognito Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    // Reset mocks to default success behavior
    mockCognito.adminCreateUser.mockReturnValue({
      promise: jest.fn().mockResolvedValue({ User: { Username: 'test-user' } }),
    });
    mockCognito.adminSetUserPassword.mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    });
    mockCognito.adminUpdateUserAttributes.mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    });
    mockCognito.adminDeleteUser.mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('COGNITO_CONFIG', () => {
    it('should use environment variables when available', () => {
      process.env.COGNITO_USER_POOL_ID = 'test-user-pool';
      process.env.COGNITO_CLIENT_ID = 'test-client-id';
      process.env.COGNITO_CLIENT_SECRET = 'test-client-secret';

      // Re-import to test environment configuration
      jest.resetModules();
      const { COGNITO_CONFIG: config } = require('../cognito');

      expect(config.UserPoolId).toBe('test-user-pool');
      expect(config.ClientId).toBe('test-client-id');
      expect(config.ClientSecret).toBe('test-client-secret');
    });

    it('should use empty strings when environment variables are not available', () => {
      delete process.env.COGNITO_USER_POOL_ID;
      delete process.env.COGNITO_CLIENT_ID;
      delete process.env.COGNITO_CLIENT_SECRET;

      // Re-import to test default configuration
      jest.resetModules();
      const { COGNITO_CONFIG: config } = require('../cognito');

      expect(config.UserPoolId).toBe('');
      expect(config.ClientId).toBe('');
      expect(config.ClientSecret).toBe('');
    });
  });

  describe('createCognitoUser', () => {
    it('should create user successfully', async () => {
      const result = await createCognitoUser('test@example.com', 'password123', {
        email: 'test@example.com',
        name: 'Test User',
        'custom:role': UserRole.USER,
        email_verified: 'true',
      });

      expect(result).toBeDefined();
    });

    it('should handle errors', async () => {
      mockCognito.adminCreateUser.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Cognito error')),
      });

      await expect(
        createCognitoUser('test@example.com', 'password123', {
          email: 'test@example.com',
          name: 'Test User',
          'custom:role': UserRole.USER,
          email_verified: 'true',
        })
      ).rejects.toThrow('Cognito error');
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with correct parameters', async () => {
      const mockPromise = jest.fn().mockResolvedValue({});
      const mockAdminInitiateAuth = jest.fn().mockReturnValue({ promise: mockPromise });

      (cognitoIdentityServiceProvider.adminInitiateAuth as jest.Mock) = mockAdminInitiateAuth;

      const email = 'test@example.com';
      const password = 'password123';

      await authenticateUser(email, password);

      expect(mockAdminInitiateAuth).toHaveBeenCalledWith({
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        UserPoolId: COGNITO_CONFIG.UserPoolId,
        ClientId: COGNITO_CONFIG.ClientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });
      expect(mockPromise).toHaveBeenCalled();
    });
  });

  describe('getUserAttributes', () => {
    it('should get user attributes with correct parameters', async () => {
      const mockPromise = jest.fn().mockResolvedValue({});
      const mockAdminGetUser = jest.fn().mockReturnValue({ promise: mockPromise });

      (cognitoIdentityServiceProvider.adminGetUser as jest.Mock) = mockAdminGetUser;

      const username = 'test@example.com';

      await getUserAttributes(username);

      expect(mockAdminGetUser).toHaveBeenCalledWith({
        UserPoolId: COGNITO_CONFIG.UserPoolId,
        Username: username,
      });
      expect(mockPromise).toHaveBeenCalled();
    });
  });

  describe('updateUserAttributes', () => {
    it('should update attributes successfully', async () => {
      const result = await updateUserAttributes('test@example.com', {
        name: 'Updated Name',
        'custom:role': UserRole.MANAGER,
      });

      expect(result).toBeDefined();
    });

    it('should handle errors', async () => {
      mockCognito.adminUpdateUserAttributes.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Update error')),
      });

      await expect(
        updateUserAttributes('test@example.com', {
          name: 'Updated Name',
          'custom:role': UserRole.MANAGER,
        })
      ).rejects.toThrow('Update error');
    });
  });

  describe('deleteCognitoUser', () => {
    it('should delete user successfully', async () => {
      const result = await deleteCognitoUser('test@example.com');

      expect(result).toBeDefined();
    });

    it('should handle errors', async () => {
      mockCognito.adminDeleteUser.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Delete error')),
      });

      await expect(deleteCognitoUser('test@example.com')).rejects.toThrow('Delete error');
    });
  });

  describe('setUserPassword', () => {
    it('should set password successfully', async () => {
      const result = await setUserPassword('test@example.com', 'newpassword123', true);

      expect(result).toBeDefined();
    });

    it('should handle errors', async () => {
      mockCognito.adminSetUserPassword.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Password error')),
      });

      await expect(setUserPassword('test@example.com', 'newpassword123', true)).rejects.toThrow(
        'Password error'
      );
    });
  });

  describe('extractUserAttributes', () => {
    it('should extract user attributes correctly', () => {
      const cognitoUser = {
        UserAttributes: [
          { Name: 'sub', Value: '123' },
          { Name: 'email', Value: 'test@example.com' },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'name', Value: 'Test User' },
          { Name: 'custom:role', Value: UserRole.ADMIN },
        ],
      };

      const result = extractUserAttributes(cognitoUser);

      expect(result).toEqual({
        sub: '123',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
        role: UserRole.ADMIN,
      });
    });

    it('should handle missing attributes with default values', () => {
      const cognitoUser = {
        UserAttributes: [
          { Name: 'sub', Value: '123' },
          { Name: 'email', Value: 'test@example.com' },
        ],
      };

      const result = extractUserAttributes(cognitoUser);

      expect(result).toEqual({
        sub: '123',
        email: 'test@example.com',
        email_verified: false,
        name: '',
        role: UserRole.USER,
      });
    });

    it('should handle empty UserAttributes array', () => {
      const cognitoUser = {
        UserAttributes: [],
      };

      const result = extractUserAttributes(cognitoUser);

      expect(result).toEqual({
        sub: '',
        email: '',
        email_verified: false,
        name: '',
        role: UserRole.USER,
      });
    });

    it('should handle missing UserAttributes property', () => {
      const cognitoUser = {};

      const result = extractUserAttributes(cognitoUser);

      expect(result).toEqual({
        sub: '',
        email: '',
        email_verified: false,
        name: '',
        role: UserRole.USER,
      });
    });
  });
});
