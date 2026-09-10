import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as imagingService from '@services/imaging.service.js';

export const orderImaging = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const result = await imagingService.orderImaging(patientId, req.body, req.user.id);
  return SuccessResponse(201, 'Imaging order submitted successfully', result);
});

export const getImagingOrders = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const filters = {
    status: req.query.status as string | undefined,
    modality: req.query.modality as string | undefined,
    priority: req.query.priority as string | undefined,
  };
  const result = await imagingService.getImagingOrders(patientId, filters, page, limit);
  return SuccessResponse(200, 'OK', result);
});

export const getImagingOrderById = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const imagingId = req.params.imagingId as string;
  const result = await imagingService.getImagingOrderById(patientId, imagingId);
  return SuccessResponse(200, 'OK', result);
});

export const updateImagingReport = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const imagingId = req.params.imagingId as string;
  const result = await imagingService.updateImagingReport(patientId, imagingId, req.body, req.user.id);
  return SuccessResponse(200, 'Imaging report saved successfully', result);
});

export const recordImagingPerformed = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const imagingId = req.params.imagingId as string;
  const result = await imagingService.recordImagingPerformed(patientId, imagingId, req.body, req.user.id);
  return SuccessResponse(200, 'Imaging department record saved', result);
});

export const updateImagingStatus = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const imagingId = req.params.imagingId as string;
  const { status } = req.body;
  const result = await imagingService.updateImagingStatus(patientId, imagingId, status);
  return SuccessResponse(200, 'Imaging status updated', result);
});

export const deleteImagingOrder = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const imagingId = req.params.imagingId as string;
  const result = await imagingService.deleteImagingOrder(patientId, imagingId);
  return SuccessResponse(200, 'Imaging order deleted', result);
});

export default {
  orderImaging,
  getImagingOrders,
  getImagingOrderById,
  updateImagingReport,
  recordImagingPerformed,
  updateImagingStatus,
  deleteImagingOrder,
};