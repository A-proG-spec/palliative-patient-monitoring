import { prisma } from '../lib/prisma.js';
import { logger } from '@config/logger.js';

// ─────────────────────────────────────────────────────────────
// Connect to PostgreSQL via Prisma.
// Prisma lazily connects, but we warm it up at boot so we fail
// fast if the DB is unreachable.
// ─────────────────────────────────────────────────────────────

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// Graceful disconnect.
// ─────────────────────────────────────────────────────────────

export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('PostgreSQL connection closed');
  } catch (error) {
    logger.error('Error disconnecting PostgreSQL:', error);
  }
};

// Optional: readiness/liveness probe.
export const pingDB = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};