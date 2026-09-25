import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Login — matches backend `loginSchema`
// ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─────────────────────────────────────────────────────────────
// Register — matches backend `registerSchema`
// NOTE: backend REQUIRES a `role` from the enum. The frontend
// register form must submit it. Password confirmation is a
// client-only concern (backend doesn't see it).
// ─────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(
      [ 'Physician',  'Nurse',  'Pharmacist',  'Radiologist',  'LaboratoryTechnician',  'Physiologist',  'Psychiatrist',  'Psychologist',  'SocialWorker', 'SpiritualPerson', 'Nutritionist'],
      { message: 'Please select a valid role' },
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ─────────────────────────────────────────────────────────────
// Verify email (OTP)
// ─────────────────────────────────────────────────────────────
export const verifyEmailOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
});

// ─────────────────────────────────────────────────────────────
// Resend verification
// ─────────────────────────────────────────────────────────────
export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type VerifyEmailOtpFormData = z.infer<typeof verifyEmailOtpSchema>;
export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;