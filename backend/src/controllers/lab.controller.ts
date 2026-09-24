import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as labService from '@services/lab.service.js';
import type { LabCategory } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// Order a lab test
// ─────────────────────────────────────────────────────────────
export const orderLabTest = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const result = await labService.orderLabTest(patientId, req.body, req.user.id);
  return SuccessResponse(201, 'Lab test ordered successfully', result);
});
export const getAllLabTests = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const status = req.query.status as string | undefined;
    const category = req.query.category as LabCategory | undefined;
    const priority = req.query.priority as
      | 'Routine'
      | 'Urgent'
      | 'Emergency'
      | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const includeDeleted = req.query.includeDeleted === 'true';

    const result = await labService.getAllLabTests(
      patientId,
      status,
      page,
      limit,
      { category, priority, includeDeleted },
    );
    return SuccessResponse(200, 'OK', result);
  },
);
// ─────────────────────────────────────────────────────────────
// List lab tests for a patient
// ─────────────────────────────────────────────────────────────
export const getLabTests = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;

  const status = req.query.status as string | undefined;
  const category = req.query.category as LabCategory | undefined;
  const priority = req.query.priority as 'Routine' | 'Urgent' | 'Emergency' | undefined;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  const result = await labService.getLabTests(
    patientId,
    status,
    page,
    limit,
    { category, priority },
  );

  return SuccessResponse(200, 'OK', result);
});

// ─────────────────────────────────────────────────────────────
// Get one lab test
// ─────────────────────────────────────────────────────────────
export const getLabTestById = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const labId = req.params.labId as string;
  const result = await labService.getLabTestById(patientId, labId);
  return SuccessResponse(200, 'OK', result);
});

// ─────────────────────────────────────────────────────────────
// Update lab result
// ─────────────────────────────────────────────────────────────
export const updateLabResult = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const labId = req.params.labId as string;
  const result = await labService.updateLabResult(
    patientId,
    labId,
    req.body,
    req.user.id,
  );
  return SuccessResponse(200, 'Lab test result updated', result);
});

// ─────────────────────────────────────────────────────────────
// Cancel a lab test (before result entry)
// ─────────────────────────────────────────────────────────────
export const cancelLabTest = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const labId = req.params.labId as string;
  const result = await labService.cancelLabTest(patientId, labId, req.user.id);
  return SuccessResponse(200, 'Lab test cancelled', result);
});

// ─────────────────────────────────────────────────────────────
// Soft delete (admin only)
// ─────────────────────────────────────────────────────────────
export const deleteLabTest = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const labId = req.params.labId as string;
  const { reason } = req.body ?? {};
  const result = await labService.deleteLabTest(
    patientId,
    labId,
    req.user.id,
    reason,
  );
  return SuccessResponse(200, 'Lab test deleted', result);
});

// ─────────────────────────────────────────────────────────────
// Restore (admin only)
// ─────────────────────────────────────────────────────────────
export const restoreLabTest = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const labId = req.params.labId as string;
  const result = await labService.restoreLabTest(patientId, labId, req.user.id);
  return SuccessResponse(200, 'Lab test restored', result);
});

export const getPendingRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const result = await labService.getPendingLabRequests(page, limit);
    return SuccessResponse(200, 'OK', result);
  },
);

export const getRequestDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const labId = req.params.id as string;
    const result = await labService.getLabRequestById(labId);
    return SuccessResponse(200, 'OK', result);
  },
);

export const enterResult = asyncHandler(
  async (req: Request, res: Response) => {
    const labId = req.params.id as string;
    const result = await labService.enterLabResultFromQueue(
      labId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(200, 'Lab result entered', result);
  },
);

export default {
  getAllLabTests,
  orderLabTest,
  getLabTests,
  getLabTestById,
  updateLabResult,
  cancelLabTest,
  deleteLabTest,
  restoreLabTest,
  getPendingRequests,
  getRequestDetail,
  enterResult,
};