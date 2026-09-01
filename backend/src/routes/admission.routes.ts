import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
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

router.post(
  '/',
  validate(createAdmissionSchema),
  admissionController.recordAdmission
);

router.get(
  '/',
  validate(getAdmissionsQuerySchema),
  admissionController.getAdmissions
);

router.get('/:admissionId', admissionController.getAdmissionById);
router.put(
  '/:admissionId',
  validate(updateAdmissionSchema),
  admissionController.updateAdmission
);

export default router;