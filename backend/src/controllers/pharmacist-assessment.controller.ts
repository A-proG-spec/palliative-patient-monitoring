import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as pharmacistService from '@services/pharmacist-assessment.service.js';

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createPharmacistAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const result = await pharmacistService.createPharmacistAssessment(
      patientId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(201, 'Pharmacist assessment saved', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST (per patient, active only)
// ═════════════════════════════════════════════════════════════
export const getPharmacistAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await pharmacistService.getPharmacistAssessments(
      patientId,
      page,
      limit,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST ALL (active + deleted, admin view)
// ═════════════════════════════════════════════════════════════
export const getAllPharmacistAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const includeDeleted = req.query.includeDeleted === 'true';

    const result = await pharmacistService.getAllPharmacistAssessments(
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
export const getPharmacistAssessmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await pharmacistService.getPharmacistAssessmentById(
      patientId,
      assessmentId,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

// ═════════════════════════════════════════════════════════════
// UPDATE — admin only
// ═════════════════════════════════════════════════════════════
export const updatePharmacistAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await pharmacistService.updatePharmacistAssessment(
      patientId,
      assessmentId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(200, 'Pharmacist assessment updated', result);
  },
);

// ═════════════════════════════════════════════════════════════
// SOFT DELETE — admin only
// ═════════════════════════════════════════════════════════════
export const deletePharmacistAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;
    const { reason } = req.body ?? {};

    const result = await pharmacistService.deletePharmacistAssessment(
      patientId,
      assessmentId,
      req.user.id,
      reason,
    );
    return SuccessResponse(200, 'Pharmacist assessment deleted', result);
  },
);

// ═════════════════════════════════════════════════════════════
// RESTORE — admin only
// ═════════════════════════════════════════════════════════════
export const restorePharmacistAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const assessmentId = req.params.assessmentId as string;

    const result = await pharmacistService.restorePharmacistAssessment(
      patientId,
      assessmentId,
      req.user.id,
    );
    return SuccessResponse(200, 'Pharmacist assessment restored', result);
  },
);

// ═════════════════════════════════════════════════════════════
// LIST DELETED — admin only, global (not per-patient)
// ═════════════════════════════════════════════════════════════
export const getDeletedPharmacistAssessments = asyncHandler(
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await pharmacistService.getDeletedPharmacistAssessments(
      page,
      limit,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

export default {
  createPharmacistAssessment,
  getPharmacistAssessments,
  getAllPharmacistAssessments,
  getPharmacistAssessmentById,
  updatePharmacistAssessment,
  deletePharmacistAssessment,
  restorePharmacistAssessment,
  getDeletedPharmacistAssessments,
};