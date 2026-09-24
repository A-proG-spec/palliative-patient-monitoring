import { useCallback, useMemo, useState } from 'react';
import type { AdminPatientDetail } from '@/types/admin.types';

// ═══════════════════════════════════════════════════════════
// Types (kept identical to the previous modal so nothing downstream
// that reads DischargeSummary needs to change)
// ═══════════════════════════════════════════════════════════

export interface DischargeMedRow {
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  purpose: string;
  instructions: string;
}

export interface DischargeSymptomRow {
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  notes: string;
}

export interface DischargeSummary {
  // A — Header
  hospitalName: string;
  palliativeCareUnit: string;
  dateOfAdmission: string;
  dateOfDischarge: string;
  timeOfDischarge: string;
  dischargeType: string;
  dischargeTypeOther: string;

  // B — Patient
  fullName: string;
  dateOfBirth: string;
  age: string;
  sex: string;
  address: string;
  telephone: string;
  primaryCaregiver: string;
  caregiverRelationship: string;
  caregiverTelephone: string;

  // C — Admission
  primaryDiagnosis: string;
  secondaryDiagnoses: string;
  reasonForAdmission: string;
  referringPhysicianFacility: string;

  // D — Clinical summary
  finalDischargeDiagnosis: string;
  clinicalProblemsManaged: string[];
  summaryOfClinicalCourse: string;
  importantInvestigations: string;

  // E — Condition
  overallCondition: string;
  levelOfConsciousness: string;
  functionalStatus: string;
  mobility: string;
  oralIntake: string;

  // F — Vitals
  temperature: string;
  pulse: string;
  respiratoryRate: string;
  bloodPressure: string;
  oxygenSaturation: string;
  oxygenRequirement: string;

  // G — Symptoms
  symptoms: Record<string, DischargeSymptomRow>;
  painScore: string;
  painControl: string;

  // H — Medications
  dischargeMedications: DischargeMedRow[];
  prnMedications: string;
  medicationChanges: string;
  medicationReconciliation: string;

  // I — Symptom management
  painManagementInstructions: string;
  breathlessnessManagement: string;
  nauseaVomitingManagement: string;
  constipationManagement: string;
  anxietyDeliriumManagement: string;
  otherSymptomManagement: string;

  // J — Nutrition
  diet: string;
  feedingAssistance: string;
  enteralFeeding: string;
  feedingTube: string;
  feedingTubeOther: string;
  hydrationInstructions: string;
  nutritionFollowUp: string;

  // K — Wound
  woundPresent: string;
  woundLocation: string;
  woundCareInstructions: string;
  dressingChanges: string;
  pressureInjuryPrevention: string;

  // L — Equipment
  oxygenRequired: string;
  oxygenDeliveryMethod: string;
  oxygenDeliveryOther: string;
  oxygenFlowRate: string;
  equipmentRequired: string[];
  equipmentOther: string;
  equipmentArranged: string;

  // M — Goals of care
  goalsOfCare: string[];
  goalsOfCareOther: string;
  goalsOfCareReviewed: string;
  patientDecisionMakerPreferences: string;
  codeStatus: string;
  codeStatusOther: string;
  advanceCarePlan: string;

  // N — Destination
  dischargedTo: string;
  dischargedToOther: string;
  destinationAddress: string;
  transport: string;
  transportOther: string;
  escortCaregiver: string;

  // O — Home / hospice
  homePalliativeCareRequired: string;
  hospiceReferral: string;
  communityNursingRequired: string;
  homeVisitsRequired: string;
  caregiverSupportRequired: string;
  servicesArranged: string;
  responsibleProvider: string;
  responsibleProviderPhone: string;

  // P — Education
  educationTopics: string[];
  educationOther: string;
  patientUnderstanding: string;
  additionalEducationRequired: string;

  // Q — Warning signs
  warningSigns: string[];
  warningSignsOther: string;
  warningSignsSpecificInstructions: string;

  // R — Follow-up
  palliativeCareFollowUp: string;
  palliativeCareFollowUpDate: string;
  palliativeCareFollowUpTime: string;
  physicianSpecialistFollowUp: string;
  primaryCareFollowUp: string;
  hospiceHomeCareFollowUp: string;
  otherAppointments: string;

  // S — Contacts
  palliativeCareUnitContact: string;
  palliativeCareUnitPhone: string;
  attendingClinician: string;
  attendingClinicianPhone: string;
  emergencyContactInfo: string;
  homeHospiceService: string;
  homeHospiceServicePhone: string;

