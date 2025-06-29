import type { NextFunction, Request, Response } from 'express';
import type { Schema } from 'joi';
import { createError } from './errorHandler';

export const validateRequest = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return next(createError(error.details[0].message, 400));
    }

    next();
  };
};
