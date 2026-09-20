import { Router } from 'express';
import { validate } from '@middlewares/validate.middleware.js';
import { authRateLimiter } from '@middlewares/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from '@schemas/auth.schema.js';
import * as authController from '@controllers/auth.controller.js';
import { authMiddleware } from '@/middlewares';

const router = Router();

// Public routes
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/verify-email',
  authRateLimiter,                    // ← add rate limiting (IMPORTANT for OTP)
  validate(verifyEmailSchema),
  authController.verifyEmail,
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
router.get('/me',authMiddleware, authController.getMe);
router.post('/logout',authMiddleware, authController.logout);

export default router;