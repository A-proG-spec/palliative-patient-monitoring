import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z
      .string()
      .length(6, 'Code must be exactly 6 digits')
      .regex(/^\d{6}$/, 'Code must contain only numbers'),
  }),
});
export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type verifyEmailSchema = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationSchema = z.infer<typeof resendVerificationSchema>;