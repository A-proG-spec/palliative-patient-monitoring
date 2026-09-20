import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import * as labController from '@controllers/lab.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['LaboratoryTechnician', 'admin']));

router.get('/pending-requests', labController.getPendingRequests);
router.get('/queue/:id', labController.getRequestDetail);
router.patch('/queue/:id/result', labController.enterResult);

export default router;