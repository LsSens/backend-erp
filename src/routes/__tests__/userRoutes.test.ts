import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import request from 'supertest';
import { UserRole } from '../../types';
import userRoutes from '../userRoutes';

const app = express();
const API_VERSION = 'v1';

// Security middlewares
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: 100, // limit per IP
  message: {
    success: false,
    error: 'Too many requests, try again later',
  },
});
app.use(limiter);

// JSON parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(`/api/${API_VERSION}/users`, userRoutes);

// 404 middleware
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Mock all middlewares to pass through
jest.mock('../../middlewares/auth', () => ({
  authenticateToken: (_req: any, _res: any, next: any) => next(),
  requireAdmin: (_req: any, _res: any, next: any) => next(),
  requireManager: (_req: any, _res: any, next: any) => next(),
  requireUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('../../middlewares/validation', () => ({
  validateRequest: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('../../controllers/userController', () => ({
  UserController: {
    listUsers: jest.fn((_req, res) =>
      res.status(200).json({ success: true, data: [], message: 'Users listed' })
    ),
    getUserById: jest.fn((req, res) => {
      if (req.params.id === 'notfound') {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      return res
        .status(200)
        .json({ success: true, data: { id: req.params.id }, message: 'User found' });
    }),
    createUser: jest.fn((req, res) => {
      if (!req.body.email) {
        return res.status(400).json({ success: false, error: 'Validation error' });
      }
      return res.status(201).json({ success: true, data: req.body, message: 'User created' });
    }),
    updateUser: jest.fn((req, res) => {
      if (req.params.id === 'notfound') {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      return res.status(200).json({ success: true, data: req.body, message: 'User updated' });
    }),
    deleteUser: jest.fn((req, res) => {
      if (req.params.id === 'notfound') {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      return res.status(200).json({ success: true, message: 'User deleted' });
    }),
  },
}));

describe('User Routes', () => {
  it('GET /api/v1/users - should list users', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('GET /api/v1/users/:id - should get user by id', async () => {
    const res = await request(app).get('/api/v1/users/123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('GET /api/v1/users/:id - should return 404 if user not found', async () => {
    const res = await request(app).get('/api/v1/users/notfound');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('User not found');
  });

  it('POST /api/v1/users - should create user', async () => {
    const user = {
      email: 'test@example.com',
      name: 'Test',
      role: UserRole.USER,
      password: '123456',
    };
    const res = await request(app).post('/api/v1/users').send(user);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject(user);
  });

  it('POST /api/v1/users - should return 400 if validation fails', async () => {
    const res = await request(app).post('/api/v1/users').send({ name: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/v1/users/:id - should update user', async () => {
    const res = await request(app).put('/api/v1/users/123').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ name: 'Updated' });
  });

  it('PUT /api/v1/users/:id - should return 404 if user not found', async () => {
    const res = await request(app).put('/api/v1/users/notfound').send({ name: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('User not found');
  });

  it('DELETE /api/v1/users/:id - should delete user', async () => {
    const res = await request(app).delete('/api/v1/users/123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('User deleted');
  });

  it('DELETE /api/v1/users/:id - should return 404 if user not found', async () => {
    const res = await request(app).delete('/api/v1/users/notfound');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('User not found');
  });
});
