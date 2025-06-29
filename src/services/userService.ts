import { v4 as uuidv4 } from 'uuid';
import {
  createCognitoUser,
  deleteCognitoUser,
  setUserPassword,
  updateUserAttributes,
} from '@/config/cognito';
import { UserRepository } from '@/repositories/userRepository';
import { ICreateUser, IUpdateUser } from '@/models/User';
import { DynamoDBUser, PaginatedResponse, User } from '@/types';
import { createError } from '@/middlewares/errorHandler';

export class UserService {
  // Create user
  static async createUser(userData: ICreateUser): Promise<User> {
    const id = uuidv4();
    const now = new Date().toISOString();

    try {
      // Check if user already exists
      const existingUser = await UserService.getUserByEmail(userData.email);
      if (existingUser) {
        throw createError('User with this email already exists', 409);
      }

      // Skip Cognito in development/local environment
      const isLocalEnvironment = process.env.NODE_ENV === 'development' || process.env.USE_LOCALSTACK === 'true';
      
      if (!isLocalEnvironment) {
        // Create user in Cognito
        await createCognitoUser(userData.email, userData.password, {
          email: userData.email,
          name: userData.name,
          'custom:role': userData.role,
          email_verified: 'true',
        });

        // Set permanent password
        await setUserPassword(userData.email, userData.password, true);
      }

      // Create record in DynamoDB
      const dynamoUser: DynamoDBUser = {
        PK: `USER#${id}`,
        SK: `USER#${id}`,
        id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        GSI1PK: `EMAIL#${userData.email}`,
        GSI1SK: `USER#${id}`,
      };

      await UserRepository.put(UserRepository.createUserRecord(dynamoUser));

      // Return created user
      const user: User = {
        id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      return user;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw createError(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    try {
      const result = await UserRepository.get(UserRepository.getUserById(id));

      if (!result.Item) {
        return null;
      }

      const dynamoUser = result.Item as DynamoDBUser;
      return UserService.mapDynamoToUser(dynamoUser);
    } catch (error) {
      throw createError(`Error getting user: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await UserRepository.query(UserRepository.getUserByEmail(email));

      if (!result.Items || result.Items.length === 0) {
        return null;
      }

      const dynamoUser = result.Items[0] as DynamoDBUser;
      return UserService.mapDynamoToUser(dynamoUser);
    } catch (error) {
      throw createError(`Error getting user by email: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  // List users with pagination
  static async listUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const _offset = (page - 1) * limit;
      const result = await UserRepository.scan(UserRepository.scanUsers(limit));

      const users = (result.Items || []).map((item: any) =>
        UserService.mapDynamoToUser(item as DynamoDBUser)
      );

      return {
        items: users,
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit),
      };
    } catch (error) {
      throw createError(`Error listing users: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  // Update user
  static async updateUser(id: string, updates: IUpdateUser): Promise<User> {
    try {
      // Get current user
      const currentUser = await UserService.getUserById(id);
      if (!currentUser) {
        throw createError('User not found', 404);
      }

      // Skip Cognito in development/local environment
      const isLocalEnvironment = process.env.NODE_ENV === 'development' || process.env.USE_LOCALSTACK === 'true';
      
      if (!isLocalEnvironment && (updates.name || updates.role)) {
        // Update in Cognito if necessary
        const cognitoUpdates: Record<string, string> = {};
        if (updates.name) cognitoUpdates.name = updates.name;
        if (updates.role) cognitoUpdates['custom:role'] = updates.role;

        await updateUserAttributes(currentUser.email, cognitoUpdates);
      }

      // Update in DynamoDB
      const dynamoUpdates: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      if (updates.name) dynamoUpdates.name = updates.name;
      if (updates.role) dynamoUpdates.role = updates.role;
      if (updates.isActive !== undefined) dynamoUpdates.isActive = updates.isActive;

      const result = await UserRepository.update(UserRepository.updateUserRecord(id, dynamoUpdates));

      if (!result.Attributes) {
        throw createError('Error updating user', 500);
      }

      return UserService.mapDynamoToUser(result.Attributes as DynamoDBUser);
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw createError(`Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    try {
      // Get user to obtain email
      const user = await UserService.getUserById(id);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Skip Cognito in development/local environment
      const isLocalEnvironment = process.env.NODE_ENV === 'development' || process.env.USE_LOCALSTACK === 'true';
      
      if (!isLocalEnvironment) {
        // Delete from Cognito
        await deleteCognitoUser(user.email);
      }

      // Delete from DynamoDB
      await UserRepository.delete(UserRepository.deleteUserRecord(id));
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw createError(`Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  // Map DynamoDB User to User
  private static mapDynamoToUser(dynamoUser: DynamoDBUser): User {
    return {
      id: dynamoUser.id,
      email: dynamoUser.email,
      name: dynamoUser.name,
      role: dynamoUser.role,
      isActive: dynamoUser.isActive,
      createdAt: dynamoUser.createdAt,
      updatedAt: dynamoUser.updatedAt,
    };
  }
}
