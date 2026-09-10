import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { roleMiddleware } from '@middlewares/role.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import {
  createImagingSchema,
  updateImagingReportSchema,
  recordImagingPerformedSchema,
  updateImagingStatusSchema,
  getImagingQuerySchema,
} from '@schemas/imaging.schema.js';
import * as imagingController from '@controllers/imaging.controller.js';

const router = Router({ mergeParams: true });

// All imaging routes require authentication
router.use(authMiddleware);

// ── Create ──
router.post(
  '/',
  validate(createImagingSchema),
  imagingController.orderImaging
);

// ── List ──
router.get(
  '/',
  validate(getImagingQuerySchema),
  imagingController.getImagingOrders
);

// ── Read one ──
router.get('/:imagingId', imagingController.getImagingOrderById);

// ── Update report (finalizes the order) ──
router.put(
  '/:imagingId/report',
  validate(updateImagingReportSchema),
  imagingController.updateImagingReport
);

// ── Record imaging department use (Section 10) ──
router.put(
  '/:imagingId/performed',
  validate(recordImagingPerformedSchema),
  imagingController.recordImagingPerformed
);

// ── Update status ──
router.put(
  '/:imagingId/status',
  validate(updateImagingStatusSchema),
  imagingController.updateImagingStatus
);

// ── Delete (admin only) ──
router.delete(
  '/:imagingId',
  roleMiddleware(['admin']),
  imagingController.deleteImagingOrder
);

export default router;