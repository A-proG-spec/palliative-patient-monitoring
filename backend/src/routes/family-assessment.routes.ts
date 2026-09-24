import { Router } from 'express';
import * as ctrl from '@controllers/family-assessment.controller.js';
import authMiddleware from '@middlewares/auth.middleware.js';
import roleMiddleware from '@middlewares/role.middleware.js';
import validate from '@middlewares/validate.middleware.js';
import {
  createFamilyAssessmentSchema,
  updateFamilyAssessmentSchema,
  getFamilyAssessmentParamsSchema,
  getFamilyAssessmentPatientParamsSchema,
  getFamilyAssessmentQuerySchema,
  getAllFamilyAssessmentsQuerySchema,
  deleteFamilyAssessmentSchema,
} from '@schemas/family-assessment.schema.js';

const router = Router();

// ── Staff-facing (patient-scoped) ──
router.post(
  '/patients/:patientId/family-assessment',
  authMiddleware,
  validate(createFamilyAssessmentSchema),
  ctrl.createFamilyAssessment,
);

router.get(
  '/patients/:patientId/family-assessment',
  authMiddleware,
  validate(getFamilyAssessmentPatientParamsSchema),
  validate(getFamilyAssessmentQuerySchema),
  ctrl.getFamilyAssessments,
);

router.get(
  '/patients/:patientId/family-assessment/all',
  authMiddleware,
  validate(getFamilyAssessmentPatientParamsSchema),
  validate(getAllFamilyAssessmentsQuerySchema),
  ctrl.getAllFamilyAssessments,
);

router.get(
  '/patients/:patientId/family-assessment/:assessmentId',
  authMiddleware,
  validate(getFamilyAssessmentParamsSchema),
  ctrl.getFamilyAssessmentById,
);

// ── Admin only ──
router.patch(
  '/patients/:patientId/family-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getFamilyAssessmentParamsSchema),
  validate(updateFamilyAssessmentSchema),
  ctrl.updateFamilyAssessment,
);

router.delete(
  '/patients/:patientId/family-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getFamilyAssessmentParamsSchema),
  validate(deleteFamilyAssessmentSchema),
  ctrl.deleteFamilyAssessment,
);

router.post(
  '/patients/:patientId/family-assessment/:assessmentId/restore',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getFamilyAssessmentParamsSchema),
  ctrl.restoreFamilyAssessment,
);

// ── Admin: list deleted ──
router.get(
  '/admin/family-assessment/deleted',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getFamilyAssessmentQuerySchema),
  ctrl.getDeletedFamilyAssessments,
);

export default router;