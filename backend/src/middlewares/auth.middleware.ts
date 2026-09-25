import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@utils/jwt.js';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '@utils/ApiError.js';
import { User } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user: User;
      token: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized');
    }

    const token = authHeader.replace('Bearer ', '');
    req.token = token;

    const decoded = verifyToken(token);

    const userId = Number(decoded.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new ApiError(401, 'Unauthorized');
    }

    // ═══════════════════════════════════════════════════════════
    // THE FIX: Use the `type` from the token to know exactly
    // which table to query.
    // ═══════════════════════════════════════════════════════════

    if (decoded.type === 'admin') {
      const admin = await prisma.admin.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });

      if (!admin) {
        throw new ApiError(401, 'Unauthorized');
      }

      req.user = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        type: 'admin',
      };
      return next();
    }

    // ── Default to staff ──
    const staff = await prisma.staff.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        status: true, isEmailVerified: true,
      },
    });

    if (!staff) {
      throw new ApiError(401, 'Unauthorized');
    }

    req.user = {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      type: 'staff',
      status: staff.status,
      isEmailVerified: staff.isEmailVerified,
    };
    return next();

  } catch (error) {
    next(error);
  }
};

export default authMiddleware;