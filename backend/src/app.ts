import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimiter } from '@middlewares/rateLimiter.middleware.js';
import { errorHandler } from '@middlewares/error.middleware.js';
import router from '@routes/index.js';
import env from '@config/env.js';

const app = express();
app.set('etag', false);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/v1', router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    success: false,
    message: 'Route not found',
    errors: [],
  });
});

// Global error handler
app.use(errorHandler);

export default app;