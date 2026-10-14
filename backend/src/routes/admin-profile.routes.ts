import { Router } from 'express';
import {
  getAdminProfileController,
  updateAdminProfileController,
  changeAdminPasswordController,
  getAdminActivityStatsController,
} from '../controllers/admin-profile.controller';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  updateAdminProfileSchema,
  changeAdminPasswordSchema,
} from '../schemas/admin-profile.schema';

const router = Router();

// ═════════════════════════════════════════════════════════════
// Every route requires:
//   • a valid JWT (authenticate)
//   • an admin actor (authorize('admin'))
// ═════════════════════════════════════════════════════════════

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));
// GET /admin/profile — fetch the signed-in admin's profile
router.get('/', getAdminProfileController);

// PUT /admin/profile — update name
router.put(
  '/',
  validate(updateAdminProfileSchema),
  updateAdminProfileController,
);

// PUT /admin/profile/password — change password
router.put(
  '/password',
  validate(changeAdminPasswordSchema),
  changeAdminPasswordController,
);

// GET /admin/profile/activity — small stats summary
router.get('/activity', getAdminActivityStatsController);

export default router;