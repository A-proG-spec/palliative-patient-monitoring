import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as staffService from '@services/staff.service.js';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await staffService.getDashboardStats(req.user.id);
  return SuccessResponse(200, 'OK', result);
});

export const getVisitedPatients = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  const result = await staffService.getVisitedPatients(
    req.user.id,
    page,
    limit,
    status,
    search
  );
  return SuccessResponse(200, 'OK', result);
});

export const getUpcomingVisits = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string) : 7;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const result = await staffService.getUpcomingVisits(
    req.user.id,
    days,
    limit
  );
  return SuccessResponse(200, 'OK', result);
});

export const getRecentVisits = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string) : 7;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const result = await staffService.getRecentVisits(
    req.user.id,
    days,
    limit
  );
  return SuccessResponse(200, 'OK', result);
});

export const getAlerts = asyncHandler(async (req: Request, res: Response) => {
  const read = req.query.read as string | undefined;
  const type = req.query.type as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const result = await staffService.getAlerts(
    req.user.id,
    read,
    type,
    limit
  );
  return SuccessResponse(200, 'OK', result);
});

export const markAlertRead = asyncHandler(async (req: Request, res: Response) => {
  const alertId = req.params.alertId as string;  // ✅ Fixed
  const result = await staffService.markAlertRead(alertId, req.user.id);
  return SuccessResponse(200, 'Alert marked as read', result);
});

export default {
  getDashboardStats,
  getVisitedPatients,
  getUpcomingVisits,
  getRecentVisits,
  getAlerts,
  markAlertRead,
};