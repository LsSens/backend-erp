import {
  createProductSchema,
  type ICreateProduct,
  type IUpdateProduct,
  ProductSchema,
  updateProductSchema,
} from '../Product';

describe('Product Model', () => {
  describe('ProductSchema Validation', () => {
    it('should validate a valid product', () => {
      const validProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'electronics',
        stock: 10,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(validProduct);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validProduct);
    });

    it('should fail validation when id is missing', () => {
      const invalidProduct = {
        name: 'Test Product',
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'electronics',
        stock: 10,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(invalidProduct);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('"id" is required');
    });

    it('should fail validation when id is not a valid UUID', () => {
      const invalidProduct = {
        id: 'invalid-uuid',
        name: 'Test Product',
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'electronics',
        stock: 10,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(invalidProduct);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('"id" must be a valid GUID');
    });

    it('should fail validation when name is too short', () => {
      const invalidProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'a',
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'electronics',
        stock: 10,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(invalidProduct);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain(
        '"name" length must be at least 2 characters long'
      );
    });

    it('should fail validation when name is too long', () => {
      const invalidProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'a'.repeat(201),
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'electronics',
        stock: 10,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(invalidProduct);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain(
        '"name" length must be less than or equal to 200 characters long'
      );
    });

    it('should fail validation when description is too short', () => {
      const invalidProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'short',
        price: 99.99,
        category: 'electronics',
        stock: 10,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(invalidProduct);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain(
        '"description" length must be at least 10 characters long'
      );
    });

    it('should fail validation when price is negative', () => {
      const invalidProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'A test product with sufficient description',
        price: -10,
        category: 'electronics',
        stock: 10,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(invalidProduct);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('"price" must be a positive number');
    });

    it('should fail validation when category is invalid', () => {
      const invalidProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'invalid-category',
        stock: 10,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(invalidProduct);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('"category" must be one of');
    });

    it('should fail validation when stock is negative', () => {
      const invalidProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'electronics',
        stock: -5,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(invalidProduct);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain(
        '"stock" must be greater than or equal to 0'
      );
    });

    it('should allow stock to be zero', () => {
      const validProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'electronics',
        stock: 0,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(validProduct);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validProduct);
    });
  });

  describe('createProductSchema Validation', () => {
    it('should validate a valid create product request', () => {
      const validProduct: ICreateProduct = {
        name: 'Test Product',
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'electronics',
        stock: 10,
        isActive: true,
      };

      const result = createProductSchema.validate(validProduct);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validProduct);
    });

    it('should use default values for optional fields', () => {
      const productWithoutDefaults: ICreateProduct = {
        name: 'Test Product',
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'electronics',
      };

      const result = createProductSchema.validate(productWithoutDefaults);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual({
        ...productWithoutDefaults,
        stock: 0,
        isActive: true,
      });
    });

    it('should fail validation when name is missing', () => {
      const invalidProduct = {
        description: 'A test product with sufficient description',
        price: 99.99,
        category: 'electronics',
      };

      const result = createProductSchema.validate(invalidProduct);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('"name" is required');
    });

    it('should fail validation when price is not positive', () => {
      const invalidProduct: ICreateProduct = {
        name: 'Test Product',
        description: 'A test product with sufficient description',
        price: 0,
        category: 'electronics',
      };

      const result = createProductSchema.validate(invalidProduct);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('"price" must be a positive number');
    });
  });

  describe('updateProductSchema Validation', () => {
    it('should validate a valid update product request', () => {
      const validUpdate: IUpdateProduct = {
        name: 'Updated Product',
        price: 149.99,
      };

      const result = updateProductSchema.validate(validUpdate);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validUpdate);
    });

    it('should allow partial updates', () => {
      const partialUpdate: IUpdateProduct = {
        price: 149.99,
      };

      const result = updateProductSchema.validate(partialUpdate);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(partialUpdate);
    });

    it('should allow empty update object', () => {
      const emptyUpdate = {};

      const result = updateProductSchema.validate(emptyUpdate);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(emptyUpdate);
    });

    it('should fail validation when price is negative', () => {
      const invalidUpdate: IUpdateProduct = {
        price: -10,
      };

      const result = updateProductSchema.validate(invalidUpdate);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('"price" must be a positive number');
    });

    it('should fail validation when stock is negative', () => {
      const invalidUpdate: IUpdateProduct = {
        stock: -5,
      };

      const result = updateProductSchema.validate(invalidUpdate);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain(
        '"stock" must be greater than or equal to 0'
      );
    });
  });

  describe('Category Validation', () => {
    it('should accept all valid categories', () => {
      const validCategories = ['electronics', 'books', 'clothing', 'home', 'sports'];

      validCategories.forEach((category) => {
        const validProduct = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Product',
          description: 'A test product with sufficient description',
          price: 99.99,
          category,
          stock: 10,
          isActive: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        };

        const result = ProductSchema.validate(validProduct);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum valid values', () => {
      const validProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'ab',
        description: 'abcdefghij',
        price: 0.01,
        category: 'electronics',
        stock: 0,
        isActive: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(validProduct);
      expect(result.error).toBeUndefined();
    });

    it('should handle maximum valid values', () => {
      const validProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'a'.repeat(200),
        description: 'a'.repeat(1000),
        price: 999999.99,
        category: 'electronics',
        stock: 999999,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const result = ProductSchema.validate(validProduct);
      expect(result.error).toBeUndefined();
    });
  });
});
