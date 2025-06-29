import { type Request, type Response, Router } from 'express';
import marketplaceIntegrationRoutes from './marketplaceIntegrationRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/users', userRoutes);
router.use('/marketplace-integrations', marketplaceIntegrationRoutes);

export default router;
