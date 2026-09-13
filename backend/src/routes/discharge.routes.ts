import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import { createDischargeSummarySchema } from '@schemas/discharge.schema.js';
import * as dischargeController from '@controllers/discharge.controller.js';

const router = Router({ mergeParams: true });

// All discharge routes require authentication
router.use(authMiddleware);

// ── Create (also flips Patient + Admission to Discharged via transaction) ──
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

// ── Finalize (Draft → Final) ──
router.put(
  '/:summaryId/finalize',
  dischargeController.finalizeDischargeSummary
);

export default router;