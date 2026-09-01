import { Router } from 'express';
import { validate } from '@middlewares/validate.middleware.js';
import { authRateLimiter } from '@middlewares/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailQuerySchema,
  resendVerificationSchema,
} from '@schemas/auth.schema.js';
import * as authController from '@controllers/auth.controller.js';

const router = Router();

// Public routes
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

router.get(
  '/verify-email',
  validate(verifyEmailQuerySchema),
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  authRateLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

// Protected routes
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

export default router;