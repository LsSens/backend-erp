import { UserRole } from '../../types';
import {
  createUserSchema,
  type ICreateUser,
  type IUpdateUser,
  UserSchema,
  updateUserSchema,
} from '../User';

describe('User Model', () => {
  describe('UserSchema', () => {
    it('should validate valid user data', () => {
      const validUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const { error, value } = UserSchema.validate(validUser);

      expect(error).toBeUndefined();
      expect(value).toEqual(validUser);
    });

    it('should reject invalid email format', () => {
      const invalidUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'invalid-email',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const { error } = UserSchema.validate(invalidUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('email');
    });

    it('should reject invalid role', () => {
      const invalidUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        role: 'invalid-role',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const { error } = UserSchema.validate(invalidUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('role');
    });

    it('should reject missing required fields', () => {
      const invalidUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        // email is missing
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const { error } = UserSchema.validate(invalidUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('email');
    });
  });

  describe('createUserSchema', () => {
    it('should validate valid create user data', () => {
      const validCreateUser: ICreateUser = {
        email: 'new@example.com',
        name: 'New User',
        role: UserRole.USER,
        password: 'password123',
      };

      const { error, value } = createUserSchema.validate(validCreateUser);

      expect(error).toBeUndefined();
      expect(value).toEqual(validCreateUser);
    });

    it('should reject weak password', () => {
      const invalidCreateUser: ICreateUser = {
        email: 'new@example.com',
        name: 'New User',
        role: UserRole.USER,
        password: '123', // Too short
      };

      const { error } = createUserSchema.validate(invalidCreateUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('password');
    });

    it('should reject invalid email format for creation', () => {
      const invalidCreateUser: ICreateUser = {
        email: 'invalid-email',
        name: 'New User',
        role: UserRole.USER,
        password: 'password123',
      };

      const { error } = createUserSchema.validate(invalidCreateUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('email');
    });

    it('should reject name that is too short', () => {
      const invalidCreateUser: ICreateUser = {
        email: 'new@example.com',
        name: 'A', // Too short
        role: UserRole.USER,
        password: 'password123',
      };

      const { error } = createUserSchema.validate(invalidCreateUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('name');
    });

    it('should reject name that is too long', () => {
      const invalidCreateUser: ICreateUser = {
        email: 'new@example.com',
        name: 'A'.repeat(101), // Too long
        role: UserRole.USER,
        password: 'password123',
      };

      const { error } = createUserSchema.validate(invalidCreateUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('name');
    });
  });

  describe('updateUserSchema', () => {
    it('should validate valid update user data', () => {
      const validUpdateUser: IUpdateUser = {
        name: 'Updated Name',
        role: UserRole.MANAGER,
        isActive: false,
      };

      const { error, value } = updateUserSchema.validate(validUpdateUser);

      expect(error).toBeUndefined();
      expect(value).toEqual(validUpdateUser);
    });

    it('should validate partial update data', () => {
      const partialUpdateUser: IUpdateUser = {
        name: 'Updated Name',
        // role and isActive are optional
      };

      const { error, value } = updateUserSchema.validate(partialUpdateUser);

      expect(error).toBeUndefined();
      expect(value).toEqual(partialUpdateUser);
    });

    it('should reject invalid role in update', () => {
      const invalidUpdateUser = {
        name: 'Updated Name',
        role: 'invalid-role',
        isActive: true,
      };

      const { error } = updateUserSchema.validate(invalidUpdateUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('role');
    });

    it('should reject name that is too short in update', () => {
      const invalidUpdateUser: IUpdateUser = {
        name: 'A', // Too short
        role: UserRole.USER,
      };

      const { error } = updateUserSchema.validate(invalidUpdateUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('name');
    });

    it('should reject name that is too long in update', () => {
      const invalidUpdateUser: IUpdateUser = {
        name: 'A'.repeat(101), // Too long
        role: UserRole.USER,
      };

      const { error } = updateUserSchema.validate(invalidUpdateUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('name');
    });

    it('should reject non-boolean isActive', () => {
      const invalidUpdateUser = {
        name: 'Updated Name',
        isActive: 'not-boolean',
      };

      const { error } = updateUserSchema.validate(invalidUpdateUser);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('isActive');
    });
  });

  describe('Role validation', () => {
    it('should accept all valid roles', () => {
      const roles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER];

      roles.forEach((role) => {
        const validUser = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          name: 'Test User',
          role,
          isActive: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        };

        const { error } = UserSchema.validate(validUser);
        expect(error).toBeUndefined();
      });
    });

    it('should reject invalid roles', () => {
      const invalidRoles = ['superadmin', 'guest', 'moderator', ''];

      invalidRoles.forEach((role) => {
        const invalidUser = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          name: 'Test User',
          role,
          isActive: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        };

        const { error } = UserSchema.validate(invalidUser);
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('role');
      });
    });
  });
});
