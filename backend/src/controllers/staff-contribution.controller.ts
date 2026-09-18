import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as contributionService from '@services/staff-contribution.service.js';
import type { ContributionCategory } from '@services/staff-contribution.service.js';

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/staff/:staffId/contributions/summary
// ─────────────────────────────────────────────────────────────
export const getStaffContributionSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const staffId = req.params.staffId as string;
    const result = await contributionService.getStaffContributionSummary(staffId);
    return SuccessResponse(200, 'OK', result);
  },
);

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/staff/:staffId/contributions/:category
// ─────────────────────────────────────────────────────────────
export const getStaffContributionDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const staffId = req.params.staffId as string;
    const category = req.params.category as ContributionCategory;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await contributionService.getStaffContributionDetail(
      staffId,
      category,
      page,
      limit,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

export default {
  getStaffContributionSummary,
  getStaffContributionDetail,
};