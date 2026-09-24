import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as medicationService from '@services/medication.service.js';

export const orderMedication = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const result = await medicationService.orderMedication(patientId, req.body, req.user.id);
  return SuccessResponse(201, 'Medication ordered successfully', result);
});
export const getAllMedications = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const status = req.query.status as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const includeDeleted = req.query.includeDeleted === 'true';

    const result = await medicationService.getAllMedications(
      patientId,
      status,
      page,
      limit,
      includeDeleted,
    );
    return SuccessResponse(200, 'OK', result);
  },
);
export const getMedications = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const status = req.query.status as string | undefined;
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const result = await medicationService.getMedications(patientId, status, page, limit);
  return SuccessResponse(200, 'OK', result);
});

export const getMedicationById = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const medicationId = req.params.medicationId as string;
  const result = await medicationService.getMedicationById(patientId, medicationId);
  return SuccessResponse(200, 'OK', result);
});

export const updateMedicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const medicationId = req.params.medicationId as string;
  const { status } = req.body;
  const result = await medicationService.updateMedicationStatus(
    patientId,
    medicationId,
    status,
    req.user.id,
  );
  return SuccessResponse(200, 'Medication status updated', result);
});

// ── Soft delete (admin only) ──
export const deleteMedication = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const medicationId = req.params.medicationId as string;
  const { reason } = req.body;
  const result = await medicationService.deleteMedication(
    patientId,
    medicationId,
    req.user.id,
    reason,
  );
  return SuccessResponse(200, 'Medication deleted', result);
});

// ── Restore (admin only) ──
export const restoreMedication = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const medicationId = req.params.medicationId as string;
  const result = await medicationService.restoreMedication(
    patientId,
    medicationId,
    req.user.id,
  );
  return SuccessResponse(200, 'Medication restored', result);
});

// ─────────────────────────────────────────────────────────────
// Pharmacist queue — flat list across all patients
// ─────────────────────────────────────────────────────────────
export const getPendingOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 100;
    const result = await medicationService.getPendingMedicationOrders(
      page,
      limit,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

export const getOrderDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const medicationId = req.params.id as string;
    const result = await medicationService.getMedicationOrderById(medicationId);
    return SuccessResponse(200, 'OK', result);
  },
);

export const markOrderGiven = asyncHandler(
  async (req: Request, res: Response) => {
    const medicationId = req.params.id as string;
    const result = await medicationService.markMedicationGivenByQueue(
      medicationId,
      req.user.id,
    );
    return SuccessResponse(200, 'Medication marked as given', result);
  },
);

export default {
  getAllMedications,
  orderMedication,
  getMedications,
  getMedicationById,
  updateMedicationStatus,
  deleteMedication,
  restoreMedication,
  getPendingOrders,
  getOrderDetail,
  markOrderGiven,
};