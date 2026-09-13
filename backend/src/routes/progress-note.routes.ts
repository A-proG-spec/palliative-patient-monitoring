import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createProgressNoteSchema,
  updateProgressNoteSchema,
  signProgressNoteSchema,
  getProgressNotesQuerySchema,
} from '@schemas/progress-note.schema.js';
import * as progressNoteController from '@controllers/progress-note.controller.js';

const router = Router({ mergeParams: true });

// All progress note routes require authentication
router.use(authMiddleware);

// ── Create ──
router.post(
  '/',
  validate(createProgressNoteSchema),
  progressNoteController.createProgressNote
);

// ── List ──
router.get(
  '/',
  validate(getProgressNotesQuerySchema),
  progressNoteController.getProgressNotes
);

// ── Read one ──
router.get('/:noteId', progressNoteController.getProgressNoteById);

// ── Update (author only — enforced in service) ──
router.put(
  '/:noteId',
  validate(updateProgressNoteSchema),
  progressNoteController.updateProgressNote
);

// ── Soft delete (admin only) ──
router.delete(
  '/:noteId',
  roleMiddleware(['admin']),
  progressNoteController.deleteProgressNote
);

// ── Restore (admin only) ──  ← NEW
router.post(
  '/:noteId/restore',
  roleMiddleware(['admin']),
  progressNoteController.restoreProgressNote
);

// ── Sign (bcrypt-verified email + password) ──
router.post(
  '/:noteId/sign',
  validate(signProgressNoteSchema),
  progressNoteController.signProgressNote
);

// ── Read signature status ──
router.get(
  '/:noteId/signatures',
  progressNoteController.getProgressNoteSignatures
);

export default router;