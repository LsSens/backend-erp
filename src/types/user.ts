export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export interface CognitoUser {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  role: UserRole;
}

export interface DynamoDBUser {
  PK: string; // USER#${id}
  SK: string; // USER#${id}
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  GSI1PK?: string; // EMAIL#${email}
  GSI1SK?: string; // USER#${id}
}
