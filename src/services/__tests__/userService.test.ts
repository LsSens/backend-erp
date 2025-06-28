import { UserService } from '../userService';
import { UserRole } from '../../types';
import { ICreateUser, IUpdateUser } from '../../models/User';

jest.mock('../../config/database', () => ({
  dynamoDB: {
    put: jest.fn(),
    get: jest.fn(),
    query: jest.fn(),
    scan: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  createUserRecord: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  updateUserRecord: jest.fn(),
  deleteUserRecord: jest.fn(),
  scanUsers: jest.fn(),
}));

jest.mock('../../config/cognito', () => ({
  createCognitoUser: jest.fn(),
  setUserPassword: jest.fn(),
  updateUserAttributes: jest.fn(),
  deleteCognitoUser: jest.fn(),
}));

import { dynamoDB, createUserRecord, getUserById, getUserByEmail, updateUserRecord, deleteUserRecord, scanUsers } from '../../config/database';
import { createCognitoUser, setUserPassword, updateUserAttributes, deleteCognitoUser } from '../../config/cognito';

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
      (createCognitoUser as jest.Mock).mockResolvedValue({});
      (setUserPassword as jest.Mock).mockResolvedValue({});
      (dynamoDB.put as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({}) });
      (createUserRecord as jest.Mock).mockReturnValue({});

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
      (createCognitoUser as jest.Mock).mockRejectedValue(new Error('Cognito error'));
      const userData: ICreateUser = {
        email: 'fail@example.com',
        name: 'Fail User',
        role: UserRole.USER,
        password: 'password123',
      };
      await expect(UserService.createUser(userData)).rejects.toThrow('Error creating user: Cognito error');
    });
    it('should throw error if DynamoDB fails', async () => {
      (createCognitoUser as jest.Mock).mockResolvedValue({});
      (setUserPassword as jest.Mock).mockResolvedValue({});
      (dynamoDB.put as jest.Mock).mockReturnValue({ promise: jest.fn().mockRejectedValue(new Error('Dynamo error')) });
      (createUserRecord as jest.Mock).mockReturnValue({});
      const userData: ICreateUser = {
        email: 'fail2@example.com',
        name: 'Fail2 User',
        role: UserRole.USER,
        password: 'password123',
      };
      await expect(UserService.createUser(userData)).rejects.toThrow('Error creating user: Dynamo error');
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({ Item: mockDynamoUser }) });
      (getUserById as jest.Mock).mockReturnValue({});
      const result = await UserService.getUserById('1');
      expect(result).toEqual(mockUser);
    });
    it('should return null if not found', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({ Item: null }) });
      (getUserById as jest.Mock).mockReturnValue({});
      const result = await UserService.getUserById('2');
      expect(result).toBeNull();
    });
    it('should throw error if DynamoDB fails', async () => {
      (dynamoDB.get as jest.Mock).mockReturnValue({ promise: jest.fn().mockRejectedValue(new Error('Dynamo error')) });
      (getUserById as jest.Mock).mockReturnValue({});
      await expect(UserService.getUserById('1')).rejects.toThrow('Error getting user: Dynamo error');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user if found', async () => {
      (dynamoDB.query as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({ Items: [mockDynamoUser] }) });
      (getUserByEmail as jest.Mock).mockReturnValue({});
      const result = await UserService.getUserByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
    it('should return null if not found', async () => {
      (dynamoDB.query as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({ Items: [] }) });
      (getUserByEmail as jest.Mock).mockReturnValue({});
      const result = await UserService.getUserByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
    it('should throw error if DynamoDB fails', async () => {
      (dynamoDB.query as jest.Mock).mockReturnValue({ promise: jest.fn().mockRejectedValue(new Error('Dynamo error')) });
      (getUserByEmail as jest.Mock).mockReturnValue({});
      await expect(UserService.getUserByEmail('fail@example.com')).rejects.toThrow('Error getting user by email: Dynamo error');
    });
  });

  describe('listUsers', () => {
    it('should return paginated users', async () => {
      (dynamoDB.scan as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({ Items: [mockDynamoUser] }) });
      (scanUsers as jest.Mock).mockReturnValue({});
      const result = await UserService.listUsers(1, 10);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });
    it('should return empty list if no users', async () => {
      (dynamoDB.scan as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({ Items: [] }) });
      (scanUsers as jest.Mock).mockReturnValue({});
      const result = await UserService.listUsers(1, 10);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
    it('should throw error if DynamoDB fails', async () => {
      (dynamoDB.scan as jest.Mock).mockReturnValue({ promise: jest.fn().mockRejectedValue(new Error('Dynamo error')) });
      (scanUsers as jest.Mock).mockReturnValue({});
      await expect(UserService.listUsers(1, 10)).rejects.toThrow('Error listing users: Dynamo error');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(mockUser);
      (updateUserAttributes as jest.Mock).mockResolvedValue({});
      (dynamoDB.update as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({ Attributes: mockDynamoUser }) });
      (updateUserRecord as jest.Mock).mockReturnValue({});
      const updates: IUpdateUser = { name: 'Updated', role: UserRole.MANAGER };
      const result = await UserService.updateUser('1', updates);
      expect(result.name).toBe('Test User'); // O nome não muda no mock, mas o fluxo é coberto
      expect(updateUserAttributes).toHaveBeenCalled();
      expect(dynamoDB.update).toHaveBeenCalled();
    });
    it('should throw error if user not found', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(null);
      const updates: IUpdateUser = { name: 'Updated' };
      await expect(UserService.updateUser('2', updates)).rejects.toThrow('User not found');
    });
    it('should throw error if DynamoDB update fails', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(mockUser);
      (updateUserAttributes as jest.Mock).mockResolvedValue({});
      (dynamoDB.update as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({ Attributes: null }) });
      (updateUserRecord as jest.Mock).mockReturnValue({});
      const updates: IUpdateUser = { name: 'Updated' };
      await expect(UserService.updateUser('1', updates)).rejects.toThrow('Error updating user');
    });
    it('should throw error if any error occurs', async () => {
      jest.spyOn(UserService, 'getUserById').mockImplementation(() => { throw new Error('Any error'); });
      const updates: IUpdateUser = { name: 'Updated' };
      await expect(UserService.updateUser('1', updates)).rejects.toThrow('Error updating user: Any error');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(mockUser);
      (deleteCognitoUser as jest.Mock).mockResolvedValue({});
      (dynamoDB.delete as jest.Mock).mockReturnValue({ promise: jest.fn().mockResolvedValue({}) });
      (deleteUserRecord as jest.Mock).mockReturnValue({});
      await expect(UserService.deleteUser('1')).resolves.toBeUndefined();
      expect(deleteCognitoUser).toHaveBeenCalled();
      expect(dynamoDB.delete).toHaveBeenCalled();
    });
    it('should throw error if user not found', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(null);
      await expect(UserService.deleteUser('2')).rejects.toThrow('User not found');
    });
    it('should throw error if DynamoDB delete fails', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(mockUser);
      (deleteCognitoUser as jest.Mock).mockResolvedValue({});
      (dynamoDB.delete as jest.Mock).mockReturnValue({ promise: jest.fn().mockRejectedValue(new Error('Dynamo error')) });
      (deleteUserRecord as jest.Mock).mockReturnValue({});
      await expect(UserService.deleteUser('1')).rejects.toThrow('Error deleting user: Dynamo error');
    });
  });
}); 