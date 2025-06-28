import type { NextFunction, Request, Response } from 'express';
import { UserRole } from '@/types';
import { extractTokenFromHeader, hasPermission, verifyToken } from '@/utils/jwt';

// Extend Request interface to include user
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

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.status(401).json({
        success: false,
        error: 'Authentication token not provided',
      });
      return;
    }

    const token = extractTokenFromHeader(authorization);
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (_error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

export const requireRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    if (!hasPermission(req.user.role, requiredRole)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireManager = requireRole(UserRole.MANAGER);
export const requireUser = requireRole(UserRole.USER);
