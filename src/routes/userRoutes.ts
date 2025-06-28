import { Router } from 'express';
import { UserController } from '@/controllers/userController';
import { authenticateToken, requireAdmin, requireManager, requireUser } from '@/middlewares/auth';
import { createUserSchema, updateUserSchema } from '@/models/User';
import { validateRequest } from '../middlewares/validation';

const router = Router();

// Authentication middleware for all routes
router.use(authenticateToken);

// GET /api/v1/users - List users (requires MANAGER or ADMIN)
router.get('/', requireManager, UserController.listUsers);

// GET /api/v1/users/:id - Get user by ID (requires USER)
router.get('/:id', requireUser, UserController.getUserById);

// POST /api/v1/users - Create user (requires ADMIN)
router.post('/', requireAdmin, validateRequest(createUserSchema), UserController.createUser);

// PUT /api/v1/users/:id - Update user (requires ADMIN)
router.put('/:id', requireAdmin, validateRequest(updateUserSchema), UserController.updateUser);

// DELETE /api/v1/users/:id - Delete user (requires ADMIN)
router.delete('/:id', requireAdmin, UserController.deleteUser);

export default router;
