import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as labService from '@services/lab.service.js';

export const orderLabTest = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const result = await labService.orderLabTest(patientId, req.body, req.user.id);
  return SuccessResponse(201, 'Lab test ordered successfully', result);
});

export const getLabTests = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const status = req.query.status as string | undefined;
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const result = await labService.getLabTests(patientId, status, page, limit);
  return SuccessResponse(200, 'OK', result);
});

export const getLabTestById = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const labId = req.params.labId as string;
  const result = await labService.getLabTestById(patientId, labId);
  return SuccessResponse(200, 'OK', result);
});

export const updateLabResult = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const labId = req.params.labId as string;
  const result = await labService.updateLabResult(patientId, labId, req.body, req.user.id);
  return SuccessResponse(200, 'Lab test result updated', result);
});

// ── Soft delete (admin only) ──
export const deleteLabTest = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const labId = req.params.labId as string;
  const { reason } = req.body;
  const result = await labService.deleteLabTest(patientId, labId, req.user.id, reason);
  return SuccessResponse(200, 'Lab test deleted', result);
});

// ── Restore (admin only) ──
export const restoreLabTest = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const labId = req.params.labId as string;
  const result = await labService.restoreLabTest(patientId, labId, req.user.id);
  return SuccessResponse(200, 'Lab test restored', result);
});

export default {
  orderLabTest,
  getLabTests,
  getLabTestById,
  updateLabResult,
  deleteLabTest,
  restoreLabTest,
};