import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createVisitSchema,
  signVisitSchema,
  updateVisitSchema,
  getVisitsQuerySchema,
} from '@schemas/visit.schema.js';
import * as visitController from '@controllers/visit.controller.js';

const router = Router({ mergeParams: true });

// All visit routes require authentication
router.use(authMiddleware);

// ── Create ──
router.post(
  '/',
  validate(createVisitSchema),
  visitController.recordVisit
);

// ── List ──
router.get(
  '/',
  validate(getVisitsQuerySchema),
  visitController.getVisits
);

// ── Read one ──
router.get('/:visitId', visitController.getVisitById);

// ── Update (admin only) ──  ← NEW
router.put(
  '/:visitId',
  roleMiddleware(['admin']),
  validate(updateVisitSchema),
  visitController.updateVisit
);

// ── Soft delete (admin only) ──  ← NEW
router.delete(
  '/:visitId',
  roleMiddleware(['admin']),
  visitController.deleteVisit
);

// ── Restore (admin only) ──  ← NEW
router.post(
  '/:visitId/restore',
  roleMiddleware(['admin']),
  visitController.restoreVisit
);

// ── Sign (bcrypt-verified email + password) ──
router.post(
  '/:visitId/sign',
  validate(signVisitSchema),
  visitController.signVisit
);

// ── Read signature status ──
router.get(
  '/:visitId/signatures',
  visitController.getVisitSignatures
);

export default router;