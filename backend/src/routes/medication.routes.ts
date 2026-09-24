import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createMedicationSchema,
  updateMedicationStatusSchema,
  getMedicationsQuerySchema,
  getAllMedicationsQuerySchema,
} from '@schemas/medication.schema.js';
import * as medicationController from '@controllers/medication.controller.js';

const router = Router({ mergeParams: true });

// All medication routes require authentication
router.use(authMiddleware);

// ── Order ──
router.post(
  '/',
  validate(createMedicationSchema),
  medicationController.orderMedication
);

// ── List ──
router.get(
  '/',
  validate(getMedicationsQuerySchema),
  medicationController.getMedications
);
router.get(
  '/all',
  validate(getAllMedicationsQuerySchema),
  medicationController.getAllMedications,
);
// ── Read one ──
router.get('/:medicationId', medicationController.getMedicationById);

// ── Update status ──
router.put(
  '/:medicationId',
  validate(updateMedicationStatusSchema),
  medicationController.updateMedicationStatus
);

// ── Soft delete (admin only) ──  ← NEW
router.delete(
  '/:medicationId',
  roleMiddleware(['admin']),
  medicationController.deleteMedication
);

// ── Restore (admin only) ──  ← NEW
router.post(
  '/:medicationId/restore',
  roleMiddleware(['admin']),
  medicationController.restoreMedication
);


export default router;