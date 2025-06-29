import { dynamoDB } from '@/config/database';
import type { DynamoDBUser } from '@/types';

// Table name
const USERS_TABLE = 'users';

export class UserRepository {
  // Create user record
  static createUserRecord(user: DynamoDBUser) {
    return {
      TableName: USERS_TABLE,
      Item: user,
    };
  }

  // Get user by ID
  static getUserById(id: string) {
    return {
      TableName: USERS_TABLE,
      Key: {
        PK: `USER#${id}`,
        SK: `USER#${id}`,
      },
    };
  }

  // Get user by email
  static getUserByEmail(email: string) {
    return {
      TableName: USERS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :email',
      ExpressionAttributeValues: {
        ':email': `EMAIL#${email}`,
      },
    };
  }

  // Update user record
  static updateUserRecord(id: string, updates: Record<string, any>) {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;

      updateExpression.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value;
    });

    return {
      TableName: USERS_TABLE,
      Key: {
        PK: `USER#${id}`,
        SK: `USER#${id}`,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };
  }

  // Delete user record
  static deleteUserRecord(id: string) {
    return {
      TableName: USERS_TABLE,
      Key: {
        PK: `USER#${id}`,
        SK: `USER#${id}`,
      },
    };
  }

  // Scan users
  static scanUsers(limit = 100, lastEvaluatedKey?: any) {
    return {
      TableName: USERS_TABLE,
      FilterExpression: 'begins_with(PK, :pk)',
      ExpressionAttributeValues: {
        ':pk': 'USER#',
      },
      Limit: limit,
      ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
    };
  }

  // Database operations
  static async put(params: any) {
    return dynamoDB.put(params).promise();
  }

  static async get(params: any) {
    return dynamoDB.get(params).promise();
  }

  static async query(params: any) {
    return dynamoDB.query(params).promise();
  }

  static async update(params: any) {
    return dynamoDB.update(params).promise();
  }

  static async delete(params: any) {
    return dynamoDB.delete(params).promise();
  }

  static async scan(params: any) {
    return dynamoDB.scan(params).promise();
  }
}
