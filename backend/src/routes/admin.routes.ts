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
  getStaffListQuerySchema,
  updateStaffSchema,
  deleteStaffSchema,
} from '@schemas/admin.schema.js';
import { updateVisitSchema } from '@schemas/visit.schema.js';
import * as adminController from '@controllers/admin.controller.js';
import * as contributionController from '@controllers/staff-contribution.controller.js';
import {
  getStaffContributionParamsSchema,
  getStaffContributionDetailParamsSchema,
  getStaffContributionQuerySchema,
} from '@schemas/staff-contribution.schema.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));
router.use(rateLimiter);

// Staff Management

router.get('/staff/pending', adminController.getPendingStaff);

//  Active staff list + CRUD ──
router.get(
  '/staff',
  validate(getStaffListQuerySchema),
  adminController.getStaffList,
);
router.get('/staff/:staffId', adminController.getStaffById);
router.put(
  '/staff/:staffId',
  validate(updateStaffSchema),
  adminController.updateStaff,
);
router.delete(
  '/staff/:staffId',
  validate(deleteStaffSchema),
  adminController.deleteStaff,
);
router.post('/staff/:staffId/restore', adminController.restoreStaff);

// ── Existing approve / reject ──
router.put(
  '/staff/:staffId/approve',
  validate(approveStaffSchema),
  adminController.approveStaff,
);
router.put('/staff/:staffId/reject', adminController.rejectStaff);


// Dashboard

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get(
  '/dashboard/notifications',
  validate(getNotificationsQuerySchema),
  adminController.getNotifications,
);
router.put(
  '/dashboard/notifications/:notificationId/read',
  adminController.markNotificationRead,
);


// Patient Management

router.get(
  '/patients',
  validate(getAdminPatientsQuerySchema),
  adminController.getPatients,
);
router.get('/patients/:patientId', adminController.getPatientDetail);
router.put(
  '/patients/:patientId/close-case',
  validate(closeCaseSchema),
  adminController.closeCase,
);


// Referral Management

router.get('/referrals/pending', adminController.getPendingReferrals);
router.put('/referrals/:referralId/approve', adminController.approveReferral);
router.put('/referrals/:referralId/decline', adminController.declineReferral);


// Reports

router.get(
  '/reports',
  validate(getReportsQuerySchema),
  adminController.getReports,
);


// Visit Edit / Delete / Restore

router.put(
  '/visits/:visitId',
  validate(updateVisitSchema),
  adminController.updateVisit,
);
router.delete('/visits/:visitId', adminController.deleteVisit);
router.post('/visits/:visitId/restore', adminController.restoreVisit);

router.get(
  '/staff/:staffId/contributions/summary',
  validate(getStaffContributionParamsSchema),
  contributionController.getStaffContributionSummary,
);

router.get(
  '/staff/:staffId/contributions/:category',
  validate(
    getStaffContributionDetailParamsSchema.merge(getStaffContributionQuerySchema),
  ),
  contributionController.getStaffContributionDetail,
);

export default router;