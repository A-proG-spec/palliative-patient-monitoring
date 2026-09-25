// backend/src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import env from '@config/env.js';

const JWT_SECRET = env.JWT_SECRET as string;
const JWT_EXPIRE = env.JWT_EXPIRE;

export interface JwtPayload {
  id: string;
  email: string;
  type: 'staff' | 'admin';  
}

export const generateToken = (
  userId: number | string,
  email: string,
  type: 'staff' | 'admin',  
): string => {
  return jwt.sign(
    { id: String(userId), email, type },   // <-- INCLUDE type
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE } as jwt.SignOptions,
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export default { generateToken, verifyToken };