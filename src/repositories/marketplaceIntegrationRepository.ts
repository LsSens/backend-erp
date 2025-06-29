import { dynamoDB } from '@/config/database';
import type { DynamoDBMarketplaceIntegration } from '@/types/integration';

// Table name
const MARKETPLACE_INTEGRATIONS_TABLE = 'marketplace_integrations';

export class MarketplaceIntegrationRepository {
  // Create marketplace integration record
  static createMarketplaceIntegrationRecord(integration: DynamoDBMarketplaceIntegration) {
    return {
      TableName: MARKETPLACE_INTEGRATIONS_TABLE,
      Item: integration,
    };
  }

  // Get marketplace integration by ID
  static getMarketplaceIntegrationById(id: string) {
    return {
      TableName: MARKETPLACE_INTEGRATIONS_TABLE,
      Key: {
        PK: `MARKETPLACE_INTEGRATION#${id}`,
        SK: `MARKETPLACE_INTEGRATION#${id}`,
      },
    };
  }

  // Get marketplace integrations by user ID
  static getMarketplaceIntegrationsByUserId(userId: string) {
    return {
      TableName: MARKETPLACE_INTEGRATIONS_TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
      },
    };
  }

  // Get marketplace integrations by marketplace type
  static getMarketplaceIntegrationsByType(marketplaceType: string) {
    return {
      TableName: MARKETPLACE_INTEGRATIONS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :marketplaceType',
      ExpressionAttributeValues: {
        ':marketplaceType': `MARKETPLACE#${marketplaceType}`,
      },
    };
  }

  // Get marketplace integrations by status
  static getMarketplaceIntegrationsByStatus(status: string) {
    return {
      TableName: MARKETPLACE_INTEGRATIONS_TABLE,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :status',
      ExpressionAttributeValues: {
        ':status': `STATUS#${status}`,
      },
    };
  }

  // Get marketplace integration by user ID and marketplace type
  static getMarketplaceIntegrationByUserAndType(userId: string, marketplaceType: string) {
    return {
      TableName: MARKETPLACE_INTEGRATIONS_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': `MARKETPLACE#${marketplaceType}`,
      },
    };
  }

  // Update marketplace integration record
  static updateMarketplaceIntegrationRecord(id: string, updates: Record<string, any>) {
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

    // Parse the ID: USER#userId#MARKETPLACE#marketplaceType#integrationId
    const parts = id.split('#');
    const userId = parts[1];
    const marketplaceType = parts[3];
    const integrationId = parts[4];

    return {
      TableName: MARKETPLACE_INTEGRATIONS_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `MARKETPLACE#${marketplaceType}#${integrationId}`,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };
  }

  // Delete marketplace integration record
  static deleteMarketplaceIntegrationRecord(userId: string, marketplaceType: string, id: string) {
    return {
      TableName: MARKETPLACE_INTEGRATIONS_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `MARKETPLACE#${marketplaceType}#${id}`,
      },
    };
  }

  // Scan marketplace integrations
  static scanMarketplaceIntegrations(limit = 100, lastEvaluatedKey?: any) {
    return {
      TableName: MARKETPLACE_INTEGRATIONS_TABLE,
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
