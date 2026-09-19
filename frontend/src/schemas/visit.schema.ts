import { z } from 'zod';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)');

const adlLevelEnum = z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']);

/**
 * Coerces the string "true" / "false" (what RHF sends from radio inputs)
 * into a real boolean. Passes through real booleans unchanged.
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

/**
 * Coerces numeric strings from form inputs into numbers.
 * Also strips empty strings back to undefined.
 */
const optionalNumber = z.preprocess(
  (val) => {
    if (val === '' || val === undefined || val === null) return undefined;
    if (typeof val === 'string' && val.trim() !== '') return Number(val);
    return val;
  },
  z.number().optional(),
);

/**
 * Optional string that coerces empty string → undefined.
 */
const optionalString = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string().optional(),
);

// ─────────────────────────────────────────────────────────────
// Create Visit — matches backend `createVisitSchema.body`
//
// IMPORTANT: The backend schema does NOT accept the extended
// clinical sections (`generalObservation`, `respiratory`,
// `cardiovascular`, `genitourinary`, `skin`, `mobilityAssessment`,
// `nursingDiagnoses`, `nursingCarePlan`, `nursesSummary`,
// `painReliefMeasures`, `nausea`, `vomiting`, `bowelFunction`,
// `communicationAbility`, `cognitiveStatus`, `religiousAffiliation`).
//
// Zod strips unknown keys by default, so submitting them is
// harmless — they simply won't be persisted. Once the backend
// adds support, remove the `.passthrough()` note below and update
// the backend `createVisitSchema` to mirror.
// ─────────────────────────────────────────────────────────────
export const createVisitSchema = z
  .object({
    // ── Section 2: Visit Details ──
    visitDate: dateString,
    timeStarted: timeString,
    timeEnded: timeString,
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
          staffId: optionalString,
          role: z.enum(['Physician', 'Nurse']),
          name: z.string().min(1, 'Team member name is required'),
          isTeamLeader: z.boolean().optional(),
        }),
      )
      .min(1, 'At least one team member is required'),

    // ── Section 3: Patient General Condition ──
    overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']),
    mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']),

    // ── Section 4: Vital Signs ──
    vitals: z
      .object({
        temperature: optionalString,
        pulse: optionalString,
        bloodPressure: optionalString,
        respiration: optionalString,
        spO2: optionalString,
      })
      .optional(),

    // ── Section 5: Pain Assessment ──
    painPresent: booleanFromRadioOptional,
    painScore: z.coerce.number().min(0).max(10),
    painLocation: z.array(z.string()).optional().default([]),
    painLocationOther: optionalString,
    painCharacteristics: z.array(z.string()).optional().default([]),
    currentPainMedication: booleanFromRadioOptional,
    painMedicationEffective: booleanFromRadio,
    painManagementIneffectiveReason: optionalString,

    // ── Section 6: Symptoms ──
    symptoms: z.array(z.string()).optional().default([]),
    symptomsOther: optionalString,

    // ── Section 7: Functional Status ──
    adl: z.object({
      feeding: adlLevelEnum,
      bathing: adlLevelEnum,
      dressing: adlLevelEnum,
      toileting: adlLevelEnum,
      mobility: adlLevelEnum,
    }),
    ppsScore: z.coerce.number().min(0).max(100),
    kpsScore: z.coerce.number().min(0).max(100),

    // ── Section 8: Nutrition ──
    appetite: z.enum(['Good', 'Fair', 'Poor', 'UnableToEat']),
    oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal']),
    hydrationStatus: z.enum([
      'Adequate',
      'MildDehydration',
      'SevereDehydration',
    ]),
    nutritionComments: optionalString,

    // ── Section 9: Psychosocial ──
    emotionalStatus: z.enum([
      'Stable',
      'Anxious',
      'Depressed',
      'Fearful',
      'Distressed',
    ]),
    emotionalComments: optionalString,
    familySupport: z.enum(['Excellent', 'Good', 'Limited', 'None']),
    financialDifficulty: booleanFromRadio,
    financialComments: optionalString,

    // ── Section 10: Spiritual ──
    spiritualNeeds: booleanFromRadio,
    spiritualNeedsDescription: optionalString,
    religiousSupportRequested: booleanFromRadio,
    religiousSupportSpecify: optionalString,

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
    medicationIssues: optionalString,

    // ── Section 12: Caregiver Assessment ──
    primaryCaregiver: optionalString,
    caregiverBurden: z.enum(['Low', 'Moderate', 'High']),
    caregiverUnderstanding: z.enum(['Good', 'Fair', 'Poor']),
    caregivingCapacity: z.enum(['Strong', 'Moderate', 'Weak']),
    familyEmotionalStatus: z.enum(['Stable', 'Stressed', 'Overwhelmed']),

    // ── Section 13: Education Provided ──
    educationProvided: z.array(z.string()).optional().default([]),
    educationProvidedOther: optionalString,
    trainingNeeds: z.array(z.string()).optional().default([]),
    additionalSupportNeeded: booleanFromRadioOptional,
    additionalSupportSpecify: optionalString,

    // ── Section 14: Home Environment ──
    homeCondition: z.enum(['Clean', 'Fair', 'Poor']),
    homeObservations: z.array(z.string()).optional().default([]),
    homeEnvironmentDetails: optionalString,

    // ── Section 15: Nursing Care ──
    nursingCareGiven: z.array(z.string()).optional().default([]),
    nursingCareOther: optionalString,

    // ── Section 16: Red Flags ──
    redFlags: z.array(z.string()).optional().default([]),
    redFlagActions: optionalString,

    // ── Section 17: Referrals Made ──
    referralsMade: z.array(z.string()).optional().default([]),

    // ── Section 18: Key Issues ──
    keyIssues: optionalString,

    // ── Section 19: Action Plan ──
    immediateActions: optionalString,
    followUpPlan: optionalString,
    nextVisitDate: dateString.optional(),

    // ── Section 20: Outcome ──
    outcome: z.enum([
      'Stable',
      'SymptomsImproved',
      'SymptomsUnchanged',
      'SymptomsWorsened',
      'ReferredToFacility',
      'Deceased',
    ]),
    dateOfDeath: dateString.optional(),

    // ═══════════════════════════════════════════════════════════
    // EXTENDED CLINICAL FIELDS
    //
    // The form still submits these. They are accepted by this
    // schema so TypeScript and RHF are happy, but Zod will strip
    // them before the payload reaches the backend since the
    // backend schema does not declare them.
    //
    // Once the backend `createVisitSchema` adds support, they
    // will automatically flow through without frontend changes.
    // ═══════════════════════════════════════════════════════════
    generalObservation: z
      .object({
        levelOfConsciousness: optionalString,
        orientation: z.array(z.string()).optional(),
        generalAppearance: z.array(z.string()).optional(),
      })
      .optional(),

    painReliefMeasures: z.array(z.string()).optional(),
    painReliefMeasuresOther: optionalString,

    nausea: optionalString,
    vomiting: booleanFromRadioOptional,
    vomitingFrequency: optionalString,
    bowelFunction: optionalString,
    lastBowelMovement: optionalString,

    communicationAbility: optionalString,
    cognitiveStatus: optionalString,

    religiousAffiliation: optionalString,
    religiousAffiliationOther: optionalString,
    culturalConsiderations: optionalString,

    caregiverRelationship: optionalString,
    caregiverPhone: optionalString,

    respiratory: z
      .object({
        breathingPattern: optionalString,
        dyspnea: optionalString,
        oxygenTherapy: booleanFromRadioOptional,
        oxygenFlowRate: optionalString,
        cough: optionalString,
        sputum: optionalString,
      })
      .optional(),

    cardiovascular: z
      .object({
        pulseRhythm: optionalString,
        peripheralEdema: optionalString,
        peripheralEdemaLocation: optionalString,
        skinColor: optionalString,
      })
      .optional(),

    genitourinary: z
      .object({
        urinaryFunction: optionalString,
        urineAppearance: optionalString,
      })
      .optional(),

    skin: z
      .object({
        skinIntegrity: optionalString,
        pressureInjuryRisk: optionalString,
        pressureUlcerPresent: booleanFromRadioOptional,
        pressureUlcerLocation: optionalString,
        pressureUlcerStage: optionalString,
      })
      .optional(),

    mobilityAssessment: z
      .object({
        mobilityStatus: optionalString,
        fallRisk: optionalString,
        assistiveDevices: z.array(z.string()).optional(),
        assistiveDevicesOther: optionalString,
      })
      .optional(),

    nursingDiagnoses: z.array(z.string()).optional(),
    nursingDiagnosesOther: optionalString,

    nursingCarePlan: z
      .object({
        problemsIdentified: optionalString,
        plannedInterventions: optionalString,
        expectedOutcomes: optionalString,
      })
      .optional(),

    nursesSummary: optionalString,

    // `teamLeaderId` is not on the backend schema — the service
    // derives the leader from `req.user.id`. Kept here so the
    // existing form doesn't need to be refactored.
    teamLeaderId: optionalString,
  });

// ─────────────────────────────────────────────────────────────
// Update Visit — admin edit workflow
// Matches backend `updateVisitSchema.body`
// ─────────────────────────────────────────────────────────────
export const updateVisitSchema = z.object({
  visitDate: dateString.optional(),
  timeStarted: timeString.optional(),
  timeEnded: timeString.optional(),
  overallStatus: z
    .enum(['Stable', 'Deteriorating', 'Critical', 'BedBound'])
    .optional(),
  painScore: z.coerce.number().min(0).max(10).optional(),
  ppsScore: z.coerce.number().min(0).max(100).optional(),
  kpsScore: z.coerce.number().min(0).max(100).optional(),
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
});

// ─────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────
export const getVisitsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CreateVisitFormData = z.infer<typeof createVisitSchema>;
export type UpdateVisitFormData = z.infer<typeof updateVisitSchema>;
export type GetVisitsQueryFormData = z.infer<typeof getVisitsQuerySchema>;