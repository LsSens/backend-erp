import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import request from 'supertest';
import { IntegrationStatus, MarketplaceType } from '../../types/integration';
import marketplaceIntegrationRoutes from '../marketplaceIntegrationRoutes';

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
app.use(`/api/${API_VERSION}/marketplace-integrations`, marketplaceIntegrationRoutes);

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

jest.mock('../../controllers/marketplaceIntegrationController', () => ({
  MarketplaceIntegrationController: {
    listMarketplaceIntegrations: jest.fn((_req, res) =>
      res.status(200).json({ success: true, data: [], message: 'Integrations listed' })
    ),
    getMarketplaceIntegrationById: jest.fn((req, res) => {
      if (req.params.id === 'notfound') {
        return res.status(404).json({ success: false, error: 'Integration not found' });
      }
      return res
        .status(200)
        .json({ success: true, data: { id: req.params.id }, message: 'Integration found' });
    }),
    getMarketplaceIntegrationsByUserId: jest.fn((req, res) => {
      if (req.params.userId === 'notfound') {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      return res.status(200).json({ success: true, data: [], message: 'User integrations found' });
    }),
    getMarketplaceIntegrationsByType: jest.fn((req, res) => {
      if (req.params.marketplaceType === 'invalid') {
        return res.status(400).json({ success: false, error: 'Invalid marketplace type' });
      }
      return res
        .status(200)
        .json({ success: true, data: [], message: 'Integrations by type found' });
    }),
    createMarketplaceIntegration: jest.fn((req, res) => {
      if (!req.body.userId || !req.body.marketplaceType) {
        return res.status(400).json({ success: false, error: 'Validation error' });
      }
      return res
        .status(201)
        .json({ success: true, data: req.body, message: 'Integration created' });
    }),
    updateMarketplaceIntegration: jest.fn((req, res) => {
      if (req.params.id === 'notfound') {
        return res.status(404).json({ success: false, error: 'Integration not found' });
      }
      return res
        .status(200)
        .json({ success: true, data: req.body, message: 'Integration updated' });
    }),
    deleteMarketplaceIntegration: jest.fn((req, res) => {
      if (req.params.id === 'notfound') {
        return res.status(404).json({ success: false, error: 'Integration not found' });
      }
      return res.status(200).json({ success: true, message: 'Integration deleted' });
    }),
    updateIntegrationStatus: jest.fn((req, res) => {
      if (req.params.id === 'notfound') {
        return res.status(404).json({ success: false, error: 'Integration not found' });
      }
      return res.status(200).json({ success: true, data: req.body, message: 'Status updated' });
    }),
    refreshAccessToken: jest.fn((req, res) => {
      if (req.params.id === 'notfound') {
        return res.status(404).json({ success: false, error: 'Integration not found' });
      }
      return res.status(200).json({ success: true, data: req.body, message: 'Token refreshed' });
    }),
  },
}));

describe('Marketplace Integration Routes', () => {
  describe('GET /api/v1/marketplace-integrations', () => {
    it('should list marketplace integrations', async () => {
      const res = await request(app).get('/api/v1/marketplace-integrations');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should handle pagination parameters', async () => {
      const res = await request(app)
        .get('/api/v1/marketplace-integrations')
        .query({ page: 2, limit: 20 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/marketplace-integrations/:id', () => {
    it('should get marketplace integration by id', async () => {
      const res = await request(app).get('/api/v1/marketplace-integrations/123');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 404 if integration not found', async () => {
      const res = await request(app).get('/api/v1/marketplace-integrations/notfound');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Integration not found');
    });
  });

  describe('GET /api/v1/marketplace-integrations/user/:userId', () => {
    it('should get marketplace integrations by user id', async () => {
      const res = await request(app).get('/api/v1/marketplace-integrations/user/123');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 404 if user not found', async () => {
      const res = await request(app).get('/api/v1/marketplace-integrations/user/notfound');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('User not found');
    });
  });

  describe('GET /api/v1/marketplace-integrations/type/:marketplaceType', () => {
    it('should get marketplace integrations by type', async () => {
      const res = await request(app).get('/api/v1/marketplace-integrations/type/mercadolivre');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 400 if marketplace type is invalid', async () => {
      const res = await request(app).get('/api/v1/marketplace-integrations/type/invalid');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid marketplace type');
    });
  });

  describe('POST /api/v1/marketplace-integrations', () => {
    it('should create marketplace integration', async () => {
      const integration = {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        marketplaceType: MarketplaceType.MERCADOLIVRE,
        accessToken: 'valid-access-token',
        refreshToken: 'valid-refresh-token',
        sellerId: 'seller123',
        storeName: 'Minha Loja',
      };
      const res = await request(app).post('/api/v1/marketplace-integrations').send(integration);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject(integration);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/marketplace-integrations')
        .send({ storeName: 'Test' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/marketplace-integrations/:id', () => {
    it('should update marketplace integration', async () => {
      const updates = {
        accessToken: 'new-access-token',
        storeName: 'Updated Store',
        status: IntegrationStatus.ACTIVE,
      };
      const res = await request(app).put('/api/v1/marketplace-integrations/123').send(updates);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject(updates);
    });

    it('should return 404 if integration not found', async () => {
      const res = await request(app)
        .put('/api/v1/marketplace-integrations/notfound')
        .send({ storeName: 'Updated' });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Integration not found');
    });
  });

  describe('DELETE /api/v1/marketplace-integrations/:userId/:marketplaceType/:id', () => {
    it('should delete marketplace integration', async () => {
      const res = await request(app).delete(
        '/api/v1/marketplace-integrations/123/mercadolivre/456'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Integration deleted');
    });

    it('should return 404 if integration not found', async () => {
      const res = await request(app).delete(
        '/api/v1/marketplace-integrations/123/mercadolivre/notfound'
      );
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Integration not found');
    });
  });

  describe('PATCH /api/v1/marketplace-integrations/:id/status', () => {
    it('should update integration status', async () => {
      const statusUpdate = {
        status: IntegrationStatus.ACTIVE,
        errorMessage: 'Connection restored',
      };
      const res = await request(app)
        .patch('/api/v1/marketplace-integrations/123/status')
        .send(statusUpdate);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject(statusUpdate);
    });

    it('should return 404 if integration not found', async () => {
      const res = await request(app)
        .patch('/api/v1/marketplace-integrations/notfound/status')
        .send({ status: IntegrationStatus.ACTIVE });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Integration not found');
    });
  });

  describe('PATCH /api/v1/marketplace-integrations/:id/refresh-token', () => {
    it('should refresh access token', async () => {
      const tokenUpdate = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      const res = await request(app)
        .patch('/api/v1/marketplace-integrations/123/refresh-token')
        .send(tokenUpdate);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject(tokenUpdate);
    });

    it('should return 404 if integration not found', async () => {
      const res = await request(app)
        .patch('/api/v1/marketplace-integrations/notfound/refresh-token')
        .send({ accessToken: 'new-token' });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Integration not found');
    });
  });

  describe('Route not found', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app).get(
        '/api/v1/marketplace-integrations/non-existent-route/test'
      );
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Route not found');
    });
  });
});