  // T — Notes
  dischargeNotes: string;

  // Meta
  submittedBy: string;
  submittedAt: string;
}

// ═══════════════════════════════════════════════════════════
// Section keys — one per wizard step
// ═══════════════════════════════════════════════════════════

export type DischargeSectionKey =
  | 'header'
  | 'patient'
  | 'admission'
  | 'clinical'
  | 'condition'
  | 'vitals'
  | 'symptoms'
  | 'medications'
  | 'symptomMgmt'
  | 'nutrition'
  | 'wound'
  | 'equipment'
  | 'goals'
  | 'destination'
  | 'homeCare'
  | 'education'
  | 'warnings'
  | 'followUp'
  | 'contacts'
  | 'notes';

export interface DischargeSectionDef {
  key: DischargeSectionKey;
  /** Single letter — kept for backward compatibility with `submittedAt` audit. */
  letter: string;
  label: string;
  description: string;
  /** Fields required for the section to be considered "complete". */
  requiredFields: (keyof DischargeSummary)[];
}

export const DISCHARGE_SECTIONS: DischargeSectionDef[] = [
  { key: 'header',       letter: 'A', label: 'Header',            description: 'Facility, dates, discharge type',              requiredFields: ['dateOfDischarge', 'timeOfDischarge', 'dischargeType'] },
  { key: 'patient',      letter: 'B', label: 'Patient',           description: 'Identification and contacts',                  requiredFields: [] },
  { key: 'admission',    letter: 'C', label: 'Admission',         description: 'Diagnosis and reason for admission',           requiredFields: [] },
  { key: 'clinical',     letter: 'D', label: 'Clinical Summary',  description: 'Course, investigations, discharge dx',         requiredFields: [] },
  { key: 'condition',    letter: 'E', label: 'Condition',         description: 'Status at discharge',                          requiredFields: ['overallCondition'] },
  { key: 'vitals',       letter: 'F', label: 'Vital Signs',       description: 'Vitals at discharge',                          requiredFields: [] },
  { key: 'symptoms',     letter: 'G', label: 'Symptoms',          description: 'Symptom-by-symptom status',                    requiredFields: [] },
  { key: 'medications',  letter: 'H', label: 'Medications',       description: 'Discharge medication list and PRN',            requiredFields: [] },
  { key: 'symptomMgmt',  letter: 'I', label: 'Symptom Mgmt',      description: 'Instructions for family',                      requiredFields: [] },
  { key: 'nutrition',    letter: 'J', label: 'Nutrition',         description: 'Diet, feeding, hydration',                     requiredFields: [] },
  { key: 'wound',        letter: 'K', label: 'Wound Care',        description: 'Wound status and care instructions',           requiredFields: [] },
  { key: 'equipment',    letter: 'L', label: 'Equipment',         description: 'Oxygen and home equipment',                    requiredFields: [] },
  { key: 'goals',        letter: 'M', label: 'Goals of Care',     description: 'Goals, code status, ACP',                      requiredFields: [] },
  { key: 'destination',  letter: 'N', label: 'Destination',       description: 'Where the patient is going',                   requiredFields: ['dischargedTo'] },
  { key: 'homeCare',     letter: 'O', label: 'Home / Hospice',    description: 'Post-discharge care plan',                     requiredFields: [] },
  { key: 'education',    letter: 'P', label: 'Education',         description: 'What was taught and understood',               requiredFields: [] },
  { key: 'warnings',     letter: 'Q', label: 'Warning Signs',     description: 'When to seek help',                            requiredFields: [] },
  { key: 'followUp',     letter: 'R', label: 'Follow-up',         description: 'Scheduled follow-ups',                         requiredFields: [] },
  { key: 'contacts',     letter: 'S', label: 'Contacts',          description: 'Unit and clinician contacts',                  requiredFields: [] },
  { key: 'notes',        letter: 'T', label: 'Notes',             description: 'Free-text discharge notes',                    requiredFields: [] },
];

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const SYMPTOM_KEYS = [
  'Pain',
  'Shortness of Breath',
  'Nausea',
  'Vomiting',
  'Constipation',
  'Fatigue',
  'Anxiety',
  'Delirium/Confusion',
  'Appetite Loss',
  'Other',
] as const;

const blankMedRow = (): DischargeMedRow => ({
  medication: '',
  dose: '',
  route: '',
  frequency: '',
  purpose: '',
  instructions: '',
});

