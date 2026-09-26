import { z } from 'zod';

export const STAFF_ROLE_VALUES = [
  'Physician',
  'Nurse',
  'Pharmacist',
  'Radiologist',
  'LaboratoryTechnician',
  'Physiologist',
  'Psychiatrist',
  'Psychologist',
  'SocialWorker',
  'SpiritualPerson',
  'Nutritionist',
] as const;

export const signVisitSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(STAFF_ROLE_VALUES, {
    message: 'Please select a role',
  }),
});

export const signProgressNoteSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum([...STAFF_ROLE_VALUES, 'Reviewer'] as [
    string,
    ...string[],
  ]),
});

export type SignVisitFormData = z.infer<typeof signVisitSchema>;
export type SignProgressNoteFormData = z.infer<typeof signProgressNoteSchema>;