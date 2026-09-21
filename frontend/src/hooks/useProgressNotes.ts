import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressNotesApi } from '@/api/progress-notes';
import { useToast } from '@/context/ToastContext';

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
  followUpRequired: 'No' | 'Yes' | '';
}

export interface ProgressNoteSignature {
  staffId: string;
  name: string;
  role: 'Physician' | 'Nurse' | 'Reviewer';
  signedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Main document
// ─────────────────────────────────────────────────────────────

export interface ProgressNote {
  id: string;
  patientId: string;
  admissionId?: string | null;
  createdAt: string;
  updatedAt?: string | null;

  // ── Header ──
  attendingClinician: string;
  palliativeCareUnit: string;
  dayOfAdmission?: string | null;

  // ── Section 1: Current Clinical Status ──
  generalCondition: string;
  levelOfConsciousness: string;
  orientation: string;
  functionalStatus: string;
  changesSincePreviousReview: string;

  // ── Section 2: Vital Signs ──
  vitals: {
    temperature: { current: string; previous: string };
    pulse: { current: string; previous: string };
    respiratoryRate: { current: string; previous: string };
    bloodPressure: { current: string; previous: string };
    spo2: { current: string; previous: string };
    oxygenFlow: { current: string; previous: string };
  };
  otherRelevantObservations: string;

  // ── Section 3: Symptom Assessment ──
  symptoms: Record<string, ProgressNoteSymptomRow>;
  painScore: string;
  painLocation: string;
  painCharacter: string;
  currentPainManagement: string;
  responseToTreatment: string;
  breakthroughPainEpisodes: string;
  breakthroughPainFrequency: string;

  // ── Section 4: Respiratory ──
  breathing: string;
  oxygenTherapy: string;
  oxygenDelivery: string;
  oxygenDeliveryOther: string;
  respiratorySecretions: string;
  cough: string;
  otherRespiratoryFindings: string;

  // ── Section 5: Nutrition & Hydration ──
  oralIntake: string;
  diet: string;
  fluidIntake: string;
  feedingAssistance: string;
  enteralFeeding: string;
  ivFluids: string;
  nauseaVomitingAffectingIntake: string;
  nutritionHydrationConcerns: string;

  // ── Section 6: Elimination ──
  urineOutput: string;
  urinaryCatheter: string;
  bowelMovement: string;
  lastBowelMovement: string;
  otherEliminationConcerns: string;

  // ── Section 7: Skin & Wound ──
  skin: string;
  skinOther: string;
  pressureInjury: string;
  pressureInjuryLocationStage: string;
  woundCareProvided: string;
  woundPressureInjuryChanges: string;

  // ── Section 8: Psychological / Emotional ──
  moodBehavior: string[];
  psychologicalDistress: string;
  patientsMainConcernsToday: string;
  counselingPsychologicalSupportProvided: string;

  // ── Section 9: Spiritual / Cultural ──
  spiritualDistressIdentified: string;
  patientsSpiritualCulturalConcerns: string;
  spiritualCareProvided: string;
  spiritualReferralRequired: string;
  spiritualNotes: string;

  // ── Section 10: Family / Caregiver ──
  familyCaregiverPresent: string;
  familyCaregiverConcerns: string;
  familyEducationSupportProvided: string;
  familyMeetingHeld: string;
  familyMeetingParticipants: string;

  // ── Section 11: Goals of Care ──
  currentGoalsOfCare: string[];
  currentGoalsOfCareOther: string;
  goalsReviewedToday: string;
  changeInGoalsIdentified: string;
  patientDecisionMakerPreferences: string;
  codeStatus: string;
  codeStatusOther: string;
  advanceCarePlanReviewed: string;

  // ── Section 12: Medication Review ──
  currentMedicationRegimenReviewed: string;
  changesMade: string;
  medications: ProgressNoteMedRow[];
  prnBreakthroughMedicationUsed: string;
  prnEffectiveness: string;
  medicationSideEffects: string;
  medicationSideEffectsDetail: string;

  // ── Section 13: Nursing / Supportive Care ──
  nursingSupportiveCareProvided: string[];
  nursingSupportiveCareOther: string;
  responseToSupportiveCare: string;

  // ── Section 14: Investigations ──
  investigationsPerformedReviewed: string[];
  investigationsPerformedReviewedOther: string;
  significantResults: string;
  clinicalSignificanceActionTaken: string;

  // ── Section 15: MDT Review ──
  multidisciplinaryTeamReview: ProgressNoteMDTRow[];

  // ── Section 16: Assessment ──
  overallAssessment: string;
  problemsIdentifiedToday: string[];

