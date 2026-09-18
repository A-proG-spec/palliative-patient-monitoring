import jwt from 'jsonwebtoken';
import env from '@config/env.js';

const JWT_SECRET = env.JWT_SECRET as string;
const JWT_EXPIRE = env.JWT_EXPIRE;

// ─────────────────────────────────────────────────────────────
// JWT payload
// `id` is stored as a STRING because JWT payloads must be
// JSON-safe scalars — but downstream it maps to a Postgres Int.
// ─────────────────────────────────────────────────────────────
export interface JwtPayload {
  id: string;      // string form of the numeric Prisma id
  email: string;
}

export const generateToken = (
  userId: number | string,
  email: string,
): string => {
  return jwt.sign(
    { id: String(userId), email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE } as jwt.SignOptions,
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export default { generateToken, verifyToken };