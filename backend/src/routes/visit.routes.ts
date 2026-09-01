import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import { createVisitSchema, getVisitsQuerySchema } from '@schemas/visit.schema.js';
import * as visitController from '@controllers/visit.controller.js';

const router = Router({ mergeParams: true });

// All visit routes require authentication
router.use(authMiddleware);

router.post(
  '/',
  validate(createVisitSchema),
  visitController.recordVisit
);

router.get(
  '/',
  validate(getVisitsQuerySchema),
  visitController.getVisits
);

router.get('/:visitId', visitController.getVisitById);

export default router;