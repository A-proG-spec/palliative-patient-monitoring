import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@utils/jwt.js';
import { Staff } from '@models/Staff.js';
import { Admin } from '@models/Admin.js';
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
  _res: Response,  // ✅ Added underscore for unused parameter
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized');
    }

    const token = authHeader.replace('Bearer ', '');
    req.token = token;

    const decoded = verifyToken(token);

    // Try to find user as staff
    let user = await Staff.findById(decoded.id).select('-password');

    if (user) {
      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,  // ✅ Now works with null
        type: 'staff',
        status: user.status,
        isEmailVerified: user.isEmailVerified,
      };
      return next();
    }

    // Try to find user as admin
    let admin = await Admin.findById(decoded.id).select('-password');

    if (admin) {
      req.user = {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        type: 'admin',
      };
      return next();
    }

    throw new ApiError(401, 'Unauthorized');
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;