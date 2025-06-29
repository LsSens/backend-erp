import { type Request, type Response, Router } from 'express';
import userRoutes from './userRoutes';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API status
 *     description: Endpoint to verify if the API is working correctly
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is working normally
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API is working
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00.000Z
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/users', userRoutes);

export default router;