const blankSymptoms = (): Record<string, DischargeSymptomRow> =>
  Object.fromEntries(SYMPTOM_KEYS.map((k) => [k, { severity: 'None' as const, notes: '' }]));

// ═══════════════════════════════════════════════════════════
// Initial value builder
// ═══════════════════════════════════════════════════════════

export function buildInitialDischargeSummary(patient: AdminPatientDetail): DischargeSummary {
  const secDx = [
    ...(patient.secondaryDiagnoses ?? []),
    ...(patient.comorbidities ?? []),
  ].join(', ');

  return {
    hospitalName: 'Yekatit 12 Hospital Medical College',
    palliativeCareUnit: 'Palliative Care Unit',
    dateOfAdmission: patient.createdAt ? patient.createdAt.slice(0, 10) : '',
    dateOfDischarge: today(),
    timeOfDischarge: nowTime(),
    dischargeType: '',
    dischargeTypeOther: '',

    fullName: `${patient.firstName} ${patient.lastName}`,
    dateOfBirth: patient.dateOfBirth ?? '',
    age: String(patient.age ?? ''),
    sex: patient.sex ?? '',
    address: patient.address ?? '',
    telephone: patient.phone ?? '',
    primaryCaregiver: patient.caregiverName ?? '',
    caregiverRelationship: '',
    caregiverTelephone: patient.caregiverPhone ?? '',

    primaryDiagnosis: patient.primaryDiagnosis ?? '',
    secondaryDiagnoses: secDx,
    reasonForAdmission: '',
    referringPhysicianFacility: '',

    finalDischargeDiagnosis: '',
    clinicalProblemsManaged: [''],
    summaryOfClinicalCourse: '',
    importantInvestigations: '',

    overallCondition: '',
    levelOfConsciousness: '',
    functionalStatus: '',
    mobility: '',
    oralIntake: '',

    temperature: '',
    pulse: '',
    respiratoryRate: '',
    bloodPressure: '',
    oxygenSaturation: '',
    oxygenRequirement: '',

    symptoms: blankSymptoms(),
    painScore: '',
    painControl: '',

    dischargeMedications: [blankMedRow()],
    prnMedications: '',
    medicationChanges: '',
    medicationReconciliation: '',

    painManagementInstructions: '',
    breathlessnessManagement: '',
    nauseaVomitingManagement: '',
    constipationManagement: '',
    anxietyDeliriumManagement: '',
    otherSymptomManagement: '',

    diet: '',
    feedingAssistance: '',
    enteralFeeding: '',
    feedingTube: '',
    feedingTubeOther: '',
    hydrationInstructions: '',
    nutritionFollowUp: '',

    woundPresent: '',
    woundLocation: '',
    woundCareInstructions: '',
    dressingChanges: '',
    pressureInjuryPrevention: '',

    oxygenRequired: '',
    oxygenDeliveryMethod: '',
    oxygenDeliveryOther: '',
    oxygenFlowRate: '',
    equipmentRequired: [],
    equipmentOther: '',
    equipmentArranged: '',

    goalsOfCare: [],
    goalsOfCareOther: '',
    goalsOfCareReviewed: '',
    patientDecisionMakerPreferences: '',
    codeStatus: '',
    codeStatusOther: '',
    advanceCarePlan: '',

    dischargedTo: '',
    dischargedToOther: '',
    destinationAddress: '',
    transport: '',
    transportOther: '',
    escortCaregiver: '',

    homePalliativeCareRequired: '',
    hospiceReferral: '',
    communityNursingRequired: '',
    homeVisitsRequired: '',
    caregiverSupportRequired: '',
    servicesArranged: '',
    responsibleProvider: '',
    responsibleProviderPhone: '',

    educationTopics: [],
    educationOther: '',
    patientUnderstanding: '',
    additionalEducationRequired: '',

    warningSigns: [],
    warningSignsOther: '',
    warningSignsSpecificInstructions: '',

    palliativeCareFollowUp: '',
    palliativeCareFollowUpDate: '',
    palliativeCareFollowUpTime: '',
    physicianSpecialistFollowUp: '',
    primaryCareFollowUp: '',
    hospiceHomeCareFollowUp: '',
    otherAppointments: '',

    palliativeCareUnitContact: 'Palliative Care Unit',
    palliativeCareUnitPhone: '',
    attendingClinician: '',
    attendingClinicianPhone: '',
    emergencyContactInfo: `${patient.emergencyContactName ?? ''} · ${patient.emergencyContactPhone ?? ''}`,
    homeHospiceService: '',
    homeHospiceServicePhone: '',

    dischargeNotes: '',

    submittedBy: 'Admin',
    submittedAt: '',
  };
}

