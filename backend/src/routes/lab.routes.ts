import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createLabSchema,
  updateLabResultSchema,
  cancelLabSchema,
  deleteLabSchema,
  getLabsQuerySchema,
} from '@schemas/lab.schema.js';
import * as labController from '@controllers/lab.controller.js';

const router = Router({ mergeParams: true });

// All lab routes require authentication
router.use(authMiddleware);

// ── Order ──
router.post(
  '/',
  validate(createLabSchema),
  labController.orderLabTest,
);

// ── List ──
router.get(
  '/',
  validate(getLabsQuerySchema),
  labController.getLabTests,
);

// ── Read one ──
router.get('/:labId', labController.getLabTestById);

// ── Update result ──
router.put(
  '/:labId',
  validate(updateLabResultSchema),
  labController.updateLabResult,
);

// ── Cancel (staff can cancel their own pending orders) ──
router.put(
  '/:labId/cancel',
  validate(cancelLabSchema),
  labController.cancelLabTest,
);

// ── Soft delete (admin only) ──
router.delete(
  '/:labId',
  roleMiddleware(['admin']),
  validate(deleteLabSchema),
  labController.deleteLabTest,
);

// ── Restore (admin only) ──
router.put(
  '/:labId/restore',
  roleMiddleware(['admin']),
  labController.restoreLabTest,
);

export default router;