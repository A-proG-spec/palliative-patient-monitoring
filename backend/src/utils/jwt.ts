import jwt from 'jsonwebtoken';
import env from '@config/env.js';

const JWT_SECRET = env.JWT_SECRET as string;
const JWT_EXPIRE = env.JWT_EXPIRE;

// ─────────────────────────────────────────────────────────────
// JWT payload
// `id` is stored as a STRING because JWT payloads must be
// JSON-safe scalars — but downstream it maps to a Postgres Int.
// `type` is optional for backwards compatibility with any
// tokens issued before it was added; middleware treats a
// missing type as 'staff'.
// ─────────────────────────────────────────────────────────────
export interface JwtPayload {
  id: string;
  email: string;
  type?: 'staff' | 'admin';
}

export const generateToken = (
  userId: number | string,
  email: string,
  userType?: 'staff' | 'admin',
): string => {
  const payload: JwtPayload = { id: String(userId), email };
  if (userType) payload.type = userType;

  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE } as jwt.SignOptions,
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export default { generateToken, verifyToken };