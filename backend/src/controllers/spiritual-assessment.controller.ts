import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as spiritualService from '@services/spiritual-assessment.service.js';

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createSpiritualAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const result = await spiritualService.createSpiritualAssessment(
      patientId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(201, 'Spiritual assessment saved', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getSpiritualAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await spiritualService.getSpiritualAssessments(
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
export const getAllSpiritualAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const includeDeleted = req.query.includeDeleted === 'true';

    const result = await spiritualService.getAllSpiritualAssessments(
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
export const getSpiritualAssessmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await spiritualService.getSpiritualAssessmentById(
      patientId,
      assessmentId,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

// ═════════════════════════════════════════════════════════════
// UPDATE — admin only
// ═════════════════════════════════════════════════════════════
export const updateSpiritualAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await spiritualService.updateSpiritualAssessment(
      patientId,
      assessmentId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(200, 'Spiritual assessment updated', result);
  },
);

// ═════════════════════════════════════════════════════════════
// SOFT DELETE — admin only
// ═════════════════════════════════════════════════════════════
export const deleteSpiritualAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;
    const { reason } = req.body ?? {};

    const result = await spiritualService.deleteSpiritualAssessment(
      patientId,
      assessmentId,
      req.user.id,
      reason,
    );
    return SuccessResponse(200, 'Spiritual assessment deleted', result);
  },
);

// ═════════════════════════════════════════════════════════════
// RESTORE — admin only
// ═════════════════════════════════════════════════════════════
export const restoreSpiritualAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await spiritualService.restoreSpiritualAssessment(
      patientId,
      assessmentId,
      req.user.id,
    );
    return SuccessResponse(200, 'Spiritual assessment restored', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST DELETED — admin only
// ═════════════════════════════════════════════════════════════
export const getDeletedSpiritualAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await spiritualService.getDeletedSpiritualAssessments(
      page,
      limit,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

export default {
  createSpiritualAssessment,
  getSpiritualAssessments,
  getAllSpiritualAssessments,
  getSpiritualAssessmentById,
  updateSpiritualAssessment,
  deleteSpiritualAssessment,
  restoreSpiritualAssessment,
  getDeletedSpiritualAssessments,
};