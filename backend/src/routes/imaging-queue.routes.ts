import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import * as imagingController from '@controllers/imaging.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['Radiologist', 'admin']));

router.get('/pending-orders', imagingController.getPendingOrders);
router.get('/queue/:id', imagingController.getOrderDetail);
router.patch('/queue/:id/report', imagingController.submitReport);

export default router;