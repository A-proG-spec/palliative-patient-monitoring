import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as patientService from '@services/patient.service.js';

export const registerPatient = asyncHandler(async (req: Request, res: Response) => {
  const result = await patientService.registerPatient(req.body, req.user.id);
  return SuccessResponse(201, 'Patient registered successfully', result);
});

export const getPatients = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, search } = req.query;
  const result = await patientService.getPatients(
    req.user.id,
    page ? parseInt(page as string) : 1,
    limit ? parseInt(limit as string) : 20,
    status as string,
    search as string
  );
  return SuccessResponse(200, 'OK', result);
});

export const getPatientById = asyncHandler(async (req: Request, res: Response) => {
 const patientId = req.params.patientId as string;
  const result = await patientService.getPatientById(patientId);
  return SuccessResponse(200, 'OK', result);
});

export const getPatientSummary = asyncHandler(async (req: Request, res: Response) => {
 const patientId = req.params.patientId as string;
  const result = await patientService.getPatientSummary(patientId);
  return SuccessResponse(200, 'OK', result);
});

export const getPatientProgress = asyncHandler(async (req: Request, res: Response) => {
 const patientId = req.params.patientId as string;
  const result = await patientService.getPatientProgress(patientId);
  return SuccessResponse(200, 'OK', result);
});

export default {
  registerPatient,
  getPatients,
  getPatientById,
  getPatientSummary,
  getPatientProgress,
};