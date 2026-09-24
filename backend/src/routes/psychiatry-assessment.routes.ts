import { Router } from 'express';
import * as ctrl from '@controllers/psychiatry-assessment.controller.js';
import authMiddleware from '@middlewares/auth.middleware.js';
import roleMiddleware from '@middlewares/role.middleware.js';
import validate from '@middlewares/validate.middleware.js';
import {
  createPsychiatryAssessmentSchema,
  updatePsychiatryAssessmentSchema,
  getPsychiatryAssessmentParamsSchema,
  getPsychiatryAssessmentPatientParamsSchema,
  getPsychiatryAssessmentQuerySchema,
  getAllPsychiatryAssessmentsQuerySchema,
  deletePsychiatryAssessmentSchema,
} from '@schemas/psychiatry-assessment.schema.js';

const router = Router();

// ── Staff-facing (patient-scoped) ──
//
// NOTE: The service escalates High suicide risk to a notification.
// The controller stays thin; the safety logic lives in the service.
router.post(
  '/patients/:patientId/psychiatry-assessment',
  authMiddleware,
  validate(createPsychiatryAssessmentSchema),
  ctrl.createPsychiatryAssessment,
);

router.get(
  '/patients/:patientId/psychiatry-assessment',
  authMiddleware,
  validate(getPsychiatryAssessmentPatientParamsSchema),
  validate(getPsychiatryAssessmentQuerySchema),
  ctrl.getPsychiatryAssessments,
);

router.get(
  '/patients/:patientId/psychiatry-assessment/all',
  authMiddleware,
  validate(getPsychiatryAssessmentPatientParamsSchema),
  validate(getAllPsychiatryAssessmentsQuerySchema),
  ctrl.getAllPsychiatryAssessments,
);

router.get(
  '/patients/:patientId/psychiatry-assessment/:assessmentId',
  authMiddleware,
  validate(getPsychiatryAssessmentParamsSchema),
  ctrl.getPsychiatryAssessmentById,
);

// ── Admin only ──
//
// 🚨 The DELETE route relies on the service's safety guard:
//    a non-empty `reason` in the request body is REQUIRED when
//    the assessment's suicideRiskLevel is 'High'.
//    The `deletePsychiatryAssessmentSchema` accepts the optional
//    body so the request itself validates; the service enforces
//    the conditional requirement.
router.patch(
  '/patients/:patientId/psychiatry-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPsychiatryAssessmentParamsSchema),
  validate(updatePsychiatryAssessmentSchema),
  ctrl.updatePsychiatryAssessment,
);

router.delete(
  '/patients/:patientId/psychiatry-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPsychiatryAssessmentParamsSchema),
  validate(deletePsychiatryAssessmentSchema),
  ctrl.deletePsychiatryAssessment,
);

router.post(
  '/patients/:patientId/psychiatry-assessment/:assessmentId/restore',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPsychiatryAssessmentParamsSchema),
  ctrl.restorePsychiatryAssessment,
);

// ── Admin: list deleted ──
router.get(
  '/admin/psychiatry-assessment/deleted',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPsychiatryAssessmentQuerySchema),
  ctrl.getDeletedPsychiatryAssessments,
);

export default router;