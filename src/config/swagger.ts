import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ERP Backend API',
      version: '1.0.0',
      description: 'Complete API for ERP system with JWT authentication and DynamoDB',
      contact: {
        name: 'Lucas Sens',
        email: 'lucassousasens@gmail.comm',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}/api/v1`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              description: 'Full name of the user',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'user'],
              description: 'User role in the system',
              example: 'user',
            },
            isActive: {
              type: 'boolean',
              description: 'User activation status',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
          required: ['id', 'email', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'],
        },
        CreateUserRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Full name of the user',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'user'],
              description: 'User role in the system',
              example: 'user',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password',
              example: 'password123',
            },
          },
          required: ['email', 'name', 'role', 'password'],
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Full name of the user',
              example: 'John Doe Updated',
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'user'],
              description: 'User role in the system',
              example: 'manager',
            },
            isActive: {
              type: 'boolean',
              description: 'User activation status',
              example: true,
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'JWT token for authentication',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
          required: ['user', 'token'],
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the operation was successful',
              example: true,
            },
            data: {
              description: 'Response data',
            },
            message: {
              type: 'string',
              description: 'Informative message',
              example: 'Operation completed successfully',
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Operation failed',
            },
          },
          required: ['success'],
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User',
              },
              description: 'List of users',
            },
            total: {
              type: 'integer',
              description: 'Total number of records',
              example: 100,
            },
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Number of records per page',
              example: 10,
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 10,
            },
          },
          required: ['items', 'total', 'page', 'limit', 'totalPages'],
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Internal server error',
            },
          },
          required: ['success', 'error'],
        },
        MarketplaceIntegration: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique marketplace integration ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID who owns this integration',
              example: '123e4567-e89b-12d3-a456-426614174001',
            },
            marketplaceType: {
              type: 'string',
              enum: ['mercadolivre', 'shopee', 'amazon', 'magazine_luiza', 'b2w'],
              description: 'Type of marketplace',
              example: 'mercadolivre',
            },
            accessToken: {
              type: 'string',
              description: 'Access token for marketplace API',
              example: 'valid-access-token',
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh token for marketplace API',
              example: 'valid-refresh-token',
            },
            sellerId: {
              type: 'string',
              description: 'Seller ID in the marketplace',
              example: 'seller123',
            },
            storeName: {
              type: 'string',
              description: 'Store name in the marketplace',
              example: 'Minha Loja',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending', 'error'],
              description: 'Integration status',
              example: 'active',
            },
            lastSyncAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last synchronization date',
              example: '2024-01-01T00:00:00.000Z',
              nullable: true,
            },
            errorMessage: {
              type: 'string',
              description: 'Error message if status is error',
              example: 'Connection failed',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
          required: [
            'id',
            'userId',
            'marketplaceType',
            'accessToken',
            'refreshToken',
            'sellerId',
            'storeName',
            'status',
            'createdAt',
            'updatedAt',
          ],
        },
        CreateMarketplaceIntegrationRequest: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID who owns this integration',
              example: '123e4567-e89b-12d3-a456-426614174001',
            },
            marketplaceType: {
              type: 'string',
              enum: ['mercadolivre', 'shopee', 'amazon', 'magazine_luiza', 'b2w'],
              description: 'Type of marketplace',
              example: 'mercadolivre',
            },
            accessToken: {
              type: 'string',
              description: 'Access token for marketplace API',
              example: 'valid-access-token',
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh token for marketplace API',
              example: 'valid-refresh-token',
            },
            sellerId: {
              type: 'string',
              description: 'Seller ID in the marketplace',
              example: 'seller123',
            },
            storeName: {
              type: 'string',
              description: 'Store name in the marketplace',
              example: 'Minha Loja',
            },
          },
          required: [
            'userId',
            'marketplaceType',
            'accessToken',
            'refreshToken',
            'sellerId',
            'storeName',
          ],
        },
        UpdateMarketplaceIntegrationRequest: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'Access token for marketplace API',
              example: 'new-access-token',
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh token for marketplace API',
              example: 'new-refresh-token',
            },
            sellerId: {
              type: 'string',
              description: 'Seller ID in the marketplace',
              example: 'new-seller-id',
            },
            storeName: {
              type: 'string',
              description: 'Store name in the marketplace',
              example: 'Nova Loja',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending', 'error'],
              description: 'Integration status',
              example: 'active',
            },
            lastSyncAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last synchronization date',
              example: '2024-01-01T00:00:00.000Z',
            },
            errorMessage: {
              type: 'string',
              description: 'Error message if status is error',
              example: 'Connection restored',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/docs/*.swagger.ts',
    './src/controllers/docs/*.swagger.ts',
    './src/models/docs/*.swagger.ts',
  ],
};

export const specs = swaggerJsdoc(options);
