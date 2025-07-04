import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middlewares
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit per IP
  message: {
    success: false,
    error: 'Too many requests, try again later',
  },
});
app.use(limiter);

// JSON parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ERP Backend API Documentation',
    customfavIcon: '/favicon.ico',
  })
);

// API routes
app.use(`/api/${API_VERSION}`, routes);

// Error handling middleware
app.use(errorHandler);

// 404 middleware
app.use(notFoundHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`🔍 Health check at http://localhost:${PORT}/api/${API_VERSION}/health`);
  console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});

export default app;
