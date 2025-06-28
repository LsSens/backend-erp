import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../validation';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateRequest', () => {
    it('should pass validation with valid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      mockRequest.body = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 400 with validation error for invalid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      mockRequest.body = {
        name: 'Test User',
        email: 'invalid-email',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('email'),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 with validation error for missing required fields', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      mockRequest.body = {
        name: 'Test User',
        // email is missing
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('email'),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 with validation error for empty body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      mockRequest.body = {};

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('name'),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle complex validation schemas', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().min(2).max(50).required(),
          age: Joi.number().integer().min(18).max(120).required(),
        }).required(),
        preferences: Joi.object({
          theme: Joi.string().valid('light', 'dark').default('light'),
          notifications: Joi.boolean().default(true),
        }).optional(),
      });

      mockRequest.body = {
        user: {
          name: 'John Doe',
          age: 25,
        },
        preferences: {
          theme: 'dark',
          notifications: false,
        },
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle complex validation errors', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().min(2).max(50).required(),
          age: Joi.number().integer().min(18).max(120).required(),
        }).required(),
        preferences: Joi.object({
          theme: Joi.string().valid('light', 'dark').default('light'),
          notifications: Joi.boolean().default(true),
        }).optional(),
      });

      mockRequest.body = {
        user: {
          name: 'J', // Too short
          age: 15, // Too young
        },
        preferences: {
          theme: 'invalid-theme', // Invalid value
          notifications: 'not-boolean', // Wrong type
        },
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 