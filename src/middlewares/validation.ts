import type { NextFunction, Request, Response } from 'express';
import type Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
      return;
    }

    req.body = value;
    next();
  };
};
