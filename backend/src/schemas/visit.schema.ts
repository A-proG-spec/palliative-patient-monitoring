import { z } from 'zod';

export const createVisitSchema = z.object({
  body: z.object({
    visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    timeStarted: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    timeEnded: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    visitType: z.enum(['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement']),
    teamMembers: z.array(
      z.object({
        role: z.enum(['TeamLeader', 'Physician', 'Nurse']),
        name: z.string().min(1, 'Team member name is required'),
      })
    ).min(1, 'At least one team member is required'),
    overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']),
    mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']),
    vitals: z.object({
      temperature: z.number().optional(),
      pulse: z.number().optional(),
      bp: z.string().optional(),
      respiration: z.number().optional(),
      spo2: z.number().optional(),
    }).optional(),
    painScore: z.number().min(0, 'Pain score must be between 0 and 10').max(10, 'Pain score must be between 0 and 10'),
    painLocation: z.array(z.string()).optional(),
    painCharacteristics: z.array(z.string()).optional(),
    painMedicationEffective: z.boolean(),
    symptoms: z.array(z.string()).optional(),
    adl: z.object({
      feeding: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
      bathing: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
      dressing: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
      toileting: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
      mobility: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
    }),
    ppsScore: z.number().min(0, 'PPS score must be between 0 and 100').max(100, 'PPS score must be between 0 and 100'),
    kpsScore: z.number().min(0, 'KPS score must be between 0 and 100').max(100, 'KPS score must be between 0 and 100'),
    appetite: z.enum(['Good', 'Fair', 'Poor', 'UnableToEat']),
    oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal']),
    hydrationStatus: z.enum(['Adequate', 'MildDehydration', 'SevereDehydration']),
    emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed']),
    familySupport: z.enum(['Excellent', 'Good', 'Limited', 'None']),
    financialDifficulty: z.boolean(),
    spiritualNeeds: z.boolean(),
    religiousSupportRequested: z.boolean(),
    medicationAvailable: z.boolean(),
    medicationCorrectlyTaken: z.boolean(),
    medicationSideEffects: z.boolean(),
    medicationRefillNeeded: z.boolean(),
    morphineAvailable: z.boolean(),
    adherenceLevel: z.enum(['Good', 'Partial', 'Poor']),
    currentMedications: z.array(
      z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        route: z.string(),
      })
    ).optional(),
    caregiverBurden: z.enum(['Low', 'Moderate', 'High']),
    caregiverUnderstanding: z.enum(['Good', 'Fair', 'Poor']),
    caregivingCapacity: z.enum(['Strong', 'Moderate', 'Weak']),
    familyEmotionalStatus: z.enum(['Stable', 'Stressed', 'Overwhelmed']),
    educationProvided: z.array(z.string()).optional(),
    homeCondition: z.enum(['Clean', 'Fair', 'Poor']),
    homeObservations: z.array(z.string()).optional(),
    nursingCareGiven: z.array(z.string()).optional(),
    redFlags: z.array(z.string()).optional(),
    redFlagActions: z.string().optional(),
    referralsMade: z.array(z.string()).optional(),
    outcome: z.enum(['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased']),
    nextVisitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    teamLeaderId: z.string().min(1, 'Team leader is required'),
    physicianId: z.string().min(1, 'Physician is required'),
    nurseId: z.string().min(1, 'Nurse is required'),
  }),
});

export const getVisitsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export const getVisitParamsSchema = z.object({
  params: z.object({
    visitId: z.string().min(1, 'Visit ID is required'),
  }),
});

export type CreateVisitSchema = z.infer<typeof createVisitSchema>;
export type GetVisitsQuerySchema = z.infer<typeof getVisitsQuerySchema>;
export type GetVisitParamsSchema = z.infer<typeof getVisitParamsSchema>;