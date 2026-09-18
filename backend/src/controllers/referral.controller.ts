import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as referralService from '@services/referral.service.js';

// ─────────────────────────────────────────────────────────────
// Request a referral
// ─────────────────────────────────────────────────────────────
export const requestReferral = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const result = await referralService.createReferral(
    patientId,
    req.body,
    req.user.id,
  );
  return SuccessResponse(201, 'Referral requested successfully', result);
});

// ─────────────────────────────────────────────────────────────
// List referrals for a patient
// ─────────────────────────────────────────────────────────────
export const getReferrals = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const { status, page, limit } = req.query;
  const result = await referralService.getReferrals(
    patientId,
    status as string,
    page ? parseInt(page as string) : 1,
    limit ? parseInt(limit as string) : 20,
  );
  return SuccessResponse(200, 'OK', result);
});

// ─────────────────────────────────────────────────────────────
// Get one referral
// ─────────────────────────────────────────────────────────────
export const getReferralById = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const referralId = req.params.referralId as string;
  const result = await referralService.getReferralById(patientId, referralId);
  return SuccessResponse(200, 'OK', result);
});

// ─────────────────────────────────────────────────────────────
// Update referral (author only, pending status only)
// ─────────────────────────────────────────────────────────────
export const updateReferral = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const referralId = req.params.referralId as string;
  const result = await referralService.updateReferral(
    patientId,
    referralId,
    req.body,
    req.user.id,
  );
  return SuccessResponse(200, 'Referral updated successfully', result);
});

export default {
  requestReferral,
  getReferrals,
  getReferralById,
  updateReferral,
};