import { z } from 'zod';

// ═════════════════════════════════════════════════════════════
// Row schemas
// ═════════════════════════════════════════════════════════════

export const medicationRowSchema = z.object({
  medicationTreatment: z.string().default(''),
  dose: z.string().default(''),
  route: z.string().default(''),
  frequency: z.string().default(''),
  reasonResponse: z.string().default(''),
});

export const additionalNoteRowSchema = z.object({
  date: z.string().default(''),
  time: z.string().default(''),
  note: z.string().default(''),
  clinicianName: z.string().default(''),
});

export const mdtReviewRowSchema = z.object({
  discipline: z.string().default(''),
  reviewIntervention: z.string().default(''),
  followUpRequired: z.enum(['No', 'Yes']).optional(),
});

// ═════════════════════════════════════════════════════════════
// Enum helper
//
// Coerces '' → undefined so the form can bind to empty strings
// without triggering "invalid enum" errors. Prisma receives
// `undefined` (→ SQL NULL), never "".
// ═════════════════════════════════════════════════════════════

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.enum(values).optional(),
  );

// ═════════════════════════════════════════════════════════════
// Enum schemas — one per backend Postgres enum
// ═════════════════════════════════════════════════════════════

const generalConditionEnum    = optionalEnum(['Stable', 'Improving', 'Deteriorating', 'Critical', 'ActivelyDying'] as const);
const consciousnessEnum       = optionalEnum(['Alert', 'Drowsy', 'Confused', 'Delirious', 'Unresponsive'] as const);
const orientationEnum         = optionalEnum(['Oriented', 'PartiallyOriented', 'Disoriented', 'UnableToAssess'] as const);
const functionalStatusEnum    = optionalEnum(['Independent', 'RequiresAssistance', 'Bedbound', 'FullyDependent'] as const);
const responseToTreatmentEnum = optionalEnum(['Good', 'Partial', 'Poor', 'NotApplicable'] as const);
const yesNoEnum               = optionalEnum(['Yes', 'No'] as const);
const breathingEnum           = optionalEnum(['Comfortable', 'MildDistress', 'ModerateDistress', 'SevereDistress'] as const);
const oxygenDeliveryEnum      = optionalEnum(['NasalCannula', 'Mask', 'Other'] as const);
const secretionsEnum          = optionalEnum(['None', 'Mild', 'Moderate', 'Excessive'] as const);
const oralIntakeEnum          = optionalEnum(['Good', 'Reduced', 'Minimal', 'None'] as const);
const urineOutputEnum         = optionalEnum(['Normal', 'Reduced', 'Minimal', 'UnableToAssess'] as const);
const bowelMovementEnum       = optionalEnum(['Normal', 'Constipated', 'Diarrhea', 'NoRecentBM'] as const);
const skinEnum                = optionalEnum(['Intact', 'Dry', 'Fragile', 'Edematous', 'Other'] as const);
const distressEnum            = optionalEnum(['None', 'Mild', 'Moderate', 'Severe'] as const);
const codeStatusEnum          = optionalEnum(['FullResuscitation', 'DNAR', 'Other'] as const);
const prnEffectivenessEnum    = optionalEnum(['Effective', 'PartiallyEffective', 'Ineffective'] as const);
const medicationSideEffectsEnum = optionalEnum(['None', 'Yes'] as const);

// Symptom severity (per-symptom row)
const symptomSeverityEnum = z.enum(['None', 'Mild', 'Moderate', 'Severe']).default('None');

// Array-valued enum fields
const goalsOfCareEnum = z.enum([
  'ComfortSymptomControl',
  'QualityOfLife',
  'FunctionalSupport',
  'DiseaseDirectedTreatment',
  'EndOfLifeCare',
  'HomeHospiceCare',
  'Other',
]);

const nursingCareEnum = z.enum([
  'PositioningComfortMeasures',
  'PersonalHygiene',
  'OralCare',
  'PressureInjuryPrevention',
  'WoundCare',
  'OxygenTherapy',
  'SymptomMonitoring',
  'MedicationAdministration',
  'NutritionHydrationSupport',
  'EmotionalSupport',
  'FamilyCaregiverEducation',
  'Other',
]);

const investigationEnum = z.enum([
  'LaboratoryTests',
  'Imaging',
  'ECGOtherDiagnosticTest',
  'None',
  'Other',
]);

// Mood behavior — backend takes any string, no enum constraint
const moodBehaviorEnum = z.enum([
  'Calm', 'Anxious', 'Fearful', 'Sad', 'Depressed', 'Agitated', 'Withdrawn',
]);

// ═════════════════════════════════════════════════════════════
// Vitals + symptoms (nested for the UI)
// ═════════════════════════════════════════════════════════════

const vitalPair = z.object({
  current: z.string().default(''),
  previous: z.string().default(''),
});

const vitalsSchema = z.object({
  temperature:     vitalPair,
  pulse:           vitalPair,
  respiratoryRate: vitalPair,
  bloodPressure:   vitalPair,
  spo2:            vitalPair,
  oxygenFlow:      vitalPair,
});

const symptomRowSchema = z.object({
  severity: symptomSeverityEnum,
  notes: z.string().default(''),
});

const symptomsSchema = z.record(z.string(), symptomRowSchema);

// ═════════════════════════════════════════════════════════════
// The full progress-note schema
//
// The shape matches the frontend `ProgressNote` type — nested
// vitals + symptoms — NOT the flat backend shape. The serializer
// in RecordProgressNotePage flattens it before submission.
// ═════════════════════════════════════════════════════════════

