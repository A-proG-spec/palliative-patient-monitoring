import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  getAssignedPatientsQuerySchema,
  getUpcomingVisitsQuerySchema,
  getRecentVisitsQuerySchema,
  getAlertsQuerySchema,
  markAlertReadParamsSchema,
} from '@schemas/staff.schema.js';
import * as staffController from '@controllers/staff.controller.js';

const router = Router();

// All staff routes require authentication
router.use(authMiddleware);

router.get('/dashboard/stats', staffController.getDashboardStats);

router.get(
  '/patients',
  validate(getAssignedPatientsQuerySchema),
  staffController.getVisitedPatients
);

router.get(
  '/visits/upcoming',
  validate(getUpcomingVisitsQuerySchema),
  staffController.getUpcomingVisits
);

router.get(
  '/visits/recent',
  validate(getRecentVisitsQuerySchema),
  staffController.getRecentVisits
);

router.get(
  '/alerts',
  validate(getAlertsQuerySchema),
  staffController.getAlerts
);

router.put(
  '/alerts/:alertId/read',
  validate(markAlertReadParamsSchema),
  staffController.markAlertRead
);

export default router;