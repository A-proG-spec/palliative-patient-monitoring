import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as dischargeService from '@services/discharge.service.js';

export const createDischargeSummary = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const result = await dischargeService.createDischargeSummary(patientId, req.body, req.user.id);
  return SuccessResponse(201, 'Discharge summary saved successfully', result);
});

export const getDischargeSummaryByPatient = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const result = await dischargeService.getDischargeSummaryByPatient(patientId);
  return SuccessResponse(200, 'OK', result);
});

export const updateDischargeSummary = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const summaryId = req.params.summaryId as string;
  const result = await dischargeService.updateDischargeSummary(patientId, summaryId, req.body, req.user.id);
  return SuccessResponse(200, 'Discharge summary updated successfully', result);
});

export const finalizeDischargeSummary = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const summaryId = req.params.summaryId as string;
  const result = await dischargeService.finalizeDischargeSummary(patientId, summaryId);
  return SuccessResponse(200, 'Discharge summary finalized', result);
});

export const deleteDischargeSummary = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const summaryId = req.params.summaryId as string;
  const result = await dischargeService.deleteDischargeSummary(patientId, summaryId);
  return SuccessResponse(200, 'Discharge summary deleted', result);
});

export default {
  createDischargeSummary,
  getDischargeSummaryByPatient,
  updateDischargeSummary,
  finalizeDischargeSummary,
  deleteDischargeSummary,
};