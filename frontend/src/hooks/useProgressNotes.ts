import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressNotesApi } from '@/api/progress-notes';
import { useToast } from '@/context/ToastContext';
import type { CreateProgressNoteFormData } from '@/schemas/progress-note.schema';

// ─────────────────────────────────────────────────────────────
// Row sub-types
// ─────────────────────────────────────────────────────────────

export interface ProgressNoteMedRow {
  medicationTreatment: string;
  dose: string;
  route: string;
  frequency: string;
  reasonResponse: string;
}

export interface ProgressNoteSymptomRow {
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  notes: string;
}

export interface ProgressNoteAdditionalEntry {
  date: string;
  time: string;
  note: string;
  clinicianName: string;
}

export interface ProgressNoteMDTRow {
  discipline: string;
  reviewIntervention: string;
  followUpRequired?: 'No' | 'Yes';
}

export interface ProgressNoteSignature {
  staffId: string;
  name: string;
  role: 'Physician' | 'Nurse' | 'Reviewer';
  signedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Enum unions — mirror the frontend Zod schema exactly
// ─────────────────────────────────────────────────────────────

export type SymptomSeverity      = 'None' | 'Mild' | 'Moderate' | 'Severe';
export type GeneralCondition     = 'Stable' | 'Improving' | 'Deteriorating' | 'Critical' | 'ActivelyDying';
export type Consciousness        = 'Alert' | 'Drowsy' | 'Confused' | 'Delirious' | 'Unresponsive';
export type Orientation          = 'Oriented' | 'PartiallyOriented' | 'Disoriented' | 'UnableToAssess';
export type FunctionalStatus     = 'Independent' | 'RequiresAssistance' | 'Bedbound' | 'FullyDependent';
export type ResponseToTreatment  = 'Good' | 'Partial' | 'Poor' | 'NotApplicable';
export type YesNo                = 'Yes' | 'No';
export type Breathing            = 'Comfortable' | 'MildDistress' | 'ModerateDistress' | 'SevereDistress';
export type OxygenDelivery       = 'NasalCannula' | 'Mask' | 'Other';
export type Secretions           = 'None' | 'Mild' | 'Moderate' | 'Excessive';
export type OralIntake           = 'Good' | 'Reduced' | 'Minimal' | 'None';
export type UrineOutput          = 'Normal' | 'Reduced' | 'Minimal' | 'UnableToAssess';
export type BowelMovement        = 'Normal' | 'Constipated' | 'Diarrhea' | 'NoRecentBM';
export type SkinIntegrity        = 'Intact' | 'Dry' | 'Fragile' | 'Edematous' | 'Other';
export type Distress             = 'None' | 'Mild' | 'Moderate' | 'Severe';
export type CodeStatus           = 'FullResuscitation' | 'DNAR' | 'Other';
export type PRNEffectiveness     = 'Effective' | 'PartiallyEffective' | 'Ineffective';
export type MedicationSideEffect = 'None' | 'Yes';

export type GoalOfCare =
  | 'ComfortSymptomControl'
  | 'QualityOfLife'
  | 'FunctionalSupport'
  | 'DiseaseDirectedTreatment'
  | 'EndOfLifeCare'
  | 'HomeHospiceCare'
  | 'Other';

export type NursingCareProvided =
  | 'PositioningComfortMeasures'
  | 'PersonalHygiene'
  | 'OralCare'
  | 'PressureInjuryPrevention'
  | 'WoundCare'
  | 'OxygenTherapy'
  | 'SymptomMonitoring'
  | 'MedicationAdministration'
  | 'NutritionHydrationSupport'
  | 'EmotionalSupport'
  | 'FamilyCaregiverEducation'
  | 'Other';

export type InvestigationPerformed =
  | 'LaboratoryTests'
  | 'Imaging'
  | 'ECGOtherDiagnosticTest'
  | 'None'
  | 'Other';

export type MoodBehavior =
  | 'Calm'
  | 'Anxious'
  | 'Fearful'
  | 'Sad'
  | 'Depressed'
  | 'Agitated'
  | 'Withdrawn';

// ─────────────────────────────────────────────────────────────
// Main document — the API response shape (fully materialized)
//
// This is what the backend returns. Every enum-valued field is
// either a real enum value or `null` (never `''`), because the
// service layer converts `undefined` → `null` before Prisma.
// ─────────────────────────────────────────────────────────────

export interface ProgressNote {
  id: string;
  patientId: string;
  admissionId?: string | null;
  createdAt: string;
  updatedAt?: string | null;