// ═══════════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════════

export type DischargeErrors = Partial<Record<keyof DischargeSummary, string>>;

export function validateDischargeForm(form: DischargeSummary): DischargeErrors {
  const errors: DischargeErrors = {};
  if (!form.dateOfDischarge) errors.dateOfDischarge = 'Date of discharge is required.';
  if (!form.timeOfDischarge) errors.timeOfDischarge = 'Time of discharge is required.';
  if (!form.dischargeType) errors.dischargeType = 'Discharge type is required.';
  if (!form.overallCondition) errors.overallCondition = 'Overall condition is required.';
  if (!form.dischargedTo) errors.dischargedTo = 'Discharge destination is required.';
  return errors;
}

// ═══════════════════════════════════════════════════════════
// Section completion
// ═══════════════════════════════════════════════════════════

export type SectionState = 'empty' | 'partial' | 'complete' | 'error';

/**
 * Determine whether a field counts as "filled" for progress tracking.
 * Empty arrays and empty strings are both "not filled".
 */
function isFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) {
    // Arrays of empty strings don't count
    return value.some((v) =>
      typeof v === 'string' ? v.trim().length > 0 : Boolean(v),
    );
  }
  if (typeof value === 'object') {
    // Rows of all-empty cells don't count
    return Object.values(value as Record<string, unknown>).some((v) => {
      if (typeof v === 'string') return v.trim().length > 0;
      if (typeof v === 'object' && v !== null) {
        return Object.values(v as Record<string, unknown>).some(
          (inner) => typeof inner === 'string' && inner.trim().length > 0,
        );
      }
      return Boolean(v);
    });
  }
  return Boolean(value);
}

/**
 * Compute the state of a single section:
 *  - error     → has a validation error on a required field
 *  - complete  → all required fields filled + at least one field filled overall
 *  - partial   → some fields filled, but not all required
 *  - empty     → no fields filled
 */
export function getSectionState(
  def: DischargeSectionDef,
  form: DischargeSummary,
  errors: DischargeErrors,
): SectionState {
  const requiredMissing = def.requiredFields.some((f) => !isFilled(form[f]));
  const hasRequiredError = def.requiredFields.some((f) => Boolean(errors[f]));
  if (hasRequiredError || (def.requiredFields.length > 0 && requiredMissing)) {
    return requiredMissing && def.requiredFields.length > 0 ? 'partial' : 'error';
  }
  if (def.requiredFields.length > 0 && !requiredMissing) {
    return 'complete';
  }

  // No required fields — check for any filled field in this section's range.
  // We don't have an explicit field→section map, so section state uses the
  // section label's field list, derived from section-specific keys.
  const someFieldFilled = getSectionFields(def.key).some((f) => isFilled(form[f]));
  return someFieldFilled ? 'complete' : 'empty';
}

/**
 * Map each section to the fields it owns. This is what lets the sidebar
 * show progress and the "Jump to next incomplete" button work.
 */
