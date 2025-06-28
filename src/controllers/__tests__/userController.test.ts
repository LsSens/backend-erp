import type { Request, Response } from 'express';
import { UserService } from '../../services/userService';
import { UserRole } from '../../types';
import { UserController } from '../userController';

// Mock UserService
jest.mock('../../services/userService');

const _mockUserService = UserService as jest.Mocked<typeof UserService>;

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe('UserController', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should return users successfully', async () => {
      (UserService.listUsers as jest.Mock).mockResolvedValue({
        items: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      const req = { query: { page: '1', limit: '10' } } as unknown as Request;
      const res = mockResponse();
      await UserController.listUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
    it('should handle errors', async () => {
      (UserService.listUsers as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = { query: {} } as unknown as Request;
      const res = mockResponse();
      await UserController.listUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'DB error' })
      );
    });
  });

  describe('getUserById', () => {
    it('should return user successfully', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      const req = { params: { id: '1' } } as unknown as Request;
      const res = mockResponse();
      await UserController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockUser })
      );
    });
    it('should return 400 if id not provided', async () => {
      const req = { params: {} } as unknown as Request;
      const res = mockResponse();
      await UserController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'User ID not provided' })
      );
    });
    it('should return 404 if user not found', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(null);
      const req = { params: { id: '2' } } as unknown as Request;
      const res = mockResponse();
      await UserController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'User not found' })
      );
    });
    it('should handle errors', async () => {
      (UserService.getUserById as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = { params: { id: '1' } } as unknown as Request;
      const res = mockResponse();
      await UserController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'DB error' })
      );
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      (UserService.createUser as jest.Mock).mockResolvedValue(mockUser);
      const req = { body: mockUser } as unknown as Request;
      const res = mockResponse();
      await UserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockUser })
      );
    });
    it('should handle errors', async () => {
      (UserService.createUser as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = { body: mockUser } as unknown as Request;
      const res = mockResponse();
      await UserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'DB error' })
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      (UserService.updateUser as jest.Mock).mockResolvedValue(mockUser);
      const req = { params: { id: '1' }, body: { name: 'Updated' } } as unknown as Request;
      const res = mockResponse();
      await UserController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockUser })
      );
    });
    it('should return 400 if id not provided', async () => {
      const req = { params: {}, body: {} } as unknown as Request;
      const res = mockResponse();
      await UserController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'User ID not provided' })
      );
    });
    it('should handle errors', async () => {
      (UserService.updateUser as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = { params: { id: '1' }, body: { name: 'Updated' } } as unknown as Request;
      const res = mockResponse();
      await UserController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'DB error' })
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      (UserService.deleteUser as jest.Mock).mockResolvedValue(undefined);
      const req = { params: { id: '1' } } as unknown as Request;
      const res = mockResponse();
      await UserController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
    it('should return 400 if id not provided', async () => {
      const req = { params: {} } as unknown as Request;
      const res = mockResponse();
      await UserController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'User ID not provided' })
      );
    });
    it('should handle errors', async () => {
      (UserService.deleteUser as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = { params: { id: '1' } } as unknown as Request;
      const res = mockResponse();
      await UserController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'DB error' })
      );
    });
  });
});
