import type { NextFunction, Request, Response } from 'express';
import { createError, errorHandler, notFoundHandler } from '../errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createError', () => {
    it('should create error with default values', () => {
      const error = createError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
    });

    it('should create error with custom status code', () => {
      const error = createError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create error with custom code', () => {
      const error = createError('Validation error', 400, 'VALIDATION_ERROR');

      expect(error.message).toBe('Validation error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('errorHandler', () => {
    it('should handle error with status code', () => {
      const error = createError('Custom error', 400);

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Custom error',
      });
    });

    it('should handle error without status code', () => {
      const error = new Error('Generic error') as any;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Generic error',
      });
    });

    it('should handle error without message', () => {
      const error = new Error() as any;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal Server Error',
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 response', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Route not found',
      });
    });
  });
});