export function getSectionFields(key: DischargeSectionKey): (keyof DischargeSummary)[] {
  switch (key) {
    case 'header':      return ['hospitalName', 'palliativeCareUnit', 'dateOfAdmission', 'dateOfDischarge', 'timeOfDischarge', 'dischargeType', 'dischargeTypeOther'];
    case 'patient':     return ['fullName', 'dateOfBirth', 'age', 'sex', 'address', 'telephone', 'primaryCaregiver', 'caregiverRelationship', 'caregiverTelephone'];
    case 'admission':   return ['primaryDiagnosis', 'secondaryDiagnoses', 'reasonForAdmission', 'referringPhysicianFacility'];
    case 'clinical':    return ['finalDischargeDiagnosis', 'clinicalProblemsManaged', 'summaryOfClinicalCourse', 'importantInvestigations'];
    case 'condition':   return ['overallCondition', 'levelOfConsciousness', 'functionalStatus', 'mobility', 'oralIntake'];
    case 'vitals':      return ['temperature', 'pulse', 'respiratoryRate', 'bloodPressure', 'oxygenSaturation', 'oxygenRequirement'];
    case 'symptoms':    return ['symptoms', 'painScore', 'painControl'];
    case 'medications': return ['dischargeMedications', 'prnMedications', 'medicationChanges', 'medicationReconciliation'];
    case 'symptomMgmt': return ['painManagementInstructions', 'breathlessnessManagement', 'nauseaVomitingManagement', 'constipationManagement', 'anxietyDeliriumManagement', 'otherSymptomManagement'];
    case 'nutrition':   return ['diet', 'feedingAssistance', 'enteralFeeding', 'feedingTube', 'feedingTubeOther', 'hydrationInstructions', 'nutritionFollowUp'];
    case 'wound':       return ['woundPresent', 'woundLocation', 'woundCareInstructions', 'dressingChanges', 'pressureInjuryPrevention'];
    case 'equipment':   return ['oxygenRequired', 'oxygenDeliveryMethod', 'oxygenDeliveryOther', 'oxygenFlowRate', 'equipmentRequired', 'equipmentOther', 'equipmentArranged'];
    case 'goals':       return ['goalsOfCare', 'goalsOfCareOther', 'goalsOfCareReviewed', 'patientDecisionMakerPreferences', 'codeStatus', 'codeStatusOther', 'advanceCarePlan'];
    case 'destination': return ['dischargedTo', 'dischargedToOther', 'destinationAddress', 'transport', 'transportOther', 'escortCaregiver'];
    case 'homeCare':    return ['homePalliativeCareRequired', 'hospiceReferral', 'communityNursingRequired', 'homeVisitsRequired', 'caregiverSupportRequired', 'servicesArranged', 'responsibleProvider', 'responsibleProviderPhone'];
    case 'education':   return ['educationTopics', 'educationOther', 'patientUnderstanding', 'additionalEducationRequired'];
    case 'warnings':    return ['warningSigns', 'warningSignsOther', 'warningSignsSpecificInstructions'];
    case 'followUp':    return ['palliativeCareFollowUp', 'palliativeCareFollowUpDate', 'palliativeCareFollowUpTime', 'physicianSpecialistFollowUp', 'primaryCareFollowUp', 'hospiceHomeCareFollowUp', 'otherAppointments'];
    case 'contacts':    return ['palliativeCareUnitContact', 'palliativeCareUnitPhone', 'attendingClinician', 'attendingClinicianPhone', 'emergencyContactInfo', 'homeHospiceService', 'homeHospiceServicePhone'];
    case 'notes':       return ['dischargeNotes'];
  }
}

// ═══════════════════════════════════════════════════════════
// The hook
// ═══════════════════════════════════════════════════════════

export interface UseDischargeFormStateResult {
  form: DischargeSummary;
  set: <K extends keyof DischargeSummary>(key: K, value: DischargeSummary[K]) => void;
  errors: DischargeErrors;
  isDirty: boolean;
  sectionStates: Record<DischargeSectionKey, SectionState>;
  requiredMissing: (keyof DischargeSummary)[];
  progress: { completed: number; total: number };
  setErrors: (errors: DischargeErrors) => void;
  markSubmitted: () => void;
}

export function useDischargeFormState(
  patient: AdminPatientDetail,
): UseDischargeFormStateResult {
  const [form, setForm] = useState<DischargeSummary>(() =>
    buildInitialDischargeSummary(patient),
  );
  const [errors, setErrors] = useState<DischargeErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const set = useCallback(
    <K extends keyof DischargeSummary>(key: K, value: DischargeSummary[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const sectionStates = useMemo(() => {
    const out = {} as Record<DischargeSectionKey, SectionState>;
    for (const def of DISCHARGE_SECTIONS) {
      out[def.key] = getSectionState(def, form, errors);
    }
    return out;
  }, [form, errors]);

  const requiredMissing = useMemo(
    () =>
      DISCHARGE_SECTIONS.flatMap((s) => s.requiredFields).filter(
        (f) => !isFilled(form[f]),
      ),
    [form],
  );

  const progress = useMemo(() => {
    const total = DISCHARGE_SECTIONS.length;
    const completed = DISCHARGE_SECTIONS.filter(
      (s) => sectionStates[s.key] === 'complete',
    ).length;
    return { completed, total };
  }, [sectionStates]);

  const markSubmitted = useCallback(() => {
    setForm((prev) => ({ ...prev, submittedAt: new Date().toISOString() }));
    setIsDirty(false);
  }, []);

  return {
    form,
    set,
    errors,
    isDirty,
    sectionStates,
    requiredMissing,
    progress,
    setErrors,
    markSubmitted,
  };
}