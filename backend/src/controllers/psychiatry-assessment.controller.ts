import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as psychiatryService from '@services/psychiatry-assessment.service.js';

// ═════════════════════════════════════════════════════════════
// CREATE
//
// The service layer escalates HIGH suicide risk to a
// notification automatically — the controller stays thin.
// ═════════════════════════════════════════════════════════════
export const createPsychiatryAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const result = await psychiatryService.createPsychiatryAssessment(
      patientId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(201, 'Psychiatry assessment saved', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getPsychiatryAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await psychiatryService.getPsychiatryAssessments(
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
export const getAllPsychiatryAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const includeDeleted = req.query.includeDeleted === 'true';

    const result = await psychiatryService.getAllPsychiatryAssessments(
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
export const getPsychiatryAssessmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await psychiatryService.getPsychiatryAssessmentById(
      patientId,
      assessmentId,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

// ═════════════════════════════════════════════════════════════
// UPDATE — admin only
// ═════════════════════════════════════════════════════════════
export const updatePsychiatryAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await psychiatryService.updatePsychiatryAssessment(
      patientId,
      assessmentId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(200, 'Psychiatry assessment updated', result);
  },
);

// ═════════════════════════════════════════════════════════════
// SOFT DELETE — admin only
//
// 🚨 The service layer enforces an extra safety rule:
//   if the assessment has suicideRiskLevel = 'High',
//   a non-empty `reason` is REQUIRED.
// If the caller omits it, the service throws a 400.
// ═════════════════════════════════════════════════════════════
export const deletePsychiatryAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;
    const { reason } = req.body ?? {};

    const result = await psychiatryService.deletePsychiatryAssessment(
      patientId,
      assessmentId,
      req.user.id,
      reason,
    );
    return SuccessResponse(200, 'Psychiatry assessment deleted', result);
  },
);

// ═════════════════════════════════════════════════════════════
// RESTORE — admin only
// ═════════════════════════════════════════════════════════════
export const restorePsychiatryAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await psychiatryService.restorePsychiatryAssessment(
      patientId,
      assessmentId,
      req.user.id,
    );
    return SuccessResponse(200, 'Psychiatry assessment restored', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST DELETED — admin only
// ═════════════════════════════════════════════════════════════
export const getDeletedPsychiatryAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await psychiatryService.getDeletedPsychiatryAssessments(
      page,
      limit,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

export default {
  createPsychiatryAssessment,
  getPsychiatryAssessments,
  getAllPsychiatryAssessments,
  getPsychiatryAssessmentById,
  updatePsychiatryAssessment,
  deletePsychiatryAssessment,
  restorePsychiatryAssessment,
  getDeletedPsychiatryAssessments,
};