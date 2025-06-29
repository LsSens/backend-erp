import { Router } from 'express';
import { UserController } from '@/controllers/userController';
import { authenticateToken, requireAdmin, requireManager, requireUser } from '@/middlewares/auth';
import { createUserSchema, updateUserSchema } from '@/models/User';
import { validateRequest } from '../middlewares/validation';

const router = Router();

router.use(authenticateToken);
router.get('/', requireManager, UserController.listUsers);
router.get('/:id', requireUser, UserController.getUserById);
router.post('/', requireAdmin, validateRequest(createUserSchema), UserController.createUser);
router.put('/:id', requireAdmin, validateRequest(updateUserSchema), UserController.updateUser);
router.delete('/:id', requireAdmin, UserController.deleteUser);

export default router;
