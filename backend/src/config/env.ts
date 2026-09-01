import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  MONGODB_URI: z.string().default('mongodb://localhost:27017/palliative-care'),

  // JWT
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRE: z.string().default('7d'),

  // Password
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),

  // Email Configuration
  GMAIL_USER: z.string().min(1, 'GMAIL_USER is required for email verification'),
  GMAIL_APP_PASSWORD: z.string().min(1, 'GMAIL_APP_PASSWORD is required for email verification'),
  EMAIL_FROM: z.string().default('noreply@yourdomain.com'),
  VERIFICATION_TOKEN_EXPIRY: z.coerce.number().default(86400),

  // Frontend URL
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // Admin Seed
  ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  ADMIN_PASSWORD: z.string().min(8).default('adminpassword'),
  ADMIN_NAME: z.string().default('Admin User'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

export default env;