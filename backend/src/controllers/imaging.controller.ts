import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as imagingService from '@services/imaging.service.js';

// ═════════════════════════════════════════════════════════════
// PATIENT-SCOPED (existing)
// ═════════════════════════════════════════════════════════════

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
  const result = await imagingService.updateImagingReport(
    patientId,
    imagingId,
    req.body,
    req.user.id,
  );
  return SuccessResponse(200, 'Imaging report saved successfully', result);
});

export const recordImagingPerformed = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const imagingId = req.params.imagingId as string;
  const result = await imagingService.recordImagingPerformed(
    patientId,
    imagingId,
    req.body,
    req.user.id,
  );
  return SuccessResponse(200, 'Imaging department record saved', result);
});

export const updateImagingStatus = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const imagingId = req.params.imagingId as string;
  const { status } = req.body;
  const result = await imagingService.updateImagingStatus(
    patientId,
    imagingId,
    status,
    req.user.id,
  );
  return SuccessResponse(200, 'Imaging status updated', result);
});

// ── Soft delete (admin only) ──
export const deleteImagingOrder = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const imagingId = req.params.imagingId as string;
  const { reason } = req.body;
  const result = await imagingService.deleteImagingOrder(
    patientId,
    imagingId,
    req.user.id,
    reason,
  );
  return SuccessResponse(200, 'Imaging order deleted', result);
});

// ── Restore (admin only) ──
export const restoreImagingOrder = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const imagingId = req.params.imagingId as string;
  const result = await imagingService.restoreImagingOrder(
    patientId,
    imagingId,
    req.user.id,
  );
  return SuccessResponse(200, 'Imaging order restored', result);
});

// ═════════════════════════════════════════════════════════════
// RADIOLOGIST QUEUE
//
// NOTE: these routes are mounted at `/imaging/*` (top-level, not
// under `/patients/:patientId`). They are NOT patient-scoped so the
// radiologist can see every pending order across the system.
// ═════════════════════════════════════════════════════════════

// GET /imaging/pending-orders
export const getPendingOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 100;
    const result = await imagingService.getPendingImagingOrders(page, limit);
    return SuccessResponse(200, 'OK', result);
  },
);

// GET /imaging/queue/:id
export const getOrderDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const imagingId = req.params.id as string;
    const result = await imagingService.getImagingOrderDetailForQueue(imagingId);
    return SuccessResponse(200, 'OK', result);
  },
);

// PATCH /imaging/queue/:id/report
export const submitReport = asyncHandler(
  async (req: Request, res: Response) => {
    const imagingId = req.params.id as string;
    const result = await imagingService.submitImagingReportFromQueue(
      imagingId,
      req.body,
      req.user.id,
    );
    return SuccessResponse(200, 'Imaging report submitted', result);
  },
);

export default {
  // Patient-scoped
  orderImaging,
  getImagingOrders,
  getImagingOrderById,
  updateImagingReport,
  recordImagingPerformed,
  updateImagingStatus,
  deleteImagingOrder,
  restoreImagingOrder,
  // Radiologist queue
  getPendingOrders,
  getOrderDetail,
  submitReport,
};