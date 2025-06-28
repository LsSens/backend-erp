import { v4 as uuidv4 } from 'uuid';
import { 
  dynamoDB, 
  createUserRecord, 
  getUserById, 
  getUserByEmail, 
  updateUserRecord, 
  deleteUserRecord, 
  scanUsers 
} from '@/config/database';
import { 
  createCognitoUser, 
  updateUserAttributes, 
  deleteCognitoUser, 
  setUserPassword,
  extractUserAttributes,
  getUserAttributes
} from '@/config/cognito';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  DynamoDBUser, 
  PaginatedResponse 
} from '@/types';
import { ICreateUser, IUpdateUser } from '@/models/User';

export class UserService {
  // Create user
  static async createUser(userData: ICreateUser): Promise<User> {
    const id = uuidv4();
    const now = new Date().toISOString();

    try {
      // Create user in Cognito
      await createCognitoUser(userData.email, userData.password, {
        email: userData.email,
        name: userData.name,
        'custom:role': userData.role,
        email_verified: 'true',
      });

      // Set permanent password
      await setUserPassword(userData.email, userData.password, true);

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

      await dynamoDB.put(createUserRecord(dynamoUser)).promise();

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
      throw new Error(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    try {
      const result = await dynamoDB.get(getUserById(id)).promise();
      
      if (!result.Item) {
        return null;
      }

      const dynamoUser = result.Item as DynamoDBUser;
      return this.mapDynamoToUser(dynamoUser);
    } catch (error) {
      throw new Error(`Error getting user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await dynamoDB.query(getUserByEmail(email)).promise();
      
      if (!result.Items || result.Items.length === 0) {
        return null;
      }

      const dynamoUser = result.Items[0] as DynamoDBUser;
      return this.mapDynamoToUser(dynamoUser);
    } catch (error) {
      throw new Error(`Error getting user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List users with pagination
  static async listUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const offset = (page - 1) * limit;
      const result = await dynamoDB.scan(scanUsers(limit)).promise();
      
      const users = (result.Items || []).map(item => this.mapDynamoToUser(item as DynamoDBUser));
      
      return {
        items: users,
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit),
      };
    } catch (error) {
      throw new Error(`Error listing users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update user
  static async updateUser(id: string, updates: IUpdateUser): Promise<User> {
    try {
      // Get current user
      const currentUser = await this.getUserById(id);
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Update in Cognito if necessary
      if (updates.name || updates.role) {
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

      const result = await dynamoDB.update(updateUserRecord(id, dynamoUpdates)).promise();
      
      if (!result.Attributes) {
        throw new Error('Error updating user');
      }

      return this.mapDynamoToUser(result.Attributes as DynamoDBUser);
    } catch (error) {
      throw new Error(`Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    try {
      // Get user to obtain email
      const user = await this.getUserById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Delete from Cognito
      await deleteCognitoUser(user.email);

      // Delete from DynamoDB
      await dynamoDB.delete(deleteUserRecord(id)).promise();
    } catch (error) {
      throw new Error(`Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`);
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