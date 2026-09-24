import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as familyService from '@services/family-assessment.service.js';

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createFamilyAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const result = await familyService.createFamilyAssessment(
      patientId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(201, 'Family assessment saved', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getFamilyAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await familyService.getFamilyAssessments(
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
export const getAllFamilyAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const includeDeleted = req.query.includeDeleted === 'true';

    const result = await familyService.getAllFamilyAssessments(
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
export const getFamilyAssessmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await familyService.getFamilyAssessmentById(
      patientId,
      assessmentId,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

// ═════════════════════════════════════════════════════════════
// UPDATE — admin only
// ═════════════════════════════════════════════════════════════
export const updateFamilyAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await familyService.updateFamilyAssessment(
      patientId,
      assessmentId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(200, 'Family assessment updated', result);
  },
);

// ═════════════════════════════════════════════════════════════
// SOFT DELETE — admin only
// ═════════════════════════════════════════════════════════════
export const deleteFamilyAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;
    const { reason } = req.body ?? {};

    const result = await familyService.deleteFamilyAssessment(
      patientId,
      assessmentId,
      req.user.id,
      reason,
    );
    return SuccessResponse(200, 'Family assessment deleted', result);
  },
);

// ═════════════════════════════════════════════════════════════
// RESTORE — admin only
// ═════════════════════════════════════════════════════════════
export const restoreFamilyAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await familyService.restoreFamilyAssessment(
      patientId,
      assessmentId,
      req.user.id,
    );
    return SuccessResponse(200, 'Family assessment restored', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST DELETED — admin only
// ═════════════════════════════════════════════════════════════
export const getDeletedFamilyAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await familyService.getDeletedFamilyAssessments(
      page,
      limit,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

export default {
  createFamilyAssessment,
  getFamilyAssessments,
  getAllFamilyAssessments,
  getFamilyAssessmentById,
  updateFamilyAssessment,
  deleteFamilyAssessment,
  restoreFamilyAssessment,
  getDeletedFamilyAssessments,
};