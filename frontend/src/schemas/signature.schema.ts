import { z } from 'zod';

export const signVisitSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['TeamLeader', 'Physician', 'Nurse'], {
    message: 'Invalid role. Must be TeamLeader, Physician, or Nurse',
  }),
});

export type SignVisitFormData = z.infer<typeof signVisitSchema>;