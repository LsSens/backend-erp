import AWS from 'aws-sdk';
import { type CognitoUser, UserRole } from '@/types';

// Configure AWS Cognito
export const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

// Cognito configurations
export const COGNITO_CONFIG = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID || '',
  ClientId: process.env.COGNITO_CLIENT_ID || '',
  ClientSecret: process.env.COGNITO_CLIENT_SECRET || '',
};

// Helper functions for Cognito
export const createCognitoUser = async (
  email: string,
  password: string,
  attributes: Record<string, string>
) => {
  const params = {
    UserPoolId: COGNITO_CONFIG.UserPoolId,
    Username: email,
    TemporaryPassword: password,
    UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({
      Name,
      Value,
    })),
    MessageAction: 'SUPPRESS', // Don't send confirmation email
  };

  return cognitoIdentityServiceProvider.adminCreateUser(params).promise();
};

export const authenticateUser = async (email: string, password: string) => {
  const params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: COGNITO_CONFIG.UserPoolId,
    ClientId: COGNITO_CONFIG.ClientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  return cognitoIdentityServiceProvider.adminInitiateAuth(params).promise();
};

export const getUserAttributes = async (username: string) => {
  const params = {
    UserPoolId: COGNITO_CONFIG.UserPoolId,
    Username: username,
  };

  return cognitoIdentityServiceProvider.adminGetUser(params).promise();
};

export const updateUserAttributes = async (
  username: string,
  attributes: Record<string, string>
) => {
  const params = {
    UserPoolId: COGNITO_CONFIG.UserPoolId,
    Username: username,
    UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({
      Name,
      Value,
    })),
  };

  return cognitoIdentityServiceProvider.adminUpdateUserAttributes(params).promise();
};

export const deleteCognitoUser = async (username: string) => {
  const params = {
    UserPoolId: COGNITO_CONFIG.UserPoolId,
    Username: username,
  };

  return cognitoIdentityServiceProvider.adminDeleteUser(params).promise();
};

export const setUserPassword = async (username: string, password: string, permanent = true) => {
  const params = {
    UserPoolId: COGNITO_CONFIG.UserPoolId,
    Username: username,
    Password: password,
    Permanent: permanent,
  };

  return cognitoIdentityServiceProvider.adminSetUserPassword(params).promise();
};

// Function to extract user attributes from Cognito user
export const extractUserAttributes = (cognitoUser: any): CognitoUser => {
  const attributes = cognitoUser.UserAttributes || [];
  const userAttributes: Record<string, string> = {};

  attributes.forEach((attr: any) => {
    userAttributes[attr.Name] = attr.Value;
  });

  return {
    sub: userAttributes.sub || '',
    email: userAttributes.email || '',
    email_verified: userAttributes.email_verified === 'true',
    name: userAttributes.name || '',
    role: (userAttributes['custom:role'] as UserRole) || UserRole.USER,
  };
};
