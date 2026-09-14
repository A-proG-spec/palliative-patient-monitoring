import { z } from 'zod';

const adlLevelEnum = z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']);

/**
 * Coerces the string "true" / "false" (what RHF sends from radio inputs)
 * into a real boolean. Also passes through real booleans unchanged.
 */
const booleanFromRadio = z.preprocess(
  (val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  },
  z.boolean(),
);

const booleanFromRadioOptional = z.preprocess(
  (val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === '' || val === undefined || val === null) return undefined;
    return val;
  },
  z.boolean().optional(),
);

export const createVisitSchema = z.object({
  // ── Section 2: Visit Details ──
  visitDate: z.string().min(1, 'Visit date is required'),
  timeStarted: z.string().min(1, 'Start time is required'),
  timeEnded: z.string().min(1, 'End time is required'),
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
        role: z.enum(['TeamLeader', 'Physician', 'Nurse']),
        name: z.string().min(1, 'Name is required'),
      }),
    )
    .min(1, 'At least one team member is required'),

  // ── Section 3: Patient General Condition ──
  overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']),
  mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']),

  // ── Section 4: Vital Signs ──
  vitals: z
    .object({
      temperature: z.coerce.number().optional(),
      pulse: z.coerce.number().optional(),
      bp: z.string().optional(),
      respiration: z.coerce.number().optional(),
      spo2: z.coerce.number().optional(),
    })
    .optional(),

  // ── Section 5: Pain Assessment ──
  painPresent: booleanFromRadioOptional,
  painScore: z.coerce.number().min(0).max(10),
  painLocation: z.array(z.string()).optional().default([]),
  painLocationOther: z.string().optional(),
  painCharacteristics: z.array(z.string()).optional().default([]),
  currentPainMedication: booleanFromRadioOptional,
  painMedicationEffective: booleanFromRadio,
  painManagementIneffectiveReason: z.string().optional(),

  // ── Section 6: Symptoms ──
  symptoms: z.array(z.string()).optional().default([]),
  symptomsOther: z.string().optional(),

  // ── Section 7: Functional Status Assessment ──
  adl: z.object({
    feeding: adlLevelEnum,
    bathing: adlLevelEnum,
    dressing: adlLevelEnum,
    toileting: adlLevelEnum,
    mobility: adlLevelEnum,
  }),
  ppsScore: z.coerce.number().min(0).max(100),
  kpsScore: z.coerce.number().min(0).max(100),

  // ── Section 8: Nutrition and Hydration ──
  appetite: z.enum(['Good', 'Fair', 'Poor', 'UnableToEat']),
  oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal']),
  hydrationStatus: z.enum(['Adequate', 'MildDehydration', 'SevereDehydration']),
  nutritionComments: z.string().optional(),

  // ── Section 9: Psychosocial Assessment ──
  emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed']),
  emotionalComments: z.string().optional(),
  familySupport: z.enum(['Excellent', 'Good', 'Limited', 'None']),
  financialDifficulty: booleanFromRadio,
  financialComments: z.string().optional(),

  // ── Section 10: Spiritual Assessment ──
  spiritualNeeds: booleanFromRadio,
  spiritualNeedsDescription: z.string().optional(),
  religiousSupportRequested: booleanFromRadio,
  religiousSupportSpecify: z.string().optional(),

  // ── Section 11: Medication Review ──
  medicationAvailable: booleanFromRadio,
  medicationCorrectlyTaken: booleanFromRadio,
  medicationSideEffects: booleanFromRadio,
  medicationRefillNeeded: booleanFromRadio,
  morphineAvailable: z.boolean().nullable().optional(),
  adherenceLevel: z.enum(['Good', 'Partial', 'Poor']),
  currentMedications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        route: z.string(),
      }),
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
  additionalSupportNeeded: booleanFromRadioOptional,
  additionalSupportSpecify: z.string().optional(),

  // ── Section 14: Home Environment ──
  homeCondition: z.enum(['Clean', 'Fair', 'Poor']),
  homeObservations: z.array(z.string()).optional().default([]),
  homeEnvironmentDetails: z.string().optional(),

  // ── Section 15: Nursing Care Provided ──
  nursingCareGiven: z.array(z.string()).optional().default([]),
  nursingCareOther: z.string().optional(),

  // ── Section 16: Red Flag Assessment ──
  redFlags: z.array(z.string()).optional().default([]),
  redFlagActions: z.string().optional(),

  // ── Section 17: Referrals Made ──
  referralsMade: z.array(z.string()).optional().default([]),

  // ── Section 18: Key Issues ──
  keyIssues: z.string().optional(),

  // ── Section 19: Action Plan ──
  immediateActions: z.string().optional(),
  followUpPlan: z.string().optional(),
  nextVisitDate: z.string().optional(),

  // ── Section 20: Outcome ──
  outcome: z.enum([
    'Stable',
    'SymptomsImproved',
    'SymptomsUnchanged',
    'SymptomsWorsened',
    'ReferredToFacility',
    'Deceased',
  ]),
  dateOfDeath: z.string().optional(),

  // ── Section 21: Team Leader ──
  teamLeaderId: z.string().min(1, 'Team leader is required'),
});

export type CreateVisitFormData = z.infer<typeof createVisitSchema>;