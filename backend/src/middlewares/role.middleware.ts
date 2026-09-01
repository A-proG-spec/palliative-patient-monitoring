import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/ApiError.js';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {  // ✅ Added underscore
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Admin has access to all routes
    if (req.user.type === 'admin' && allowedRoles.includes('admin')) {
      return next();
    }

    // Staff role check
    if (req.user.type === 'staff' && req.user.role && allowedRoles.includes(req.user.role)) {
      return next();
    }

    // If staff has no role but allowedRoles includes 'staff'
    if (req.user.type === 'staff' && allowedRoles.includes('staff')) {
      return next();
    }

    throw new ApiError(403, 'Forbidden');
  };
};

export default roleMiddleware;