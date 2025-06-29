# Backend ERP

Backend for ERP system developed with TypeScript, Node.js, Express, DynamoDB and AWS Cognito.

## 🚀 Technologies

- **Node.js** - JavaScript runtime
- **TypeScript** - Programming language
- **Express** - Web framework
- **DynamoDB** - NoSQL database
- **AWS Cognito** - Authentication and authorization
- **Jest** - Testing framework
- **Biome** - Code linter and formatter

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- AWS account with access to DynamoDB and Cognito

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend-erp
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp env.example .env
```

4. Edit the `.env` file with your configurations:
```env
# AWS DynamoDB
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# AWS Cognito
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id
COGNITO_CLIENT_SECRET=your_client_secret

# JWT
JWT_SECRET=your_jwt_secret_key
```

## 🚀 Running the project

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 🧪 Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

## 📝 Available scripts

- `npm run dev` - Run server in development mode
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run server in production
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run linter
- `npm run lint:fix` - Fix linter issues
- `npm run format` - Format code
- `npm run check` - Run lint and format

## 📁 Project structure

```
src/
├── config/          # Project configurations
├── controllers/     # Route controllers
├── middlewares/     # Custom middlewares
├── models/          # Data models
├── routes/          # Route definitions
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utilities
└── index.ts         # Main file
```

## 🔐 Authentication

The system uses AWS Cognito for authentication and authorization. Protected routes require a valid JWT token in the `Authorization` header.

### Usage example:
```bash
curl -H "Authorization: Bearer <jwt-token>" http://localhost:8080/api/v1/users
```

## 📚 API Documentation

The API documentation is available through Swagger UI, providing an interactive interface to explore and test all available endpoints.

### Access Documentation
- **Development**: http://localhost:8080/api-docs

The documentation includes:
- Complete API reference with all endpoints
- Request/response schemas and examples
- Authentication requirements
- Interactive testing interface
- Detailed error responses

## 🔧 DynamoDB Configuration

1. Create a table in DynamoDB with the name specified in `users`
2. Configure IAM permissions for DynamoDB access
3. Configure environment variables with your AWS credentials

## 🔧 Cognito Configuration

1. Create a User Pool in AWS Cognito
2. Configure an App Client
3. Configure environment variables with Cognito IDs

## 📝 License

This project is under MIT license. See the [LICENSE](LICENSE) file for more details.

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 