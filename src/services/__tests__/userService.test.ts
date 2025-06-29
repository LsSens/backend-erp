import type { ICreateUser, IUpdateUser } from '../../models/User';
import { UserRole } from '../../types/user';
import { UserService } from '../userService';

jest.mock('../../config/database', () => ({
  dynamoDB: {
    put: jest.fn(),
    get: jest.fn(),
    query: jest.fn(),
    scan: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../config/cognito', () => ({
  createCognitoUser: jest.fn(),
  setUserPassword: jest.fn(),
  updateUserAttributes: jest.fn(),
  deleteCognitoUser: jest.fn(),
}));

import {
  createCognitoUser,
  deleteCognitoUser,
  setUserPassword,
  updateUserAttributes,
} from '../../config/cognito';
import { dynamoDB } from '../../config/database';

describe('UserService', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };
  const mockDynamoUser = {
    PK: 'USER#1',
    SK: 'USER#1',
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    GSI1PK: 'EMAIL#test@example.com',
    GSI1SK: 'USER#1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      (dynamoDB.query as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Items: [] }),
      });

      (createCognitoUser as jest.Mock).mockResolvedValue({});
      (setUserPassword as jest.Mock).mockResolvedValue({});
      (dynamoDB.put as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({}) });

      const userData: ICreateUser = {
        email: 'new@example.com',
        name: 'New User',
        role: UserRole.USER,
        password: 'password123',
      };

      const result = await UserService.createUser(userData);
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(result.role).toBe(userData.role);
      expect(result.isActive).toBe(true);
      expect(createCognitoUser).toHaveBeenCalled();
      expect(setUserPassword).toHaveBeenCalled();
      expect(dynamoDB.put).toHaveBeenCalled();
    });
    it('should throw error if Cognito fails', async () => {
      (dynamoDB.query as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Items: [] }),
      });

      (createCognitoUser as jest.Mock).mockRejectedValue(new Error('Cognito error'));
      const userData: ICreateUser = {
        email: 'fail@example.com',
        name: 'Fail User',
        role: UserRole.USER,
        password: 'password123',
      };
      await expect(UserService.createUser(userData)).rejects.toThrow(
        'Error creating user: Cognito error'
      );
    });
    it('should throw error if DynamoDB fails', async () => {
      (dynamoDB.query as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Items: [] }),
      });

      (createCognitoUser as jest.Mock).mockResolvedValue({});
      (setUserPassword as jest.Mock).mockResolvedValue({});
      (dynamoDB.put as jest.Mock).mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Dynamo error')),
      });
      const userData: ICreateUser = {
        email: 'fail2@example.com',
        name: 'Fail2 User',
        role: UserRole.USER,
        password: 'password123',
      };
      await expect(UserService.createUser(userData)).rejects.toThrow(
        'Error creating user: Dynamo error'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Item: mockDynamoUser }),
      });
      const result = await UserService.getUserById('1');
      expect(result).toEqual(mockUser);
    });
    it('should return null if not found', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Item: null }),
      });
      const result = await UserService.getUserById('2');
      expect(result).toBeNull();
    });
    it('should throw error if DynamoDB fails', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Dynamo error')),
      });
      await expect(UserService.getUserById('1')).rejects.toThrow(
        'Error getting user: Dynamo error'
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return user if found', async () => {
      (dynamoDB.query as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Items: [mockDynamoUser] }),
      });
      const result = await UserService.getUserByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
    it('should return null if not found', async () => {
      (dynamoDB.query as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Items: [] }),
      });
      const result = await UserService.getUserByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
    it('should throw error if DynamoDB fails', async () => {
      (dynamoDB.query as jest.Mock).mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Dynamo error')),
      });
      await expect(UserService.getUserByEmail('fail@example.com')).rejects.toThrow(
        'Error getting user by email: Dynamo error'
      );
    });
  });

  describe('listUsers', () => {
    it('should return paginated users', async () => {
      (dynamoDB.scan as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Items: [mockDynamoUser] }),
      });
      const result = await UserService.listUsers(1, 10);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });
    it('should return empty list if no users', async () => {
      (dynamoDB.scan as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Items: [] }),
      });
      const result = await UserService.listUsers(1, 10);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(0);
    });
    it('should throw error if DynamoDB fails', async () => {
      (dynamoDB.scan as jest.Mock).mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Dynamo error')),
      });
      await expect(UserService.listUsers(1, 10)).rejects.toThrow(
        'Error listing users: Dynamo error'
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Item: mockDynamoUser }),
      });

      (dynamoDB.update as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Attributes: mockDynamoUser }),
      });
      (updateUserAttributes as jest.Mock).mockResolvedValue({});

      const updates: IUpdateUser = {
        name: 'Updated Name',
        role: UserRole.MANAGER,
      };

      const result = await UserService.updateUser('1', updates);
      expect(result).toEqual(mockUser);
      expect(dynamoDB.update).toHaveBeenCalled();
      expect(updateUserAttributes).toHaveBeenCalled();
    });
    it('should throw error if DynamoDB fails', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Item: mockDynamoUser }),
      });

      (dynamoDB.update as jest.Mock).mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Dynamo error')),
      });

      const updates: IUpdateUser = {
        name: 'Updated Name',
      };

      await expect(UserService.updateUser('1', updates)).rejects.toThrow(
        'Error updating user: Dynamo error'
      );
    });
    it('should throw error if Cognito fails', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Item: mockDynamoUser }),
      });

      (dynamoDB.update as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Attributes: mockDynamoUser }),
      });
      (updateUserAttributes as jest.Mock).mockRejectedValue(new Error('Cognito error'));

      const updates: IUpdateUser = {
        name: 'Updated Name',
        role: UserRole.MANAGER,
      };

      await expect(UserService.updateUser('1', updates)).rejects.toThrow(
        'Error updating user: Cognito error'
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Item: mockDynamoUser }),
      });

      (dynamoDB.delete as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      });
      (deleteCognitoUser as jest.Mock).mockResolvedValue({});

      await UserService.deleteUser('1');
      expect(dynamoDB.delete).toHaveBeenCalled();
      expect(deleteCognitoUser).toHaveBeenCalled();
    });
    it('should throw error if DynamoDB fails', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Item: mockDynamoUser }),
      });

      (dynamoDB.delete as jest.Mock).mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Dynamo error')),
      });

      await expect(UserService.deleteUser('1')).rejects.toThrow(
        'Error deleting user: Dynamo error'
      );
    });
    it('should throw error if Cognito fails', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Item: mockDynamoUser }),
      });

      (dynamoDB.delete as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      });
      (deleteCognitoUser as jest.Mock).mockRejectedValue(new Error('Cognito error'));

      await expect(UserService.deleteUser('1')).rejects.toThrow(
        'Error deleting user: Cognito error'
      );
    });
  });
});
