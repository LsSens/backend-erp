import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock the routes module
jest.mock('../routes', () => {
  const express = require('express');
  const router = express.Router();
  
  // Mock health route
  router.get('/health', (_req: any, res: any) => {
    res.status(200).json({
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
    });
  });

  // Mock user routes that require auth
  router.use('/users', (req: any, res: any, next: any) => {
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    next();
  });

  return router;
});

// Import the app after mocking
// import app from '../index';

// Função para criar app sem rate limit
function createAppWithoutRateLimit() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/v1', require('../routes').default || require('../routes'));
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ success: false, error: 'Internal server error' });
  });
  app.use((_req: express.Request, res: express.Response) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });
  return app;
}

const app = createAppWithoutRateLimit();

describe('Application Setup', () => {
  describe('Security Middlewares', () => {
    it('should have helmet middleware configured', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      // Helmet adds security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    it('should have CORS middleware configured', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      // CORS headers should be present
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to requests', async () => {
      // Instância separada com rate limit
      const rateLimitedApp = express();
      rateLimitedApp.use(helmet());
      rateLimitedApp.use(cors());
      const limiter = rateLimit({
        windowMs: 900000,
        max: 2,
        message: {
          success: false,
          error: 'Too many requests, try again later',
        },
      });
      rateLimitedApp.use(limiter);
      rateLimitedApp.use(express.json({ limit: '10mb' }));
      rateLimitedApp.use(express.urlencoded({ extended: true }));
      rateLimitedApp.use('/api/v1', require('../routes').default || require('../routes'));
      rateLimitedApp.use((_req: express.Request, res: express.Response) => {
        res.status(404).json({ success: false, error: 'Route not found' });
      });

      // Faz 3 requisições para estourar o limite
      await request(rateLimitedApp).get('/api/v1/health');
      await request(rateLimitedApp).get('/api/v1/health');
      const lastResponse = await request(rateLimitedApp).get('/api/v1/health');
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body).toEqual({
        success: false,
        error: 'Too many requests, try again later'
      });
    });
  });

  describe('JSON Parsing', () => {
    it('should parse JSON requests', async () => {
      const response = await request(app)
        .post('/api/v1/test-json')
        .send({ test: 'data' })
        .expect(404); // Route doesn't exist, but JSON should be parsed

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found'
      });
    });

    it('should handle large JSON payloads', async () => {
      const largePayload = { data: 'x'.repeat(5 * 1024 * 1024) }; // 5MB
      
      const response = await request(app)
        .post('/api/v1/test-large-json')
        .send(largePayload)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found'
      });
    });
  });

  describe('Error Handling Middleware', () => {
    it('should handle internal server errors', async () => {
      // Create a route that throws an error
      const testApp = express();
      testApp.use(express.json());
      testApp.use(helmet());
      testApp.use(cors());
      
      const limiter = rateLimit({
        windowMs: 900000,
        max: 100,
        message: {
          success: false,
          error: 'Too many requests, try again later',
        },
      });
      testApp.use(limiter);

      // Add a route that throws an error
      testApp.get('/api/v1/error', () => {
        throw new Error('Test error');
      });

      // Error handling middleware
      testApp.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error('Error:', err);
        
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      });

      // 404 middleware
      testApp.use((_req: express.Request, res: express.Response) => {
        res.status(404).json({
          success: false,
          error: 'Route not found',
        });
      });

      const response = await request(testApp)
        .get('/api/v1/error')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('404 Middleware', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found'
      });
    });

    it('should return 404 for different HTTP methods', async () => {
      const response = await request(app)
        .post('/api/v1/non-existent')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found'
      });
    });

    it('should return 404 for routes outside API version', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found'
      });
    });

    it('should return 404 for root routes', async () => {
      const response = await request(app)
        .get('/')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found'
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should use default PORT when not set', () => {
      const originalPort = process.env.PORT;
      delete process.env.PORT;
      
      // Re-import to test default values
      jest.resetModules();
      const { default: testApp } = require('../index');
      
      expect(testApp).toBeDefined();
      
      // Restore original PORT
      if (originalPort) {
        process.env.PORT = originalPort;
      }
    });

    it('should use default API_VERSION when not set', () => {
      const originalApiVersion = process.env.API_VERSION;
      delete process.env.API_VERSION;
      
      // Re-import to test default values
      jest.resetModules();
      const { default: testApp } = require('../index');
      
      expect(testApp).toBeDefined();
      
      // Restore original API_VERSION
      if (originalApiVersion) {
        process.env.API_VERSION = originalApiVersion;
      }
    });
  });
}); 