  // Header
  attendingClinician: string;
  palliativeCareUnit: string;
  dayOfAdmission?: string | null;

  // 1 — Current Clinical Status
  generalCondition: GeneralCondition | null;
  levelOfConsciousness: Consciousness | null;
  orientation: Orientation | null;
  functionalStatus: FunctionalStatus | null;
  changesSincePreviousReview: string;

  // 2 — Vitals
  vitals: {
    temperature:     { current: string; previous: string };
    pulse:           { current: string; previous: string };
    respiratoryRate: { current: string; previous: string };
    bloodPressure:   { current: string; previous: string };
    spo2:            { current: string; previous: string };
    oxygenFlow:      { current: string; previous: string };
  };
  otherRelevantObservations: string;

  // 3 — Symptoms
  symptoms: Record<string, ProgressNoteSymptomRow>;
  painScore: string;
  painLocation: string;
  painCharacter: string;
  currentPainManagement: string;
  responseToTreatment: ResponseToTreatment | null;
  breakthroughPainEpisodes: YesNo | null;
  breakthroughPainFrequency: string;

  // 4 — Respiratory
  breathing: Breathing | null;
  oxygenTherapy: YesNo | null;
  oxygenDelivery: OxygenDelivery | null;
  oxygenDeliveryOther: string;
  respiratorySecretions: Secretions | null;
  cough: YesNo | null;
  otherRespiratoryFindings: string;

  // 5 — Nutrition
  oralIntake: OralIntake | null;
  diet: string;
  fluidIntake: string;
  feedingAssistance: YesNo | null;
  enteralFeeding: YesNo | null;
  ivFluids: YesNo | null;
  nauseaVomitingAffectingIntake: YesNo | null;
  nutritionHydrationConcerns: string;

  // 6 — Elimination
  urineOutput: UrineOutput | null;
  urinaryCatheter: YesNo | null;
  bowelMovement: BowelMovement | null;
  lastBowelMovement: string;
  otherEliminationConcerns: string;

  // 7 — Skin
  skin: SkinIntegrity | null;
  skinOther: string;
  pressureInjury: YesNo | null;
  pressureInjuryLocationStage: string;
  woundCareProvided: YesNo | null;
  woundPressureInjuryChanges: string;

  // 8 — Psychological
  moodBehavior: MoodBehavior[];
  psychologicalDistress: Distress | null;
  patientsMainConcernsToday: string;
  counselingPsychologicalSupportProvided: YesNo | null;

  // 9 — Spiritual
  spiritualDistressIdentified: YesNo | null;
  patientsSpiritualCulturalConcerns: string;
  spiritualCareProvided: YesNo | null;
  spiritualReferralRequired: YesNo | null;
  spiritualNotes: string;

  // 10 — Family
  familyCaregiverPresent: YesNo | null;
  familyCaregiverConcerns: string;
  familyEducationSupportProvided: string;
  familyMeetingHeld: YesNo | null;
  familyMeetingParticipants: string;

  // 11 — Goals of Care
  currentGoalsOfCare: GoalOfCare[];
  currentGoalsOfCareOther: string;
  goalsReviewedToday: YesNo | null;
  changeInGoalsIdentified: YesNo | null;
  patientDecisionMakerPreferences: string;
  codeStatus: CodeStatus | null;
  codeStatusOther: string;
  advanceCarePlanReviewed: YesNo | null;

  // 12 — Medication Review
  currentMedicationRegimenReviewed: YesNo | null;
  changesMade: YesNo | null;
  medications: ProgressNoteMedRow[];
  prnBreakthroughMedicationUsed: YesNo | null;
  prnEffectiveness: PRNEffectiveness | null;
  medicationSideEffects: MedicationSideEffect | null;
  medicationSideEffectsDetail: string;

  // 13 — Nursing
  nursingSupportiveCareProvided: NursingCareProvided[];
  nursingSupportiveCareOther: string;
  responseToSupportiveCare: string;

  // 14 — Investigations
  investigationsPerformedReviewed: InvestigationPerformed[];
  investigationsPerformedReviewedOther: string;
  significantResults: string;
  clinicalSignificanceActionTaken: string;

  // 15 — MDT Review
  multidisciplinaryTeamReview: ProgressNoteMDTRow[];

  // 16 — Assessment
  overallAssessment: string;
  problemsIdentifiedToday: string[];

  // 17 — Plan
  symptomManagementPlan: string;
  medicationPlan: string;
  nursingSupportiveCarePlan: string;
  investigationsMonitoring: string;
  familyCaregiverPlan: string;
  referralsConsultations: string;
  dischargeTransferHospicePlanning: string;

