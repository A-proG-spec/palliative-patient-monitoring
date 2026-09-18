import { Router } from 'express';
import * as ctrl from '@controllers/hospice-nursing.controller.js';
import authMiddleware from '@middlewares/auth.middleware.js';
import roleMiddleware from '@middlewares/role.middleware.js';
import validate from '@middlewares/validate.middleware.js';
import {
  createHospiceNursingAssessmentSchema,
  updateHospiceNursingAssessmentSchema,
  getHospiceNursingParamsSchema,
  getHospiceNursingPatientParamsSchema,
  getHospiceNursingQuerySchema,
} from '@schemas/hospice-nursing.schema.js';

const router = Router();

// ── Staff-facing (patient-scoped) ──
router.post(
  '/patients/:patientId/hospice-nursing',
  authMiddleware,
  validate(createHospiceNursingAssessmentSchema),
  ctrl.createHospiceNursingAssessment,
);

router.get(
  '/patients/:patientId/hospice-nursing',
  authMiddleware,
  validate(getHospiceNursingPatientParamsSchema),
  validate(getHospiceNursingQuerySchema),
  ctrl.getHospiceNursingAssessments,
);

router.get(
  '/patients/:patientId/hospice-nursing/:assessmentId',
  authMiddleware,
  validate(getHospiceNursingParamsSchema),
  ctrl.getHospiceNursingAssessmentById,
);

// ── Admin only ──
router.patch(
  '/patients/:patientId/hospice-nursing/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getHospiceNursingParamsSchema),
  validate(updateHospiceNursingAssessmentSchema),
  ctrl.updateHospiceNursingAssessment,
);

router.delete(
  '/patients/:patientId/hospice-nursing/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getHospiceNursingParamsSchema),
  ctrl.deleteHospiceNursingAssessment,
);

router.post(
  '/patients/:patientId/hospice-nursing/:assessmentId/restore',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getHospiceNursingParamsSchema),
  ctrl.restoreHospiceNursingAssessment,
);

// ── Admin: list all deleted (not per-patient) ──
router.get(
  '/admin/hospice-nursing/deleted',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getHospiceNursingQuerySchema),
  ctrl.getDeletedHospiceNursingAssessments,
);

export default router;