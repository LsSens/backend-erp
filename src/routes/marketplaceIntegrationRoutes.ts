import { Router } from 'express';
import { MarketplaceIntegrationController } from '@/controllers/marketplaceIntegrationController';
import { authenticateToken, requireManager, requireUser } from '@/middlewares/auth';
import {
  createMarketplaceIntegrationSchema,
  updateMarketplaceIntegrationSchema,
} from '@/models/MarketplaceIntegration';
import { validateRequest } from '../middlewares/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', requireManager, MarketplaceIntegrationController.listMarketplaceIntegrations);
router.get('/:id', requireUser, MarketplaceIntegrationController.getMarketplaceIntegrationById);
router.get(
  '/user/:userId',
  requireUser,
  MarketplaceIntegrationController.getMarketplaceIntegrationsByUserId
);
router.get(
  '/type/:marketplaceType',
  requireManager,
  MarketplaceIntegrationController.getMarketplaceIntegrationsByType
);
router.post(
  '/',
  requireUser,
  validateRequest(createMarketplaceIntegrationSchema),
  MarketplaceIntegrationController.createMarketplaceIntegration
);
router.put(
  '/:id',
  requireUser,
  validateRequest(updateMarketplaceIntegrationSchema),
  MarketplaceIntegrationController.updateMarketplaceIntegration
);
router.delete(
  '/:userId/:marketplaceType/:id',
  requireUser,
  MarketplaceIntegrationController.deleteMarketplaceIntegration
);
router.patch('/:id/status', requireUser, MarketplaceIntegrationController.updateIntegrationStatus);
router.patch(
  '/:id/refresh-token',
  requireUser,
  MarketplaceIntegrationController.refreshAccessToken
);

export default router;