  // ── Section 17: Plan ──
  symptomManagementPlan: string;
  medicationPlan: string;
  nursingSupportiveCarePlan: string;
  investigationsMonitoring: string;
  familyCaregiverPlan: string;
  referralsConsultations: string;
  dischargeTransferHospicePlanning: string;

  // ── Section 18: SOAP ──
  soapSubjective: string;
  soapObjective: string;
  soapAssessment: string;
  soapPlan: string;

  // ── Section 19: Additional Progress Notes ──
  additionalProgressNotes: ProgressNoteAdditionalEntry[];

  // ── Section 20: Authorization / Signatures ──
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
  generalCondition: string;
  levelOfConsciousness: string;
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

  /** Soft-delete metadata — populated by the `/all` endpoint */
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
// ─────────────────────────────────────────────────────────────

export function useCreateProgressNote(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>) =>
      progressNotesApi.create(patientId, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'progress-notes'] });
      toast.success('Progress note saved successfully.');
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ?? 'Failed to save progress note.';
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
      data: Partial<Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>>;
    }) => progressNotesApi.update(patientId, noteId, data as any),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'progress-notes'] });
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'progress-notes', variables.noteId],
      });
      toast.success('Progress note updated successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to update progress note.');
    },
  });
}

export function useDeleteProgressNote(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (noteId: string) => progressNotesApi.delete(patientId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'progress-notes'] });
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
// ─────────────────────────────────────────────────────────────

export function buildBlankProgressNote(
  attendingClinician: string,
): Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'> {
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
    updatedAt: null,
    dayOfAdmission: null,

    attendingClinician,
    palliativeCareUnit: 'Palliative Care Unit',

    generalCondition: '',
    levelOfConsciousness: '',
    orientation: '',
    functionalStatus: '',
    changesSincePreviousReview: '',

    vitals: {
      temperature: vitalsPair(),
      pulse: vitalsPair(),
      respiratoryRate: vitalsPair(),
      bloodPressure: vitalsPair(),
      spo2: vitalsPair(),
      oxygenFlow: vitalsPair(),
    },
    otherRelevantObservations: '',

    symptoms: Object.fromEntries(
      SYMPTOM_KEYS.map((k) => [k, { severity: 'None' as const, notes: '' }]),
    ),
    painScore: '',
    painLocation: '',
    painCharacter: '',
    currentPainManagement: '',
    responseToTreatment: '',
    breakthroughPainEpisodes: '',
    breakthroughPainFrequency: '',

    breathing: '',
    oxygenTherapy: '',
    oxygenDelivery: '',
    oxygenDeliveryOther: '',
    respiratorySecretions: '',
    cough: '',
    otherRespiratoryFindings: '',

    oralIntake: '',
    diet: '',
    fluidIntake: '',
    feedingAssistance: '',
    enteralFeeding: '',
    ivFluids: '',
    nauseaVomitingAffectingIntake: '',
    nutritionHydrationConcerns: '',

    urineOutput: '',
    urinaryCatheter: '',
    bowelMovement: '',
    lastBowelMovement: '',
    otherEliminationConcerns: '',

    skin: '',
    skinOther: '',
    pressureInjury: '',
    pressureInjuryLocationStage: '',
    woundCareProvided: '',
    woundPressureInjuryChanges: '',

    moodBehavior: [],
    psychologicalDistress: '',
    patientsMainConcernsToday: '',
    counselingPsychologicalSupportProvided: '',

    spiritualDistressIdentified: '',
    patientsSpiritualCulturalConcerns: '',
    spiritualCareProvided: '',
    spiritualReferralRequired: '',
    spiritualNotes: '',

    familyCaregiverPresent: '',
    familyCaregiverConcerns: '',
    familyEducationSupportProvided: '',
    familyMeetingHeld: '',
    familyMeetingParticipants: '',

    currentGoalsOfCare: [],
    currentGoalsOfCareOther: '',
    goalsReviewedToday: '',
    changeInGoalsIdentified: '',
    patientDecisionMakerPreferences: '',
    codeStatus: '',
    codeStatusOther: '',
    advanceCarePlanReviewed: '',

    currentMedicationRegimenReviewed: '',
    changesMade: '',
    medications: [
      { medicationTreatment: '', dose: '', route: '', frequency: '', reasonResponse: '' },
    ],
    prnBreakthroughMedicationUsed: '',
    prnEffectiveness: '',
    medicationSideEffects: '',
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
      followUpRequired: '' as const,
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

    responsibleClinician: null,
    signatures: [],
    allSigned: false,
    facilityStamp: '',
  };
}