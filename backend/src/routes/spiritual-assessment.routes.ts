import { Router } from 'express';
import * as ctrl from '@controllers/spiritual-assessment.controller.js';
import authMiddleware from '@middlewares/auth.middleware.js';
import roleMiddleware from '@middlewares/role.middleware.js';
import validate from '@middlewares/validate.middleware.js';
import {
  createSpiritualAssessmentSchema,
  updateSpiritualAssessmentSchema,
  getSpiritualAssessmentParamsSchema,
  getSpiritualAssessmentPatientParamsSchema,
  getSpiritualAssessmentQuerySchema,
  getAllSpiritualAssessmentsQuerySchema,
  deleteSpiritualAssessmentSchema,
} from '@schemas/spiritual-assessment.schema.js';

const router = Router();

// ── Staff-facing (patient-scoped) ──
router.post(
  '/patients/:patientId/spiritual-assessment',
  authMiddleware,
  validate(createSpiritualAssessmentSchema),
  ctrl.createSpiritualAssessment,
);

router.get(
  '/patients/:patientId/spiritual-assessment',
  authMiddleware,
  validate(getSpiritualAssessmentPatientParamsSchema),
  validate(getSpiritualAssessmentQuerySchema),
  ctrl.getSpiritualAssessments,
);

router.get(
  '/patients/:patientId/spiritual-assessment/all',
  authMiddleware,
  validate(getSpiritualAssessmentPatientParamsSchema),
  validate(getAllSpiritualAssessmentsQuerySchema),
  ctrl.getAllSpiritualAssessments,
);

router.get(
  '/patients/:patientId/spiritual-assessment/:assessmentId',
  authMiddleware,
  validate(getSpiritualAssessmentParamsSchema),
  ctrl.getSpiritualAssessmentById,
);

// ── Admin only ──
router.patch(
  '/patients/:patientId/spiritual-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getSpiritualAssessmentParamsSchema),
  validate(updateSpiritualAssessmentSchema),
  ctrl.updateSpiritualAssessment,
);

router.delete(
  '/patients/:patientId/spiritual-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getSpiritualAssessmentParamsSchema),
  validate(deleteSpiritualAssessmentSchema),
  ctrl.deleteSpiritualAssessment,
);

router.post(
  '/patients/:patientId/spiritual-assessment/:assessmentId/restore',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getSpiritualAssessmentParamsSchema),
  ctrl.restoreSpiritualAssessment,
);

// ── Admin: list deleted ──
router.get(
  '/admin/spiritual-assessment/deleted',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getSpiritualAssessmentQuerySchema),
  ctrl.getDeletedSpiritualAssessments,
);

export default router;