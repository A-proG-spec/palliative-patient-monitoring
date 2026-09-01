import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createMedicationSchema,
  updateMedicationStatusSchema,
  getMedicationsQuerySchema,
} from '@schemas/medication.schema.js';
import * as medicationController from '@controllers/medication.controller.js';

const router = Router({ mergeParams: true });

// All medication routes require authentication
router.use(authMiddleware);

router.post(
  '/',
  validate(createMedicationSchema),
  medicationController.orderMedication
);

router.get(
  '/',
  validate(getMedicationsQuerySchema),
  medicationController.getMedications
);

router.get('/:medicationId', medicationController.getMedicationById);
router.put(
  '/:medicationId',
  validate(updateMedicationStatusSchema),
  medicationController.updateMedicationStatus
);

export default router;