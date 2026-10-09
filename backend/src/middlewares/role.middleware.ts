import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/ApiError.js';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Admins may access protected clinical workflows regardless of staff role.
    if (req.user.type === 'admin') {
      return next();
    }

    // ── Staff with a specific role ──
    if (
      req.user.type === 'staff' &&
      req.user.role &&
      allowedRoles.includes(req.user.role)
    ) {
      return next();
    }

    // ── Staff with no role yet, but 'staff' is allowed (any role) ──
    if (req.user.type === 'staff' && allowedRoles.includes('staff')) {
      return next();
    }

    throw new ApiError(403, 'Forbidden');
  };
};

export default roleMiddleware;