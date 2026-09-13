import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createPatientSchema,
  updatePatientSchema,
  getPatientsQuerySchema,
} from '@schemas/patient.schema.js';
import * as patientController from '@controllers/patient.controller.js';

const router = Router();

// All patient routes require authentication
router.use(authMiddleware);

// ── Register ──
router.post(
  '/',
  validate(createPatientSchema),
  patientController.registerPatient
);

// ── List ──
router.get(
  '/',
  validate(getPatientsQuerySchema),
  patientController.getPatients
);

// ── Read one ──
router.get('/:patientId', patientController.getPatientById);

// ── Update (admin only) ──  ← NEW
router.put(
  '/:patientId',
  roleMiddleware(['admin']),
  validate(updatePatientSchema),
  patientController.updatePatient
);

// ── Summary ──
router.get('/:patientId/summary', patientController.getPatientSummary);

// ── Progress ──
router.get('/:patientId/progress', patientController.getPatientProgress);

export default router;