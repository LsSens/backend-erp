import Joi from 'joi';

// Product validation schemas
export const ProductSchema = Joi.object({
  id: Joi.string().uuid().required(),
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().valid('electronics', 'books', 'clothing', 'home', 'sports').required(),
  stock: Joi.number().integer().min(0).required(),
  isActive: Joi.boolean().required(),
  createdAt: Joi.string().isoDate().required(),
  updatedAt: Joi.string().isoDate().required(),
});

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().min(2).max(50).required(),
  stock: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().min(10).max(500).optional(),
  price: Joi.number().positive().optional(),
  category: Joi.string().min(2).max(50).optional(),
  stock: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const productIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

// Product model interface
export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product creation interface
export interface ICreateProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  stock?: number;
  isActive?: boolean;
}

// Product update interface
export interface IUpdateProduct {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  isActive?: boolean;
} 