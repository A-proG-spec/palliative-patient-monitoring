import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import { createReferralSchema, getReferralsQuerySchema, updateReferralSchema, getReferralParamsSchema } from '@schemas/referral.schema.js';
import * as referralController from '@controllers/referral.controller.js';

const router = Router({ mergeParams: true });

// All referral routes require authentication
router.use(authMiddleware);

router.post(
  '/',
  validate(createReferralSchema),
  referralController.requestReferral
);

router.get(
  '/',
  validate(getReferralsQuerySchema),
  referralController.getReferrals
);

router.get('/:referralId', referralController.getReferralById);
router.patch(
  '/:referralId',   // ← just the child segment
  validate(updateReferralSchema.merge(getReferralParamsSchema)),
  referralController.updateReferral,
);

export default router;