import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as adminService from '@services/admin.service.js';
import * as visitService from '@services/visit.service.js';

// ─────────────────────────────────────────────────────────────
// Staff Management
// ─────────────────────────────────────────────────────────────

export const getPendingStaff = asyncHandler(async (_req: Request, res: Response) => {
  const result = await adminService.getPendingStaff();
  return SuccessResponse(200, 'OK', result);
});

export const approveStaff = asyncHandler(async (req: Request, res: Response) => {
  const staffId = req.params.staffId as string;
  const { role } = req.body;
  const result = await adminService.approveStaff(staffId, role, req.user.id);
  return SuccessResponse(200, 'Staff approved successfully', result);
});

export const rejectStaff = asyncHandler(async (req: Request, res: Response) => {
  const staffId = req.params.staffId as string;
  const result = await adminService.rejectStaff(staffId);
  return SuccessResponse(200, 'Staff registration rejected', result);
});

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const result = await adminService.getDashboardStats();
  return SuccessResponse(200, 'OK', result);
});

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const read = req.query.read as string | undefined;
  const result = await adminService.getNotifications(limit, read);
  return SuccessResponse(200, 'OK', result);
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notificationId = req.params.notificationId as string;
  const result = await adminService.markNotificationRead(notificationId);
  return SuccessResponse(200, 'Notification marked as read', result);
});

// ─────────────────────────────────────────────────────────────
// Patient Management
// ─────────────────────────────────────────────────────────────

export const getPatients = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  const result = await adminService.getPatients(page, limit, status, search);
  return SuccessResponse(200, 'OK', result);
});

export const getPatientDetail = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const result = await adminService.getPatientDetail(patientId);
  return SuccessResponse(200, 'OK', result);
});

export const closeCase = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const { reason } = req.body;
  const result = await adminService.closeCase(patientId, reason, req.user.id);
  return SuccessResponse(200, 'Patient case closed successfully', result);
});

// ─────────────────────────────────────────────────────────────
// Referral Management
// ─────────────────────────────────────────────────────────────

export const getPendingReferrals = asyncHandler(async (_req: Request, res: Response) => {
  const result = await adminService.getPendingReferrals();
  return SuccessResponse(200, 'OK', result);
});

export const approveReferral = asyncHandler(async (req: Request, res: Response) => {
  const referralId = req.params.referralId as string;
  const result = await adminService.approveReferral(referralId, req.user.id);
  return SuccessResponse(200, 'Referral approved', result);
});

export const declineReferral = asyncHandler(async (req: Request, res: Response) => {
  const referralId = req.params.referralId as string;
  const result = await adminService.declineReferral(referralId);
  return SuccessResponse(200, 'Referral declined', result);
});

// ─────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const result = await adminService.getReports(startDate, endDate);
  return SuccessResponse(200, 'OK', result);
});

// ─────────────────────────────────────────────────────────────
// Admin Visit Edit / Delete / Restore (delegates to visit.service)
// ─────────────────────────────────────────────────────────────

export const updateVisit = asyncHandler(async (req: Request, res: Response) => {
  const visitId = req.params.visitId as string;
  const result = await visitService.updateVisit(visitId, req.body, req.user.id);
  return SuccessResponse(200, 'Visit updated successfully', result);
});

export const deleteVisit = asyncHandler(async (req: Request, res: Response) => {
  const visitId = req.params.visitId as string;
  const { reason } = req.body;
  const result = await visitService.deleteVisit(visitId, req.user.id, reason);
  return SuccessResponse(200, 'Visit deleted', result);
});

export const restoreVisit = asyncHandler(async (req: Request, res: Response) => {
  const visitId = req.params.visitId as string;
  const result = await visitService.restoreVisit(visitId, req.user.id);
  return SuccessResponse(200, 'Visit restored', result);
});

// ─────────────────────────────────────────────────────────────
// Staff Management — Active Staff
// ─────────────────────────────────────────────────────────────

export const getStaffList = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const status = req.query.status as
    | 'Active' | 'Pending' | 'Rejected' | 'Deleted' | 'All' | undefined;
  const role = req.query.role as
    | 'TeamLeader' | 'Physician' | 'Nurse' | undefined;
  const search = req.query.search as string | undefined;

  const result = await adminService.getStaffList(page, limit, {
    status,
    role,
    search,
  });
  return SuccessResponse(200, 'OK', result);
});

export const getStaffById = asyncHandler(async (req: Request, res: Response) => {
  const staffId = req.params.staffId as string;
  // Admins viewing a specific staff member always include deleted
  // so the UI can show a "Restore" button on deleted records.
  const result = await adminService.getStaffById(staffId, true);
  return SuccessResponse(200, 'OK', result);
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const staffId = req.params.staffId as string;
  const result = await adminService.updateStaff(staffId, req.body, req.user.id);
  return SuccessResponse(200, 'Staff member updated successfully', result);
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  const staffId = req.params.staffId as string;
  const reason = req.body?.reason as string | undefined;
  const result = await adminService.deleteStaff(staffId, req.user.id, reason);
  return SuccessResponse(200, 'Staff member deleted', result);
});

export const restoreStaff = asyncHandler(async (req: Request, res: Response) => {
  const staffId = req.params.staffId as string;
  const result = await adminService.restoreStaff(staffId, req.user.id);
  return SuccessResponse(200, 'Staff member restored', result);
});

export default {
  getPendingStaff,
  approveStaff,
  rejectStaff,
  getDashboardStats,
  getNotifications,
  markNotificationRead,
  getPatients,
  getPatientDetail,
  closeCase,
  getPendingReferrals,
  approveReferral,
  declineReferral,
  getReports,
  updateVisit,
  deleteVisit,
  restoreVisit,
  getStaffList,
  getStaffById,
  updateStaff,
  deleteStaff,
  restoreStaff
};