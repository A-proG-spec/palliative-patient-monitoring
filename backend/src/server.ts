import app from './app.js';
import { connectDB, disconnectDB } from '@config/database.js';
import env from '@config/env.js';
import { logger } from '@config/logger.js';

const PORT = parseInt(env.PORT) || 5000;

const startServer = async () => {
  try {
    // Connect to PostgreSQL (Prisma)
    await connectDB();
    logger.info('Database connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`API URL: http://localhost:${PORT}/api/v1`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');

        // Close Prisma connection pool
        await disconnectDB();

        logger.info('Shutdown complete');
        process.exit(0);
      });

      // Force exit if shutdown hangs
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer();