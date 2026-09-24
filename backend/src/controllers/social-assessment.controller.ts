import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as socialService from '@services/social-assessment.service.js';

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createSocialAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const result = await socialService.createSocialAssessment(
      patientId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(201, 'Social assessment saved', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getSocialAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await socialService.getSocialAssessments(
      patientId,
      page,
      limit,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST ALL
// ═════════════════════════════════════════════════════════════
export const getAllSocialAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const includeDeleted = req.query.includeDeleted === 'true';

    const result = await socialService.getAllSocialAssessments(
      patientId,
      page,
      limit,
      includeDeleted,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

// ═════════════════════════════════════════════════════════════
// GET ONE
// ═════════════════════════════════════════════════════════════
export const getSocialAssessmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await socialService.getSocialAssessmentById(
      patientId,
      assessmentId,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

// ═════════════════════════════════════════════════════════════
// UPDATE — admin only
// ═════════════════════════════════════════════════════════════
export const updateSocialAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await socialService.updateSocialAssessment(
      patientId,
      assessmentId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(200, 'Social assessment updated', result);
  },
);

// ═════════════════════════════════════════════════════════════
// SOFT DELETE — admin only
// ═════════════════════════════════════════════════════════════
export const deleteSocialAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;
    const { reason } = req.body ?? {};

    const result = await socialService.deleteSocialAssessment(
      patientId,
      assessmentId,
      req.user.id,
      reason,
    );
    return SuccessResponse(200, 'Social assessment deleted', result);
  },
);

// ═════════════════════════════════════════════════════════════
// RESTORE — admin only
// ═════════════════════════════════════════════════════════════
export const restoreSocialAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await socialService.restoreSocialAssessment(
      patientId,
      assessmentId,
      req.user.id,
    );
    return SuccessResponse(200, 'Social assessment restored', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST DELETED — admin only
// ═════════════════════════════════════════════════════════════
export const getDeletedSocialAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await socialService.getDeletedSocialAssessments(page, limit);
    return SuccessResponse(200, 'OK', result);
  },
);

export default {
  createSocialAssessment,
  getSocialAssessments,
  getAllSocialAssessments,
  getSocialAssessmentById,
  updateSocialAssessment,
  deleteSocialAssessment,
  restoreSocialAssessment,
  getDeletedSocialAssessments,
};