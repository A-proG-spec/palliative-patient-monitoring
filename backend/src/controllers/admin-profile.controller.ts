import type { Request, Response, NextFunction } from 'express';
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdminActivityStats,
} from '../services/admin-profile.service';
import type {
  UpdateAdminProfileBody,
  ChangeAdminPasswordBody,
} from '../schemas/admin-profile.schema';
import { ApiError } from '@utils/ApiError.js';
// ═════════════════════════════════════════════════════════════
// Helper — extract the authenticated admin id
//
// The `authenticate` middleware is expected to have populated
// `req.user` with `{ id, type }`. Admins have `type === 'admin'`.
// ═════════════════════════════════════════════════════════════

interface AuthenticatedUser {
  id: number;
  type: 'staff' | 'admin';
}

function getAdminId(req: Request): number {
  const user = (req as Request & { user?: AuthenticatedUser }).user;

  if (!user) {
    throw new ApiError(401, 'Not authenticated');
  }

  if (user.type !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  return user.id;
}
// ═════════════════════════════════════════════════════════════
// GET /admin/profile
// ═════════════════════════════════════════════════════════════

export async function getAdminProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = getAdminId(req);
    const profile = await getAdminProfile(adminId);

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Admin profile fetched',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

// ═════════════════════════════════════════════════════════════
// PUT /admin/profile
// ═════════════════════════════════════════════════════════════

export async function updateAdminProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = getAdminId(req);
    const body = req.body as UpdateAdminProfileBody;

    const profile = await updateAdminProfile(adminId, body);

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Admin profile updated',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

// ═════════════════════════════════════════════════════════════
// PUT /admin/profile/password
// ═════════════════════════════════════════════════════════════

export async function changeAdminPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = getAdminId(req);
    const body = req.body as ChangeAdminPasswordBody;

    const result = await changeAdminPassword(adminId, body);

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Password changed successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// ═════════════════════════════════════════════════════════════
// GET /admin/profile/activity
// ═════════════════════════════════════════════════════════════

export async function getAdminActivityStatsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = getAdminId(req);
    const stats = await getAdminActivityStats(adminId);

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Admin activity stats fetched',
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}