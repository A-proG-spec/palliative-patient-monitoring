import { Router } from 'express';
import * as ctrl from '@controllers/nutritional-assessment.controller.js';
import authMiddleware from '@middlewares/auth.middleware.js';
import roleMiddleware from '@middlewares/role.middleware.js';
import validate from '@middlewares/validate.middleware.js';
import {
  createNutritionalAssessmentSchema,
  updateNutritionalAssessmentSchema,
  getNutritionalAssessmentParamsSchema,
  getNutritionalAssessmentPatientParamsSchema,
  getNutritionalAssessmentQuerySchema,
  getAllNutritionalAssessmentsQuerySchema,
  deleteNutritionalAssessmentSchema,
} from '@schemas/nutritional-assessment.schema.js';

const router = Router();

// ── Staff-facing (patient-scoped) ──
router.post(
  '/patients/:patientId/nutritional-assessment',
  authMiddleware,
  validate(createNutritionalAssessmentSchema),
  ctrl.createNutritionalAssessment,
);

router.get(
  '/patients/:patientId/nutritional-assessment',
  authMiddleware,
  validate(getNutritionalAssessmentPatientParamsSchema),
  validate(getNutritionalAssessmentQuerySchema),
  ctrl.getNutritionalAssessments,
);

router.get(
  '/patients/:patientId/nutritional-assessment/all',
  authMiddleware,
  validate(getNutritionalAssessmentPatientParamsSchema),
  validate(getAllNutritionalAssessmentsQuerySchema),
  ctrl.getAllNutritionalAssessments,
);

router.get(
  '/patients/:patientId/nutritional-assessment/:assessmentId',
  authMiddleware,
  validate(getNutritionalAssessmentParamsSchema),
  ctrl.getNutritionalAssessmentById,
);

// ── Admin only ──
router.patch(
  '/patients/:patientId/nutritional-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getNutritionalAssessmentParamsSchema),
  validate(updateNutritionalAssessmentSchema),
  ctrl.updateNutritionalAssessment,
);

router.delete(
  '/patients/:patientId/nutritional-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getNutritionalAssessmentParamsSchema),
  validate(deleteNutritionalAssessmentSchema),
  ctrl.deleteNutritionalAssessment,
);

router.post(
  '/patients/:patientId/nutritional-assessment/:assessmentId/restore',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getNutritionalAssessmentParamsSchema),
  ctrl.restoreNutritionalAssessment,
);

// ── Admin: list deleted ──
router.get(
  '/admin/nutritional-assessment/deleted',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getNutritionalAssessmentQuerySchema),
  ctrl.getDeletedNutritionalAssessments,
);

export default router;