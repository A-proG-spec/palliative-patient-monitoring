import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '@schemas/profile.schema.js';
import * as profileController from '@controllers/profile.controller.js';

const router = Router();

// Every profile route requires authentication — but no role gate.
// Both admin and staff share the same endpoints; the service branches
// internally on `req.user.type`.
router.use(authMiddleware);

// ── Read ──
router.get('/', profileController.getProfile);

// ── Update basic info ──
router.put(
  '/',
  validate(updateProfileSchema),
  profileController.updateProfile,
);

// ── Change password ──
router.put(
  '/password',
  validate(changePasswordSchema),
  profileController.changePassword,
);

// ── Activity stats ──
router.get('/activity', profileController.getActivityStats);

export default router;