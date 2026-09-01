import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import { createPatientSchema, getPatientsQuerySchema } from '@schemas/patient.schema.js';
import * as patientController from '@controllers/patient.controller.js';

const router = Router();

// All patient routes require authentication
router.use(authMiddleware);

router.post(
  '/',
  validate(createPatientSchema),
  patientController.registerPatient
);

router.get(
  '/',
  validate(getPatientsQuerySchema),
  patientController.getPatients
);

router.get('/:patientId', patientController.getPatientById);
router.get('/:patientId/summary', patientController.getPatientSummary);
router.get('/:patientId/progress', patientController.getPatientProgress);

export default router;