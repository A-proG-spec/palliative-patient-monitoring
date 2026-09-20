import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import { getMedicationsQuerySchema } from '@schemas/medication.schema.js';
import * as medicationController from '@controllers/medication.controller.js';

const router = Router();

// Pharmacist-only queue
router.use(authMiddleware);
router.use(roleMiddleware(['Pharmacist', 'admin']));

router.get(
  '/pending-orders',
  validate(getMedicationsQuerySchema),
  medicationController.getPendingOrders,
);

router.get('/queue/:id', medicationController.getOrderDetail);
router.patch('/queue/:id/status', medicationController.markOrderGiven);

export default router;