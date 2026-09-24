import { Router } from 'express';
import * as ctrl from '@controllers/physiotherapy-assessment.controller.js';
import authMiddleware from '@middlewares/auth.middleware.js';
import roleMiddleware from '@middlewares/role.middleware.js';
import validate from '@middlewares/validate.middleware.js';
import {
  createPhysiotherapyAssessmentSchema,
  updatePhysiotherapyAssessmentSchema,
  getPhysiotherapyAssessmentParamsSchema,
  getPhysiotherapyAssessmentPatientParamsSchema,
  getPhysiotherapyAssessmentQuerySchema,
  getAllPhysiotherapyAssessmentsQuerySchema,
  deletePhysiotherapyAssessmentSchema,
} from '@schemas/physiotherapy-assessment.schema.js';

const router = Router();

// ── Staff-facing (patient-scoped) ──
router.post(
  '/patients/:patientId/physiotherapy-assessment',
  authMiddleware,
  validate(createPhysiotherapyAssessmentSchema),
  ctrl.createPhysiotherapyAssessment,
);

router.get(
  '/patients/:patientId/physiotherapy-assessment',
  authMiddleware,
  validate(getPhysiotherapyAssessmentPatientParamsSchema),
  validate(getPhysiotherapyAssessmentQuerySchema),
  ctrl.getPhysiotherapyAssessments,
);

router.get(
  '/patients/:patientId/physiotherapy-assessment/all',
  authMiddleware,
  validate(getPhysiotherapyAssessmentPatientParamsSchema),
  validate(getAllPhysiotherapyAssessmentsQuerySchema),
  ctrl.getAllPhysiotherapyAssessments,
);

router.get(
  '/patients/:patientId/physiotherapy-assessment/:assessmentId',
  authMiddleware,
  validate(getPhysiotherapyAssessmentParamsSchema),
  ctrl.getPhysiotherapyAssessmentById,
);

// ── Admin only ──
router.patch(
  '/patients/:patientId/physiotherapy-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPhysiotherapyAssessmentParamsSchema),
  validate(updatePhysiotherapyAssessmentSchema),
  ctrl.updatePhysiotherapyAssessment,
);

router.delete(
  '/patients/:patientId/physiotherapy-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPhysiotherapyAssessmentParamsSchema),
  validate(deletePhysiotherapyAssessmentSchema),
  ctrl.deletePhysiotherapyAssessment,
);

router.post(
  '/patients/:patientId/physiotherapy-assessment/:assessmentId/restore',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPhysiotherapyAssessmentParamsSchema),
  ctrl.restorePhysiotherapyAssessment,
);

// ── Admin: list deleted ──
router.get(
  '/admin/physiotherapy-assessment/deleted',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPhysiotherapyAssessmentQuerySchema),
  ctrl.getDeletedPhysiotherapyAssessments,
);

export default router;