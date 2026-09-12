import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createLabSchema,
  updateLabResultSchema,
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
  labController.orderLabTest
);

// ── List ──
router.get(
  '/',
  validate(getLabsQuerySchema),
  labController.getLabTests
);

// ── Read one ──
router.get('/:labId', labController.getLabTestById);

// ── Update result ──
router.put(
  '/:labId',
  validate(updateLabResultSchema),
  labController.updateLabResult
);

// ── Soft delete (admin only) ──  ← NEW
router.delete(
  '/:labId',
  roleMiddleware(['admin']),
  labController.deleteLabTest
);

// ── Restore (admin only) ──  ← NEW
router.post(
  '/:labId/restore',
  roleMiddleware(['admin']),
  labController.restoreLabTest
);

export default router;