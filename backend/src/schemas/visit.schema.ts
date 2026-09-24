import { z } from 'zod';

export const createVisitSchema = z.object({
  body: z.object({
    // ── Section 2: Visit Details ──
    visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    timeStarted: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    timeEnded: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    visitType: z.enum([
      'Routine',
      'Emergency',
      'FirstAssessment',
      'PostDischarge',
      'EndOfLife',
      'Bereavement',
    ]),
    teamMembers: z
      .array(
        z.object({
          staffId: z.string().optional(),
          role: z.enum(['Physician', 'Nurse']),
          name: z.string().min(1, 'Team member name is required'),
          isTeamLeader: z.boolean().optional(),
        })
      )
      .min(1, 'At least one team member is required'),

    // ── Section 3: Patient General Condition ──
    overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']),
    mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']),

    // ── Section 4: Vital Signs ──
    vitals: z
      .object({
        temperature: z.string().optional(),
        pulse: z.string().optional(),
        bloodPressure: z.string().optional(),
        respiration: z.string().optional(),
        spO2: z.string().optional(),
      })
      .optional(),

    // ── Section 5: Pain Assessment ──
    painPresent: z.boolean().optional(),
    painScore: z.number().min(0).max(10),
    painLocation: z.array(z.string()).optional().default([]),
    painLocationOther: z.string().optional(),
    painCharacteristics: z.array(z.string()).optional().default([]),
    currentPainMedication: z.boolean().optional(),
    painMedicationEffective: z.boolean(),
    painManagementIneffectiveReason: z.string().optional(),

    // ── Section 6: Symptoms ──
    symptoms: z.array(z.string()).optional().default([]),
    symptomsOther: z.string().optional(),

    // ── Section 7: Functional Status ──
    adl: z.object({
      feeding: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
      bathing: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
      dressing: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
      toileting: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
      mobility: z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']),
    }),
    ppsScore: z.number().min(0).max(100),
    kpsScore: z.number().min(0).max(100),

    // ── Section 8: Nutrition ──
    appetite: z.enum(['Good', 'Fair', 'Poor', 'UnableToEat']),
    oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal']),
    hydrationStatus: z.enum(['Adequate', 'MildDehydration', 'SevereDehydration']),
    nutritionComments: z.string().optional(),

    // ── Section 9: Psychosocial ──
    emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed']),
    emotionalComments: z.string().optional(),
    familySupport: z.enum(['Excellent', 'Good', 'Limited', 'None']),
    financialDifficulty: z.boolean(),
    financialComments: z.string().optional(),

    // ── Section 10: Spiritual ──
    spiritualNeeds: z.boolean(),
    spiritualNeedsDescription: z.string().optional(),
    religiousSupportRequested: z.boolean(),
    religiousSupportSpecify: z.string().optional(),

    // ── Section 11: Medication Review ──
    medicationAvailable: z.boolean(),
    medicationCorrectlyTaken: z.boolean(),
    medicationSideEffects: z.boolean(),
    medicationRefillNeeded: z.boolean(),
    morphineAvailable: z.boolean().nullable().optional(),
    adherenceLevel: z.enum(['Good', 'Partial', 'Poor']),
    currentMedications: z
      .array(
        z.object({
          name: z.string(),
          dosage: z.string(),
          frequency: z.string(),
          route: z.string(),
        })
      )
      .optional()
      .default([]),
    medicationIssues: z.string().optional(),

    // ── Section 12: Caregiver Assessment ──
    primaryCaregiver: z.string().optional(),
    caregiverBurden: z.enum(['Low', 'Moderate', 'High']),
    caregiverUnderstanding: z.enum(['Good', 'Fair', 'Poor']),
    caregivingCapacity: z.enum(['Strong', 'Moderate', 'Weak']),
    familyEmotionalStatus: z.enum(['Stable', 'Stressed', 'Overwhelmed']),

    // ── Section 13: Education Provided ──
    educationProvided: z.array(z.string()).optional().default([]),
    educationProvidedOther: z.string().optional(),
    trainingNeeds: z.array(z.string()).optional().default([]),
    additionalSupportNeeded: z.boolean().optional(),
    additionalSupportSpecify: z.string().optional(),

    // ── Section 14: Home Environment ──
    homeCondition: z.enum(['Clean', 'Fair', 'Poor']),
    homeObservations: z.array(z.string()).optional().default([]),
    homeEnvironmentDetails: z.string().optional(),

    // ── Section 15: Nursing Care ──
    nursingCareGiven: z.array(z.string()).optional().default([]),
    nursingCareOther: z.string().optional(),

    // ── Section 16: Red Flags ──
    redFlags: z.array(z.string()).optional().default([]),
    redFlagActions: z.string().optional(),

    // ── Section 17: Referrals Made ──
    referralsMade: z.array(z.string()).optional().default([]),

    // ── Section 18: Key Issues ──
    keyIssues: z.string().optional(),

    // ── Section 19: Action Plan ──
    immediateActions: z.string().optional(),
    followUpPlan: z.string().optional(),
    nextVisitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),

    // ── Section 20: Outcome ──
    outcome: z.enum([
      'Stable',
      'SymptomsImproved',
      'SymptomsUnchanged',
      'SymptomsWorsened',
      'ReferredToFacility',
      'Deceased',
    ]),
    dateOfDeath: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  }),
});
export const getAllVisitsQuerySchema = z.object({
  query: z.object({
    includeDeleted: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

// ─────────────────────────────────────────────────────────────
// Sign Visit — re-auth via email + password
// ─────────────────────────────────────────────────────────────
export const signVisitSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['Physician', 'Nurse']),
  }),
});

// ─────────────────────────────────────────────────────────────
// Update Visit (admin edit workflow)
// ─────────────────────────────────────────────────────────────
export const updateVisitSchema = z.object({
  body: z.object({
    visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    timeStarted: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
    timeEnded: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
    overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']).optional(),
    painScore: z.number().min(0).max(10).optional(),
    ppsScore: z.number().min(0).max(100).optional(),
    kpsScore: z.number().min(0).max(100).optional(),
    outcome: z
      .enum([
        'Stable',
        'SymptomsImproved',
        'SymptomsUnchanged',
        'SymptomsWorsened',
        'ReferredToFacility',
        'Deceased',
      ])
      .optional(),
  }),
});

// ─────────────────────────────────────────────────────────────
// Queries & Params
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateVisitSchema = z.infer<typeof createVisitSchema>;
export type SignVisitSchema = z.infer<typeof signVisitSchema>;
export type UpdateVisitSchema = z.infer<typeof updateVisitSchema>;
export type GetVisitsQuerySchema = z.infer<typeof getVisitsQuerySchema>;
export type GetVisitParamsSchema = z.infer<typeof getVisitParamsSchema>;