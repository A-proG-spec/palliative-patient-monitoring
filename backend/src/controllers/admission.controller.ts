import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as admissionService from '@services/admission.service.js';

export const recordAdmission = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string; 
  const result = await admissionService.recordAdmission(patientId, req.body, req.user.id);
  return SuccessResponse(201, 'Admission recorded successfully', result);
});

export const getAdmissions = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string; 
  const status = req.query.status as string | undefined;
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const result = await admissionService.getAdmissions(patientId, status, page, limit);
  return SuccessResponse(200, 'OK', result);
});

export const getAdmissionById = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string; 
  const admissionId = req.params.admissionId as string; 
  const result = await admissionService.getAdmissionById(patientId, admissionId);
  return SuccessResponse(200, 'OK', result);
});

export const updateAdmission = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string; 
  const admissionId = req.params.admissionId as string; 
  const result = await admissionService.updateAdmission(patientId, admissionId, req.body, req.user.id);
  return SuccessResponse(200, 'Admission updated successfully', result);
});

export default {
  recordAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
};