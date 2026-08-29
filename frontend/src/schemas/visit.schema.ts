// src/schemas/visit.schema.ts

import { z } from 'zod';

const adlStatusEnum = z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']);

export const createVisitSchema = z.object({
  visitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeStarted: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  timeEnded: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  visitType: z.enum(
    ['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement'],
    { required_error: 'Visit type is required' }
  ),
  teamMembers: z
    .array(
      z.object({
        role: z.enum(['TeamLeader', 'Physician', 'Nurse']),
        name: z.string().min(1, 'Team member name is required'),
      })
    )
    .min(1, 'At least one team member is required'),
  overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound'], {
    required_error: 'Overall status is required',
  }),
  mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden'], {
    required_error: 'Mobility is required',
  }),
  vitals: z
    .object({
      temperature: z.number().optional(),
      pulse: z.number().optional(),
      bp: z.string().optional(),
      respiration: z.number().optional(),
      spo2: z.number().optional(),
    })
    .optional(),
  painScore: z
    .number({ invalid_type_error: 'Pain score must be a number' })
    .min(0, 'Pain score must be 0–10')
    .max(10, 'Pain score must be 0–10'),
  painLocation: z.array(z.string()).optional(),
  painCharacteristics: z.array(z.string()).optional(),
  painMedicationEffective: z.boolean({
    required_error: 'Please indicate if pain medication is effective',
  }),
  symptoms: z.array(z.string()).optional(),
  adl: z.object({
    feeding: adlStatusEnum,
    bathing: adlStatusEnum,
    dressing: adlStatusEnum,
    toileting: adlStatusEnum,
    mobility: adlStatusEnum,
  }),
  ppsScore: z
    .number({ invalid_type_error: 'PPS score must be a number' })
    .min(0, 'PPS score must be 0–100')
    .max(100, 'PPS score must be 0–100'),
  kpsScore: z
    .number({ invalid_type_error: 'KPS score must be a number' })
    .min(0, 'KPS score must be 0–100')
    .max(100, 'KPS score must be 0–100'),
  appetite: z.enum(['Good', 'Fair', 'Poor', 'UnableToEat'], {
    required_error: 'Appetite is required',
  }),
  oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal'], {
    required_error: 'Oral intake is required',
  }),
  hydrationStatus: z.enum(['Adequate', 'MildDehydration', 'SevereDehydration'], {
    required_error: 'Hydration status is required',
  }),
  emotionalStatus: z.enum(
    ['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed'],
    { required_error: 'Emotional status is required' }
  ),
  familySupport: z.enum(['Excellent', 'Good', 'Limited', 'None'], {
    required_error: 'Family support is required',
  }),
  financialDifficulty: z.boolean({
    required_error: 'Please indicate financial difficulty',
  }),
  spiritualNeeds: z.boolean({ required_error: 'Please indicate spiritual needs' }),
  religiousSupportRequested: z.boolean({
    required_error: 'Please indicate religious support',
  }),
  medicationAvailable: z.boolean({
    required_error: 'Please indicate medication availability',
  }),
  medicationCorrectlyTaken: z.boolean({
    required_error: 'Please indicate if medication is correctly taken',
  }),
  medicationSideEffects: z.boolean({
    required_error: 'Please indicate medication side effects',
  }),
  medicationRefillNeeded: z.boolean({
    required_error: 'Please indicate if refill is needed',
  }),
  morphineAvailable: z.boolean({
    required_error: 'Please indicate morphine availability',
  }),
  adherenceLevel: z.enum(['Good', 'Partial', 'Poor'], {
    required_error: 'Adherence level is required',
  }),
  currentMedications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        route: z.string(),
      })
    )
    .optional(),
  caregiverBurden: z.enum(['Low', 'Moderate', 'High'], {
    required_error: 'Caregiver burden is required',
  }),
  caregiverUnderstanding: z.enum(['Good', 'Fair', 'Poor'], {
    required_error: 'Caregiver understanding is required',
  }),
  caregivingCapacity: z.enum(['Strong', 'Moderate', 'Weak'], {
    required_error: 'Caregiving capacity is required',
  }),
  familyEmotionalStatus: z.enum(['Stable', 'Stressed', 'Overwhelmed'], {
    required_error: 'Family emotional status is required',
  }),
  educationProvided: z.array(z.string()).optional(),
  homeCondition: z.enum(['Clean', 'Fair', 'Poor'], {
    required_error: 'Home condition is required',
  }),
  homeObservations: z.array(z.string()).optional(),
  nursingCareGiven: z.array(z.string()).optional(),
  redFlags: z.array(z.string()).optional(),
  redFlagActions: z.string().optional(),
  referralsMade: z.array(z.string()).optional(),
  outcome: z.enum(
    [
      'Stable',
      'SymptomsImproved',
      'SymptomsUnchanged',
      'SymptomsWorsened',
      'ReferredToFacility',
      'Deceased',
    ],
    { required_error: 'Outcome is required' }
  ),
  nextVisitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  teamLeaderId: z.string().min(1, 'Team leader is required'),
  physicianId: z.string().min(1, 'Physician is required'),
  nurseId: z.string().min(1, 'Nurse is required'),
});

export type CreateVisitFormData = z.infer<typeof createVisitSchema>;
