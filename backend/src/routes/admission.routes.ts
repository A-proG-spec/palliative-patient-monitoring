import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createAdmissionSchema,
  updateAdmissionSchema,
  getAdmissionsQuerySchema,
} from '@schemas/admission.schema.js';
import * as admissionController from '@controllers/admission.controller.js';

const router = Router({ mergeParams: true });

// All admission routes require authentication
router.use(authMiddleware);

// ── Record ──
router.post(
  '/',
  validate(createAdmissionSchema),
  admissionController.recordAdmission
);

// ── List ──
router.get(
  '/',
  validate(getAdmissionsQuerySchema),
  admissionController.getAdmissions
);

// ── Read one ──
router.get('/:admissionId', admissionController.getAdmissionById);

// ── Update ──
router.put(
  '/:admissionId',
  validate(updateAdmissionSchema),
  admissionController.updateAdmission
);

// ── Soft delete (admin only) ──  
router.delete(
  '/:admissionId',
  roleMiddleware(['admin']),
  admissionController.deleteAdmission
);

// ── Restore (admin only) ── 
router.post(
  '/:admissionId/restore',
  roleMiddleware(['admin']),
  admissionController.restoreAdmission
);

export default router;