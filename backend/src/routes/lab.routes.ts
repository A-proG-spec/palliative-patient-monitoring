import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
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

router.post(
  '/',
  validate(createLabSchema),
  labController.orderLabTest
);

router.get(
  '/',
  validate(getLabsQuerySchema),
  labController.getLabTests
);

router.get('/:labId', labController.getLabTestById);
router.put(
  '/:labId',
  validate(updateLabResultSchema),
  labController.updateLabResult
);

export default router;