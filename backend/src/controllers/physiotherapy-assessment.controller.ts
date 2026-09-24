import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as physiotherapyService from '@services/physiotherapy-assessment.service.js';

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createPhysiotherapyAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const result = await physiotherapyService.createPhysiotherapyAssessment(
      patientId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(201, 'Physiotherapy assessment saved', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getPhysiotherapyAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await physiotherapyService.getPhysiotherapyAssessments(
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
export const getAllPhysiotherapyAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const includeDeleted = req.query.includeDeleted === 'true';

    const result = await physiotherapyService.getAllPhysiotherapyAssessments(
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
export const getPhysiotherapyAssessmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await physiotherapyService.getPhysiotherapyAssessmentById(
      patientId,
      assessmentId,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

// ═════════════════════════════════════════════════════════════
// UPDATE — admin only
// ═════════════════════════════════════════════════════════════
export const updatePhysiotherapyAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await physiotherapyService.updatePhysiotherapyAssessment(
      patientId,
      assessmentId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(200, 'Physiotherapy assessment updated', result);
  },
);

// ═════════════════════════════════════════════════════════════
// SOFT DELETE — admin only
// ═════════════════════════════════════════════════════════════
export const deletePhysiotherapyAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;
    const { reason } = req.body ?? {};

    const result = await physiotherapyService.deletePhysiotherapyAssessment(
      patientId,
      assessmentId,
      req.user.id,
      reason,
    );
    return SuccessResponse(200, 'Physiotherapy assessment deleted', result);
  },
);

// ═════════════════════════════════════════════════════════════
// RESTORE — admin only
// ═════════════════════════════════════════════════════════════
export const restorePhysiotherapyAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await physiotherapyService.restorePhysiotherapyAssessment(
      patientId,
      assessmentId,
      req.user.id,
    );
    return SuccessResponse(200, 'Physiotherapy assessment restored', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST DELETED — admin only
// ═════════════════════════════════════════════════════════════
export const getDeletedPhysiotherapyAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await physiotherapyService.getDeletedPhysiotherapyAssessments(
      page,
      limit,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

export default {
  createPhysiotherapyAssessment,
  getPhysiotherapyAssessments,
  getAllPhysiotherapyAssessments,
  getPhysiotherapyAssessmentById,
  updatePhysiotherapyAssessment,
  deletePhysiotherapyAssessment,
  restorePhysiotherapyAssessment,
  getDeletedPhysiotherapyAssessments,
};