import { z } from 'zod';

export const createPatientSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    age: z.number().min(1, 'Age must be greater than 0').max(150, 'Invalid age'),
    sex: z.enum(['Male', 'Female']),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().min(10, 'Phone number is required'),
    emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
    emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
    caregiverName: z.string().min(1, 'Caregiver name is required'),
    caregiverPhone: z.string().min(10, 'Caregiver phone is required'),
    primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
    secondaryDiagnoses: z.array(z.string()).optional(),
    diseaseStage: z.enum(['Early', 'Advanced', 'EndStage']),
    comorbidities: z.array(z.string()).optional(),
    estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']),
  }),
});

export const getPatientsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    status: z.enum(['Active', 'Discharged']).optional(),
    search: z.string().optional(),
  }),
});

export const getPatientParamsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
  }),
});

export type CreatePatientSchema = z.infer<typeof createPatientSchema>;
export type GetPatientsQuerySchema = z.infer<typeof getPatientsQuerySchema>;
export type GetPatientParamsSchema = z.infer<typeof getPatientParamsSchema>;