export const createProgressNoteSchema = z.object({
  admissionId: z.string().optional(),

  // Header
  attendingClinician: z.string().trim().min(1, 'Attending clinician is required'),
  palliativeCareUnit: z.string().default(''),

  // 1 — Current Clinical Status
  generalCondition: generalConditionEnum,
  levelOfConsciousness: consciousnessEnum,
  orientation: orientationEnum,
  functionalStatus: functionalStatusEnum,
  changesSincePreviousReview: z.string().default(''),

  // 2 — Vitals
  vitals: vitalsSchema,
  otherRelevantObservations: z.string().default(''),

  // 3 — Symptoms
  symptoms: symptomsSchema,
  painScore: z.string().default(''),
  painLocation: z.string().default(''),
  painCharacter: z.string().default(''),
  currentPainManagement: z.string().default(''),
  responseToTreatment: responseToTreatmentEnum,
  breakthroughPainEpisodes: yesNoEnum,
  breakthroughPainFrequency: z.string().default(''),

  // 4 — Respiratory
  breathing: breathingEnum,
  oxygenTherapy: yesNoEnum,
  oxygenDelivery: oxygenDeliveryEnum,
  oxygenDeliveryOther: z.string().default(''),
  respiratorySecretions: secretionsEnum,
  cough: yesNoEnum,
  otherRespiratoryFindings: z.string().default(''),

  // 5 — Nutrition
  oralIntake: oralIntakeEnum,
  diet: z.string().default(''),
  fluidIntake: z.string().default(''),
  feedingAssistance: yesNoEnum,
  enteralFeeding: yesNoEnum,
  ivFluids: yesNoEnum,
  nauseaVomitingAffectingIntake: yesNoEnum,
  nutritionHydrationConcerns: z.string().default(''),

  // 6 — Elimination
  urineOutput: urineOutputEnum,
  urinaryCatheter: yesNoEnum,
  bowelMovement: bowelMovementEnum,
  lastBowelMovement: z.string().default(''),
  otherEliminationConcerns: z.string().default(''),

  // 7 — Skin
  skin: skinEnum,
  skinOther: z.string().default(''),
  pressureInjury: yesNoEnum,
  pressureInjuryLocationStage: z.string().default(''),
  woundCareProvided: yesNoEnum,
  woundPressureInjuryChanges: z.string().default(''),

  // 8 — Psychological
  moodBehavior: z.array(moodBehaviorEnum).optional().default([]),
  psychologicalDistress: distressEnum,
  patientsMainConcernsToday: z.string().default(''),
  counselingPsychologicalSupportProvided: yesNoEnum,

  // 9 — Spiritual
  spiritualDistressIdentified: yesNoEnum,
  patientsSpiritualCulturalConcerns: z.string().default(''),
  spiritualCareProvided: yesNoEnum,
  spiritualReferralRequired: yesNoEnum,
  spiritualNotes: z.string().default(''),

  // 10 — Family
  familyCaregiverPresent: yesNoEnum,
  familyCaregiverConcerns: z.string().default(''),
  familyEducationSupportProvided: z.string().default(''),
  familyMeetingHeld: yesNoEnum,
  familyMeetingParticipants: z.string().default(''),

  // 11 — Goals of Care
  currentGoalsOfCare: z.array(goalsOfCareEnum).optional().default([]),
  currentGoalsOfCareOther: z.string().default(''),
  goalsReviewedToday: yesNoEnum,
  changeInGoalsIdentified: yesNoEnum,
  patientDecisionMakerPreferences: z.string().default(''),
  codeStatus: codeStatusEnum,
  codeStatusOther: z.string().default(''),
  advanceCarePlanReviewed: yesNoEnum,

  // 12 — Medication Review
  currentMedicationRegimenReviewed: yesNoEnum,
  changesMade: yesNoEnum,
  medications: z.array(medicationRowSchema).optional().default([]),
  prnBreakthroughMedicationUsed: yesNoEnum,
  prnEffectiveness: prnEffectivenessEnum,
  medicationSideEffects: medicationSideEffectsEnum,
  medicationSideEffectsDetail: z.string().default(''),

  // 13 — Nursing
  nursingSupportiveCareProvided: z.array(nursingCareEnum).optional().default([]),
  nursingSupportiveCareOther: z.string().default(''),
  responseToSupportiveCare: z.string().default(''),

  // 14 — Investigations
  investigationsPerformedReviewed: z.array(investigationEnum).optional().default([]),
  investigationsPerformedReviewedOther: z.string().default(''),
  significantResults: z.string().default(''),
  clinicalSignificanceActionTaken: z.string().default(''),

  // 15 — MDT Review
  multidisciplinaryTeamReview: z.array(mdtReviewRowSchema).optional().default([]),

  // 16 — Clinical Assessment
  overallAssessment: z.string().default(''),
  problemsIdentifiedToday: z.array(z.string()).optional().default([]),

  // 17 — Plan
  symptomManagementPlan: z.string().default(''),
  medicationPlan: z.string().default(''),
  nursingSupportiveCarePlan: z.string().default(''),
  investigationsMonitoring: z.string().default(''),
  familyCaregiverPlan: z.string().default(''),
  referralsConsultations: z.string().default(''),
  dischargeTransferHospicePlanning: z.string().default(''),

  // 18 — SOAP
  soapSubjective: z.string().default(''),
  soapObjective: z.string().default(''),
  soapAssessment: z.string().default(''),
  soapPlan: z.string().default(''),

  // 19 — Additional Notes
  additionalProgressNotes: z.array(additionalNoteRowSchema).optional().default([]),

  // 20 — Authorization
  facilityStamp: z.string().default(''),
});

export const updateProgressNoteSchema = createProgressNoteSchema.partial();

export type CreateProgressNoteFormData = z.infer<typeof createProgressNoteSchema>;
export type UpdateProgressNoteFormData = z.infer<typeof updateProgressNoteSchema>;