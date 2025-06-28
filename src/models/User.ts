import Joi from 'joi';
import { UserRole } from '@/types';

// User validation schemas
export const UserSchema = Joi.object({
  id: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required(),
  isActive: Joi.boolean().required(),
  createdAt: Joi.string().isoDate().required(),
  updatedAt: Joi.string().isoDate().required(),
});

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required(),
  password: Joi.string().min(6).required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
  isActive: Joi.boolean().optional(),
});

export const userIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// User model interface
export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// User creation interface
export interface ICreateUser {
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

// User update interface
export interface IUpdateUser {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}
