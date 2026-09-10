import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createVisitSchema,
  signVisitSchema,
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

// ── Sign (bcrypt-verified email + password) ──  ← NEW
router.post(
  '/:visitId/sign',
  validate(signVisitSchema),
  visitController.signVisit
);

// ── Read signature status ──  ← NEW
router.get(
  '/:visitId/signatures',
  visitController.getVisitSignatures
);

export default router;