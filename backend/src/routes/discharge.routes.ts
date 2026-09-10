import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createDischargeSummarySchema,
  updateDischargeSummarySchema,
} from '@schemas/discharge.schema.js';
import * as dischargeController from '@controllers/discharge.controller.js';

const router = Router({ mergeParams: true });

// All discharge routes require authentication
router.use(authMiddleware);

// ── Create (also flips Patient + Admission to Discharged) ──
router.post(
  '/',
  validate(createDischargeSummarySchema),
  dischargeController.createDischargeSummary
);

// ── Read the latest discharge summary for the patient ──
router.get(
  '/',
  dischargeController.getDischargeSummaryByPatient
);

// ── Update (draft only — enforced in service) ──
router.put(
  '/:summaryId',
  validate(updateDischargeSummarySchema),
  dischargeController.updateDischargeSummary
);

// ── Finalize (Draft → Final) ──
router.put(
  '/:summaryId/finalize',
  dischargeController.finalizeDischargeSummary
);

// ── Delete (admin only) ──
router.delete(
  '/:summaryId',
  roleMiddleware(['admin']),
  dischargeController.deleteDischargeSummary
);

export default router;