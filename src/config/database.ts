import AWS from 'aws-sdk';
import { DynamoDBUser } from '@/types';

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
});

// Instantiate DynamoDB
export const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Table name
export const USERS_TABLE = process.env.DYNAMODB_TABLE_USERS || 'users-table';

// Helper functions for DynamoDB
export const createUserRecord = (user: DynamoDBUser) => ({
  TableName: USERS_TABLE,
  Item: user,
});

export const getUserById = (id: string) => ({
  TableName: USERS_TABLE,
  Key: {
    PK: `USER#${id}`,
    SK: `USER#${id}`,
  },
});

export const getUserByEmail = (email: string) => ({
  TableName: USERS_TABLE,
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :email',
  ExpressionAttributeValues: {
    ':email': `EMAIL#${email}`,
  },
});

export const updateUserRecord = (id: string, updates: Record<string, any>) => {
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
};

export const deleteUserRecord = (id: string) => ({
  TableName: USERS_TABLE,
  Key: {
    PK: `USER#${id}`,
    SK: `USER#${id}`,
  },
});

export const scanUsers = (limit = 100, lastEvaluatedKey?: any) => ({
  TableName: USERS_TABLE,
  FilterExpression: 'begins_with(PK, :pk)',
  ExpressionAttributeValues: {
    ':pk': 'USER#',
  },
  Limit: limit,
  ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
}); 