  // 18 — SOAP
  soapSubjective: string;
  soapObjective: string;
  soapAssessment: string;
  soapPlan: string;

  // 19 — Additional Notes
  additionalProgressNotes: ProgressNoteAdditionalEntry[];

  // 20 — Authorization
  responsibleClinician?: {
    staffId: string;
    name: string;
    role: string;
    email?: string;
  } | null;
  signatures: ProgressNoteSignature[];
  allSigned: boolean;
  facilityStamp: string;
}

// ─────────────────────────────────────────────────────────────
// List DTO
// ─────────────────────────────────────────────────────────────

export interface ProgressNoteListItem {
  id: string;
  admissionId?: string;
  ward?: string;
  bedNumber?: string;
  attendingClinician: string;
  palliativeCareUnit: string;
  generalCondition: GeneralCondition | null;
  levelOfConsciousness: Consciousness | null;
  overallAssessment: string;
  soapSubjective: string;
  responsibleClinician: {
    staffId: string;
    name: string;
    role: string;
  } | null;
  signatures: ProgressNoteSignature[];
  allSigned: boolean;
  createdBy: { id: string; name: string; role: string } | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  deletionReason?: string | null;
}

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

export function useProgressNotes(
  patientId: string,
  params?: {
    admissionId?: string;
    includeDeleted?: boolean;
    page?: number;
    limit?: number;
  },
) {
  const includeDeleted = params?.includeDeleted === true;

  return useQuery({
    queryKey: ['patients', patientId, 'progress-notes', params],
    queryFn: () =>
      includeDeleted
        ? progressNotesApi.getAllForPatient(patientId, params)
        : progressNotesApi.getByPatient(patientId, params),
    enabled: !!patientId,
  });
}

export function useProgressNote(patientId: string, noteId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'progress-notes', noteId],
    queryFn: () => progressNotesApi.getById(patientId, noteId),
    enabled: !!patientId && !!noteId,
  });
}

export function useProgressNoteSignatures(patientId: string, noteId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'progress-notes', noteId, 'signatures'],
    queryFn: () => progressNotesApi.getSignatures(patientId, noteId),
    enabled: !!patientId && !!noteId,
  });
}

// ─────────────────────────────────────────────────────────────
// Mutations
//
// The payload is the FLAT shape the backend accepts. The
// serializer in RecordProgressNotePage converts the frontend's
// nested form data into that flat shape before calling these.
// ─────────────────────────────────────────────────────────────

export function useCreateProgressNote(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateProgressNoteFormData) =>
      progressNotesApi.create(patientId, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'progress-notes'],
      });
      toast.success('Progress note saved successfully.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Failed to save progress note.';
      toast.error(msg);
    },
  });
}

export function useUpdateProgressNote(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      noteId,
      data,
    }: {
      noteId: string;
      data: Partial<CreateProgressNoteFormData>;
    }) => progressNotesApi.update(patientId, noteId, data as any),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'progress-notes'],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'progress-notes', variables.noteId],
      });
      toast.success('Progress note updated successfully.');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? 'Failed to update progress note.',
      );
    },
  });
}

export function useDeleteProgressNote(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (noteId: string) => progressNotesApi.delete(patientId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'progress-notes'],
      });
      toast.success('Progress note deleted.');
    },
    onError: () => {
      toast.error('Failed to delete progress note. Please try again.');
    },
  });
}

