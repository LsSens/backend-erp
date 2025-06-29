import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@/types/user';
import { createError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        name: string;
        role: UserRole;
      };
    }
  }
}

export const shouldSkipAuth = (): boolean => {
  const isLocalEnvironment =
    process.env.NODE_ENV === 'development' || process.env.USE_LOCALSTACK === 'true';
  return isLocalEnvironment;
};

const createMockUser = (role: UserRole = UserRole.ADMIN) => ({
  sub: 'dev-user-id',
  email: 'dev@example.com',
  name: 'Development User',
  role: role,
});

export const authenticateToken = (req: Request, _res: Response, next: NextFunction) => {
  if (shouldSkipAuth()) {
    req.user = createMockUser();
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return next(createError('Access token required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as any;
    req.user = decoded;
    next();
  } catch (_error) {
    return next(createError('Invalid or expired token', 401));
  }
};

export const requireUser = (req: Request, _res: Response, next: NextFunction) => {
  if (shouldSkipAuth()) {
    if (!req.user) {
      req.user = createMockUser();
    }
    return next();
  }

  if (!req.user) {
    return next(createError('Authentication required', 401));
  }
  next();
};

export const requireManager = (req: Request, _res: Response, next: NextFunction) => {
  if (shouldSkipAuth()) {
    if (!req.user) {
      req.user = createMockUser(UserRole.MANAGER);
    }
    return next();
  }

  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  if (req.user.role !== UserRole.MANAGER && req.user.role !== UserRole.ADMIN) {
    return next(createError('Manager or Admin access required', 403));
  }

  next();
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (shouldSkipAuth()) {
    if (!req.user) {
      req.user = createMockUser(UserRole.ADMIN);
    }
    return next();
  }

  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  if (req.user.role !== UserRole.ADMIN) {
    return next(createError('Admin access required', 403));
  }

  next();
};
