import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import { rateLimiter } from '@middlewares/rateLimiter.middleware.js';
import {
  approveStaffSchema,
  closeCaseSchema,
  getNotificationsQuerySchema,
  getAdminPatientsQuerySchema,
  getReportsQuerySchema,
} from '@schemas/admin.schema.js';
import * as adminController from '@controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));
router.use(rateLimiter);

// Staff Management
router.get('/staff/pending', adminController.getPendingStaff);
router.put(
  '/staff/:staffId/approve',
  validate(approveStaffSchema),
  adminController.approveStaff
);
router.put('/staff/:staffId/reject', adminController.rejectStaff);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get(
  '/dashboard/notifications',
  validate(getNotificationsQuerySchema),
  adminController.getNotifications
);
router.put(
  '/dashboard/notifications/:notificationId/read',
  adminController.markNotificationRead
);

// Patient Management
router.get(
  '/patients',
  validate(getAdminPatientsQuerySchema),
  adminController.getPatients
);
router.get('/patients/:patientId', adminController.getPatientDetail);
router.put(
  '/patients/:patientId/close-case',
  validate(closeCaseSchema),
  adminController.closeCase
);

// Referral Management
router.get('/referrals/pending', adminController.getPendingReferrals);
router.put('/referrals/:referralId/approve', adminController.approveReferral);
router.put('/referrals/:referralId/decline', adminController.declineReferral);

// Reports
router.get(
  '/reports',
  validate(getReportsQuerySchema),
  adminController.getReports
);

export default router;