export function useSignProgressNote(patientId: string, noteId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      role: 'Physician' | 'Nurse' | 'Reviewer';
    }) => progressNotesApi.sign(patientId, noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'progress-notes', noteId],
      });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'progress-notes', noteId, 'signatures'],
      });
      toast.success('Signature added successfully.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Failed to sign.';
      toast.error(msg);
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Helper: build a blank note the backend will accept
//
// Returns `CreateProgressNoteFormData` — the exact type React
// Hook Form uses as its generic. Every enum-valued field is
// `undefined` (not `''`), and every other field carries the
// default the UI binds to.
// ─────────────────────────────────────────────────────────────

export function buildBlankProgressNote(
  attendingClinician: string,
): CreateProgressNoteFormData {
  const SYMPTOM_KEYS = [
    'Pain', 'Shortness of Breath', 'Nausea', 'Vomiting', 'Constipation',
    'Diarrhea', 'Fatigue', 'Anxiety', 'Delirium/Confusion',
    'Insomnia', 'Appetite Loss', 'Other',
  ];

  const MDT_DISCIPLINES = [
    'Physician/Palliative Medicine', 'Nursing', 'Pharmacy', 'Dietitian',
    'Physiotherapy', 'Psychology/Counseling', 'Social Work', 'Spiritual Care', 'Other',
  ];

  const vitalsPair = () => ({ current: '', previous: '' });

  return {
    admissionId: undefined,

    attendingClinician,
    palliativeCareUnit: 'Palliative Care Unit',

    // ── Enums: undefined, NOT '' ──
    generalCondition: undefined,
    levelOfConsciousness: undefined,
    orientation: undefined,
    functionalStatus: undefined,
    changesSincePreviousReview: '',

    vitals: {
      temperature:     vitalsPair(),
      pulse:           vitalsPair(),
      respiratoryRate: vitalsPair(),
      bloodPressure:   vitalsPair(),
      spo2:            vitalsPair(),
      oxygenFlow:      vitalsPair(),
    },
    otherRelevantObservations: '',

    symptoms: Object.fromEntries(
      SYMPTOM_KEYS.map((k) => [k, { severity: 'None' as const, notes: '' }]),
    ),
    painScore: '',
    painLocation: '',
    painCharacter: '',
    currentPainManagement: '',
    responseToTreatment: undefined,
    breakthroughPainEpisodes: undefined,
    breakthroughPainFrequency: '',

    breathing: undefined,
    oxygenTherapy: undefined,
    oxygenDelivery: undefined,
    oxygenDeliveryOther: '',
    respiratorySecretions: undefined,
    cough: undefined,
    otherRespiratoryFindings: '',

    oralIntake: undefined,
    diet: '',
    fluidIntake: '',
    feedingAssistance: undefined,
    enteralFeeding: undefined,
    ivFluids: undefined,
    nauseaVomitingAffectingIntake: undefined,
    nutritionHydrationConcerns: '',

    urineOutput: undefined,
    urinaryCatheter: undefined,
    bowelMovement: undefined,
    lastBowelMovement: '',
    otherEliminationConcerns: '',

    skin: undefined,
    skinOther: '',
    pressureInjury: undefined,
    pressureInjuryLocationStage: '',
    woundCareProvided: undefined,
    woundPressureInjuryChanges: '',

    moodBehavior: [],
    psychologicalDistress: undefined,
    patientsMainConcernsToday: '',
    counselingPsychologicalSupportProvided: undefined,

    spiritualDistressIdentified: undefined,
    patientsSpiritualCulturalConcerns: '',
    spiritualCareProvided: undefined,
    spiritualReferralRequired: undefined,
    spiritualNotes: '',

    familyCaregiverPresent: undefined,
    familyCaregiverConcerns: '',
    familyEducationSupportProvided: '',
    familyMeetingHeld: undefined,
    familyMeetingParticipants: '',

    currentGoalsOfCare: [],
    currentGoalsOfCareOther: '',
    goalsReviewedToday: undefined,
    changeInGoalsIdentified: undefined,
    patientDecisionMakerPreferences: '',
    codeStatus: undefined,
    codeStatusOther: '',
    advanceCarePlanReviewed: undefined,

    currentMedicationRegimenReviewed: undefined,
    changesMade: undefined,
    medications: [
      { medicationTreatment: '', dose: '', route: '', frequency: '', reasonResponse: '' },
    ],
    prnBreakthroughMedicationUsed: undefined,
    prnEffectiveness: undefined,
    medicationSideEffects: undefined,
    medicationSideEffectsDetail: '',

    nursingSupportiveCareProvided: [],
    nursingSupportiveCareOther: '',
    responseToSupportiveCare: '',

    investigationsPerformedReviewed: [],
    investigationsPerformedReviewedOther: '',
    significantResults: '',
    clinicalSignificanceActionTaken: '',

    multidisciplinaryTeamReview: MDT_DISCIPLINES.map((d) => ({
      discipline: d,
      reviewIntervention: '',
      followUpRequired: undefined,
    })),

    overallAssessment: '',
    problemsIdentifiedToday: [],

    symptomManagementPlan: '',
    medicationPlan: '',
    nursingSupportiveCarePlan: '',
    investigationsMonitoring: '',
    familyCaregiverPlan: '',
    referralsConsultations: '',
    dischargeTransferHospicePlanning: '',

    soapSubjective: '',
    soapObjective: '',
    soapAssessment: '',
    soapPlan: '',

    additionalProgressNotes: [],

    facilityStamp: '',
  };
}