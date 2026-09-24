import { Router } from 'express';
import * as ctrl from '@controllers/pharmacist-assessment.controller.js';
import authMiddleware from '@middlewares/auth.middleware.js';
import roleMiddleware from '@middlewares/role.middleware.js';
import validate from '@middlewares/validate.middleware.js';
import {
  createClinicalPharmacistAssessmentSchema,
  updateClinicalPharmacistAssessmentSchema,
  getPharmacistAssessmentParamsSchema,
  getPharmacistAssessmentPatientParamsSchema,
  getPharmacistAssessmentQuerySchema,
  getAllPharmacistAssessmentsQuerySchema,
  deletePharmacistAssessmentSchema,
} from '@schemas/pharmacist-assessment.schema.js';

const router = Router();

// ── Staff-facing (patient-scoped) ──
router.post(
  '/patients/:patientId/pharmacist-assessment',
  authMiddleware,
  validate(createClinicalPharmacistAssessmentSchema),
  ctrl.createPharmacistAssessment,
);

router.get(
  '/patients/:patientId/pharmacist-assessment',
  authMiddleware,
  validate(getPharmacistAssessmentPatientParamsSchema),
  validate(getPharmacistAssessmentQuerySchema),
  ctrl.getPharmacistAssessments,
);

router.get(
  '/patients/:patientId/pharmacist-assessment/all',
  authMiddleware,
  validate(getPharmacistAssessmentPatientParamsSchema),
  validate(getAllPharmacistAssessmentsQuerySchema),
  ctrl.getAllPharmacistAssessments,
);

router.get(
  '/patients/:patientId/pharmacist-assessment/:assessmentId',
  authMiddleware,
  validate(getPharmacistAssessmentParamsSchema),
  ctrl.getPharmacistAssessmentById,
);

// ── Admin only ──
router.patch(
  '/patients/:patientId/pharmacist-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPharmacistAssessmentParamsSchema),
  validate(updateClinicalPharmacistAssessmentSchema),
  ctrl.updatePharmacistAssessment,
);

router.delete(
  '/patients/:patientId/pharmacist-assessment/:assessmentId',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPharmacistAssessmentParamsSchema),
  validate(deletePharmacistAssessmentSchema),
  ctrl.deletePharmacistAssessment,
);

router.post(
  '/patients/:patientId/pharmacist-assessment/:assessmentId/restore',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPharmacistAssessmentParamsSchema),
  ctrl.restorePharmacistAssessment,
);

// ── Admin: list all deleted (global, not per-patient) ──
router.get(
  '/admin/pharmacist-assessment/deleted',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(getPharmacistAssessmentQuerySchema),
  ctrl.getDeletedPharmacistAssessments,
);

export default router;