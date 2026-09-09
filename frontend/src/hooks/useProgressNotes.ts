/**
 * useProgressNotes
 * ─────────────────
 * Hook for managing Patient Progress Notes with API integration.
 * Uses React Query for data fetching and caching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressNotesApi } from '@/api/progress-notes';
import { useToast } from '@/context/ToastContext';

// ── Types ──────────────────────────────────────────────────────────

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
  id: string;
  date: string;
  time: string;
  note: string;
  clinicianName: string;
  signature: string;
}

export interface ProgressNoteMDTRow {
  discipline: string;
  reviewIntervention: string;
  followUpRequired: string; // 'Yes' | 'No' | ''
}

export interface ProgressNote {
  id: string;
  patientId: string;
  createdAt: string;

  // ── Header ──
  hospitalName: string;
  palliativeCareUnit: string;
  patientName: string;
  patientMRN: string;
  date: string;
  time: string;
  dayOfAdmission: string;
  attendingClinician: string;

  // ── 1. Current Clinical Status ──
  generalCondition: string;
  levelOfConsciousness: string;
  orientation: string;
  functionalStatus: string;
  changesSincePreviousReview: string;

  // ── 2. Vital Signs ──
  vitals: {
    temperature: { current: string; previous: string };
    pulse: { current: string; previous: string };
    respiratoryRate: { current: string; previous: string };
    bloodPressure: { current: string; previous: string };
    spo2: { current: string; previous: string };
    oxygenFlow: { current: string; previous: string };
  };
  otherRelevantObservations: string;

  // ── 3. Symptom Assessment ──
  symptoms: Record<string, ProgressNoteSymptomRow>;
  painScore: string;
  painLocation: string;
  painCharacter: string;
  currentPainManagement: string;
  responseToTreatment: string;
  breakthroughPainEpisodes: string;
  breakthroughPainFrequency: string;

  // ── 4. Respiratory Status ──
  breathing: string;
  oxygenTherapy: string;
  oxygenDelivery: string;
  oxygenDeliveryOther: string;
  respiratorySecretions: string;
  cough: string;
  otherRespiratoryFindings: string;

  // ── 5. Nutrition and Hydration ──
  oralIntake: string;
  diet: string;
  fluidIntake: string;
  feedingAssistance: string;
  enteralFeeding: string;
  ivFluids: string;
  nauseaVomitingAffectingIntake: string;
  nutritionHydrationConcerns: string;

  // ── 6. Elimination ──
  urineOutput: string;
  urinaryCatheter: string;
  bowelMovement: string;
  lastBowelMovement: string;
  otherEliminationConcerns: string;

  // ── 7. Skin and Wound Status ──
  skin: string;
  skinOther: string;
  pressureInjury: string;
  pressureInjuryLocationStage: string;
  woundCareProvided: string;
  woundChanges: string;

  // ── 8. Psychological / Emotional Status ──
  moodBehavior: string[];
  psychologicalDistress: string;
  patientMainConcerns: string;
  counselingProvided: string;

  // ── 9. Spiritual / Cultural Needs ──
  spiritualDistress: string;
  spiritualCulturalConcerns: string;
  spiritualCareProvided: string;
  spiritualReferralRequired: string;
  spiritualNotes: string;

  // ── 10. Family / Caregiver Update ──
  familyCaregiverPresent: string;
  familyCaregiverConcerns: string;
  educationSupportProvided: string;
  familyMeetingHeld: string;
  familyMeetingParticipants: string;

  // ── 11. Goals of Care Review ──
  currentGoalsOfCare: string[];
  currentGoalsOfCareOther: string;
  goalsReviewedToday: string;
  changeInGoals: string;
  patientDecisionMakerPreferences: string;
  codeStatus: string;
  codeStatusOther: string;
  advanceCarePlanReviewed: string;

  // ── 12. Medication Review ──
  medicationRegimenReviewed: string;
  medicationChangesMade: string;
  prnMedicationUsed: string;
  prnEffectiveness: string;
  medicationSideEffects: string;
  medicationSideEffectsDetail: string;
  medications: ProgressNoteMedRow[];

  // ── 13. Nursing / Supportive Care ──
  nursingCareProvided: string[];
  nursingCareOther: string;
  responseToSupportiveCare: string;

  // ── 14. Investigations / Results ──
  investigationsPerformed: string[];
  investigationsOther: string;
  significantResults: string;
  clinicalSignificanceAction: string;

  // ── 15. MDT Review ──
  mdtReview: ProgressNoteMDTRow[];

  // ── 16. Clinical Assessment ──
  overallAssessment: string;
  problemsIdentifiedToday: string;

  // ── 17. Plan for Next Period ──
  symptomManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  investigationsMonitoring: string;
  familyCaregiverPlan: string;
  referralsConsultations: string;
  dischargeTransferHospicePlanning: string;

  // ── 18. SOAP ──
  soapSubjective: string;
  soapObjective: string;
  soapAssessment: string;
  soapPlan: string;

  // ── 19. Additional Progress Notes ──
  additionalNotes: ProgressNoteAdditionalEntry[];

  // ── 20. Authorization ──
  responsibleClinician: string;
  responsibleClinicianSignature: string;
  responsibleClinicianDateTime: string;
  palliativeCareNurse: string;
  palliativeCareNurseSignature: string;
  palliativeCareNurseDateTime: string;
  reviewedBy: string;
  reviewedBySignature: string;
  reviewedByDateTime: string;
  facilityStamp: string;
}

// ── React Query Hooks ─────────────────────────────────────────────

export function useProgressNotes(patientId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['patients', patientId, 'progress-notes', params],
    queryFn: () => progressNotesApi.getByPatient(patientId, params),
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

export function useCreateProgressNote(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>) =>
      progressNotesApi.create(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'progress-notes'] });
      toast.success('Progress note saved successfully.');
    },
    onError: () => {
      toast.error('Failed to save progress note. Please try again.');
    },
  });
}

export function useUpdateProgressNote(patientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: Partial<Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>> }) =>
      progressNotesApi.update(patientId, noteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'progress-notes'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'progress-notes', variables.noteId] });
      toast.success('Progress note updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update progress note. Please try again.');
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

// ── Helper: build a blank note pre-filled from patient data ─────

export function buildBlankProgressNote(
  patientId: string,
  patientName: string,
  patientMRN: string,
  clinicianName: string,
): Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);

  const SYMPTOM_KEYS = [
    'Pain', 'Shortness of Breath', 'Nausea', 'Vomiting', 'Constipation',
    'Diarrhea', 'Fatigue', 'Anxiety', 'Delirium/Confusion',
    'Insomnia', 'Appetite Loss', 'Other',
  ];

  const MDT_DISCIPLINES = [
    'Physician/Palliative Medicine', 'Nursing', 'Pharmacy', 'Dietitian',
    'Physiotherapy', 'Psychology/Counseling', 'Social Work', 'Spiritual Care', 'Other',
  ];

  return {
    patientId,
    createdAt: now.toISOString(),

    hospitalName: 'Yekatit 12 Hospital Medical College',
    palliativeCareUnit: 'Palliative Care Unit',
    patientName,
    patientMRN,
    date: dateStr,
    time: timeStr,
    dayOfAdmission: '',
    attendingClinician: clinicianName,

    generalCondition: '',
    levelOfConsciousness: '',
    orientation: '',
    functionalStatus: '',
    changesSincePreviousReview: '',

    vitals: {
      temperature: { current: '', previous: '' },
      pulse: { current: '', previous: '' },
      respiratoryRate: { current: '', previous: '' },
      bloodPressure: { current: '', previous: '' },
      spo2: { current: '', previous: '' },
      oxygenFlow: { current: '', previous: '' },
    },
    otherRelevantObservations: '',

    symptoms: Object.fromEntries(
      SYMPTOM_KEYS.map((k) => [k, { severity: 'None' as const, notes: '' }])
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
    woundChanges: '',

    moodBehavior: [],
    psychologicalDistress: '',
    patientMainConcerns: '',
    counselingProvided: '',

    spiritualDistress: '',
    spiritualCulturalConcerns: '',
    spiritualCareProvided: '',
    spiritualReferralRequired: '',
    spiritualNotes: '',

    familyCaregiverPresent: '',
    familyCaregiverConcerns: '',
    educationSupportProvided: '',
    familyMeetingHeld: '',
    familyMeetingParticipants: '',

    currentGoalsOfCare: [],
    currentGoalsOfCareOther: '',
    goalsReviewedToday: '',
    changeInGoals: '',
    patientDecisionMakerPreferences: '',
    codeStatus: '',
    codeStatusOther: '',
    advanceCarePlanReviewed: '',

    medicationRegimenReviewed: '',
    medicationChangesMade: '',
    prnMedicationUsed: '',
    prnEffectiveness: '',
    medicationSideEffects: '',
    medicationSideEffectsDetail: '',
    medications: [{ medicationTreatment: '', dose: '', route: '', frequency: '', reasonResponse: '' }],

    nursingCareProvided: [],
    nursingCareOther: '',
    responseToSupportiveCare: '',

    investigationsPerformed: [],
    investigationsOther: '',
    significantResults: '',
    clinicalSignificanceAction: '',

    mdtReview: MDT_DISCIPLINES.map((d) => ({
      discipline: d,
      reviewIntervention: '',
      followUpRequired: '',
    })),

    overallAssessment: '',
    problemsIdentifiedToday: '',

    symptomManagementPlan: '',
    medicationPlan: '',
    nursingCarePlan: '',
    investigationsMonitoring: '',
    familyCaregiverPlan: '',
    referralsConsultations: '',
    dischargeTransferHospicePlanning: '',

    soapSubjective: '',
    soapObjective: '',
    soapAssessment: '',
    soapPlan: '',

    additionalNotes: [],

    responsibleClinician: clinicianName,
    responsibleClinicianSignature: '',
    responsibleClinicianDateTime: '',
    palliativeCareNurse: '',
    palliativeCareNurseSignature: '',
    palliativeCareNurseDateTime: '',
    reviewedBy: '',
    reviewedBySignature: '',
    reviewedByDateTime: '',
    facilityStamp: '',
  };
}