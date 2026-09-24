import { Router } from 'express';
import * as ctrl from '@controllers/social-assessment.controller.js';
import authMiddleware from '@middlewares/auth.middleware.js';
import roleMiddleware from '@middlewares/role.middleware.js';
import validate from '@middlewares/validate.middleware.js';
import {
  createSocialAssessmentSchema,
  updateSocialAssessmentSchema,
  getSocialAssessmentParamsSchema,
  getSocialAssessmentPatientParamsSchema,
  getSocialAssessmentQuerySchema,
  getAllSocialAssessmentsQuerySchema,
  deleteSocialAssessmentSchema,
} from '@schemas/social-assessment.schema.js';

const router = Router();

// ── Staff-facing (patient-scoped) ──
router.post(
  '/patients/:patientId/social-assessment',
  authMiddleware,
  validate(createSocialAssessmentSchema),
  ctrl.createSocialAssessment,
);

router.get(
  '/patients/:patientId/social-assessment',
  authMiddleware,
  validate(getSocialAssessmentPatientParamsSchema),
  validate(getSocialAssessmentQuerySchema),
  ctrl.getSocialAssessments,
);

router.get(
  '/patients/:patientId/social-assessment/all',
  authMiddleware,
  validate(getSocialAssessmentPatientParamsSchema),
  validate(getAllSocialAssessmentsQuerySchema),
  ctrl.getAllSocialAssessments,
);

router.get(
  '/patients/:patientId/social-assessment/:assessmentId',
  authMiddleware,
  validate(getSocialAssessmentParamsSchema),
  ctrl.getSocialAssessmentById,
);

// ── Admin only ──
router.patch(
  '/patients/:patientId/social-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getSocialAssessmentParamsSchema),
  validate(updateSocialAssessmentSchema),
  ctrl.updateSocialAssessment,
);

router.delete(
  '/patients/:patientId/social-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getSocialAssessmentParamsSchema),
  validate(deleteSocialAssessmentSchema),
  ctrl.deleteSocialAssessment,
);

router.post(
  '/patients/:patientId/social-assessment/:assessmentId/restore',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getSocialAssessmentParamsSchema),
  ctrl.restoreSocialAssessment,
);

// ── Admin: list deleted ──
router.get(
  '/admin/social-assessment/deleted',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getSocialAssessmentQuerySchema),
  ctrl.getDeletedSocialAssessments,
);

export default router;