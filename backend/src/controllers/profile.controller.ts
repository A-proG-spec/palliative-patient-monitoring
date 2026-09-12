import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as profileService from '@services/profile.service.js';

// ─────────────────────────────────────────────────────────────
// GET /api/v1/profile
// ─────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await profileService.getProfile(req.user.id, req.user.type);
  return SuccessResponse(200, 'OK', result);
});

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/profile
// ─────────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await profileService.updateProfile(
    req.user.id,
    req.user.type,
    req.body,
  );
  return SuccessResponse(200, 'Profile updated successfully', result);
});

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/profile/password
// ─────────────────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const result = await profileService.changePassword(
    req.user.id,
    req.user.type,
    currentPassword,
    newPassword,
  );
  return SuccessResponse(200, 'Password changed successfully', result);
});

// ─────────────────────────────────────────────────────────────
// GET /api/v1/profile/activity
// ─────────────────────────────────────────────────────────────
export const getActivityStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await profileService.getActivityStats(
    req.user.id,
    req.user.type,
  );
  return SuccessResponse(200, 'OK', result);
});

export default {
  getProfile,
  updateProfile,
  changePassword,
  getActivityStats,
};