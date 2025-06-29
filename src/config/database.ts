import AWS from 'aws-sdk';

// Configure AWS SDK for LocalStack
const awsConfig: any = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
};

// Use LocalStack endpoint if configured
if (process.env.NODE_ENV === 'development' || process.env.USE_LOCALSTACK === 'true') {
  awsConfig.endpoint = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
  awsConfig.credentials = {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  };
  // Configurações específicas para LocalStack
  awsConfig.sslEnabled = false;
  awsConfig.maxRetries = 3;
}

AWS.config.update(awsConfig);

// Export DynamoDB instance for general use
export const dynamoDB = new AWS.DynamoDB.DocumentClient();
