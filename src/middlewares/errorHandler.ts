import type { NextFunction, Request, Response } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const createError = (message: string, statusCode = 500, code?: string): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const errorHandler = (
  error: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
};
