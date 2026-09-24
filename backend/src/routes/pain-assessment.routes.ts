import { Router } from 'express';
import * as ctrl from '@controllers/pain-assessment.controller.js';
import authMiddleware from '@middlewares/auth.middleware.js';
import roleMiddleware from '@middlewares/role.middleware.js';
import validate from '@middlewares/validate.middleware.js';
import {
  createPainAssessmentSchema,
  updatePainAssessmentSchema,
  getPainAssessmentParamsSchema,
  getPainAssessmentPatientParamsSchema,
  getPainAssessmentQuerySchema,
  getAllPainAssessmentsQuerySchema,
  deletePainAssessmentSchema,
} from '@schemas/pain-assessment.schema.js';

const router = Router();

// ── Staff-facing (patient-scoped) ──
router.post(
  '/patients/:patientId/pain-assessment',
  authMiddleware,
  validate(createPainAssessmentSchema),
  ctrl.createPainAssessment,
);

router.get(
  '/patients/:patientId/pain-assessment',
  authMiddleware,
  validate(getPainAssessmentPatientParamsSchema),
  validate(getPainAssessmentQuerySchema),
  ctrl.getPainAssessments,
);

router.get(
  '/patients/:patientId/pain-assessment/all',
  authMiddleware,
  validate(getPainAssessmentPatientParamsSchema),
  validate(getAllPainAssessmentsQuerySchema),
  ctrl.getAllPainAssessments,
);

router.get(
  '/patients/:patientId/pain-assessment/:assessmentId',
  authMiddleware,
  validate(getPainAssessmentParamsSchema),
  ctrl.getPainAssessmentById,
);

// ── Admin only ──
router.patch(
  '/patients/:patientId/pain-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPainAssessmentParamsSchema),
  validate(updatePainAssessmentSchema),
  ctrl.updatePainAssessment,
);

router.delete(
  '/patients/:patientId/pain-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPainAssessmentParamsSchema),
  validate(deletePainAssessmentSchema),
  ctrl.deletePainAssessment,
);

router.post(
  '/patients/:patientId/pain-assessment/:assessmentId/restore',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPainAssessmentParamsSchema),
  ctrl.restorePainAssessment,
);

// ── Admin: list deleted ──
router.get(
  '/admin/pain-assessment/deleted',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPainAssessmentQuerySchema),
  ctrl.getDeletedPainAssessments,
);

export default router;