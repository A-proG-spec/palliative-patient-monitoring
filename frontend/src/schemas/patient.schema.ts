import { z } from 'zod';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

// ─────────────────────────────────────────────────────────────
// Create Patient — matches backend `createPatientSchema.body`
//
// NOTE: `caregiverRelation` is optional and can be omitted.
// `age` is coerced from a string because RHF number inputs
// return strings when the field is empty.
// ─────────────────────────────────────────────────────────────
export const createPatientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Age must be greater than 0').max(150, 'Invalid age'),
  sex: z.enum(['Male', 'Female']),
  dateOfBirth: dateString,
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(10, 'Phone number is required'),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  caregiverName: z.string().min(1, 'Caregiver name is required'),
  caregiverPhone: z.string().min(10, 'Caregiver phone is required'),
  caregiverRelation: z.string().optional(),
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
  secondaryDiagnoses: z.array(z.string()).optional().default([]),
  diseaseStage: z.enum(['Early', 'Advanced', 'EndStage']),
  comorbidities: z.array(z.string()).optional().default([]),
  estimatedPrognosis: z.enum(['Days', 'Weeks', 'Months', 'Uncertain']),
});

// ─────────────────────────────────────────────────────────────
// Update Patient (admin-only) — matches backend `updatePatientSchema.body`
// ─────────────────────────────────────────────────────────────
export const updatePatientSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  age: z.coerce.number().min(1).max(150).optional(),
  sex: z.enum(['Male', 'Female']).optional(),
  dateOfBirth: dateString.optional(),
  address: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  emergencyContactName: z.string().min(1).optional(),
  emergencyContactPhone: z.string().min(10).optional(),
  caregiverName: z.string().min(1).optional(),
  caregiverPhone: z.string().min(10).optional(),
  caregiverRelation: z.string().optional(),
  hospitalPatientId: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────
export const getPatientsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(['Active', 'Discharged']).optional(),
  search: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreatePatientFormData = z.infer<typeof createPatientSchema>;
export type UpdatePatientFormData = z.infer<typeof updatePatientSchema>;
export type GetPatientsQueryFormData = z.infer<typeof getPatientsQuerySchema>;