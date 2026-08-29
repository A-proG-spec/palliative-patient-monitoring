// src/schemas/patient.schema.ts

import { z } from 'zod';

export const createPatientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(1, 'Age must be greater than 0'),
  sex: z.enum(['Male', 'Female'], { required_error: 'Sex is required' }),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(10, 'Phone number is required'),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  caregiverName: z.string().min(1, 'Caregiver name is required'),
  caregiverPhone: z.string().min(10, 'Caregiver phone is required'),
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
  secondaryDiagnoses: z.array(z.string()).optional(),
  diseaseStage: z.enum(['Early', 'Advanced', 'EndStage'], {
    required_error: 'Disease stage is required',
  }),
  comorbidities: z.array(z.string()).optional(),
  estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain'], {
    required_error: 'Estimated prognosis is required',
  }),
});

export type CreatePatientFormData = z.infer<typeof createPatientSchema>;
