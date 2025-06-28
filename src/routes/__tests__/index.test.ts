import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import request from 'supertest';
import router from '../index';

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
app.use(`/api/${API_VERSION}`, router);

// 404 middleware
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

describe('Routes Index', () => {
  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/v1/health').expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'API is working',
        timestamp: expect.any(String),
      });
    });

    it('should return correct response structure', async () => {
      const response = await request(app).get('/api/v1/health').expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API is working');
      expect(typeof response.body.timestamp).toBe('string');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/v1/non-existent-route').expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found',
      });
    });

    it('should return 404 for different HTTP methods', async () => {
      const response = await request(app).post('/api/v1/non-existent-route').expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found',
      });
    });

    it('should return 404 for root non-existent routes', async () => {
      const response = await request(app).get('/api/v1/').expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found',
      });
    });

    it('should return 404 for routes outside API version', async () => {
      const response = await request(app).get('/api/non-existent').expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found',
      });
    });
  });

  describe('User Routes Integration', () => {
    it('should have user routes available', async () => {
      // Test that user routes are properly mounted
      const response = await request(app).get('/api/v1/users').expect(401); // Should return 401 due to missing auth token

      // The fact that it returns 401 instead of 404 means the route exists
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for nested non-existent user routes', async () => {
      const response = await request(app).get('/api/v1/users/non-existent').expect(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
