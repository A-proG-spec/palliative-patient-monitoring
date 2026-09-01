import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as visitService from '@services/visit.service.js';

export const recordVisit = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;  // ✅ Fixed
  const result = await visitService.recordVisit(patientId, req.body);
  return SuccessResponse(201, 'Home visit recorded successfully', result);
});

export const getVisits = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;  // ✅ Fixed
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const result = await visitService.getVisits(patientId, page, limit);
  return SuccessResponse(200, 'OK', result);
});

export const getVisitById = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;  // ✅ Fixed
  const visitId = req.params.visitId as string;  // ✅ Fixed
  const result = await visitService.getVisitById(patientId, visitId);
  return SuccessResponse(200, 'OK', result);
});

export default {
  recordVisit,
  getVisits,
  getVisitById,
};