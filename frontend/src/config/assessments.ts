import type { StaffRole } from '@/types/auth.types';

export type AssessmentKey =
  | 'pain'
  | 'pharmacist'
  | 'physiotherapy'
  | 'family'
  | 'nutritional'
  | 'social'
  | 'spiritual'
  | 'psychiatry';

export interface AssessmentDef {
  key: AssessmentKey;
  label: string;
  shortLabel: string;
  description: string;
  routeBase: string;
  icon: string;
  accentColor: string;
  /** Permission key that gates write access. */
  writePermission: string;
  /** Permission key that gates read access. */
  viewPermission: string;
}

export const ASSESSMENTS: Record<AssessmentKey, AssessmentDef> = {
  pain: {
    key: 'pain',
    label: 'Pain Assessment',
    shortLabel: 'Pain',
    description: 'Comprehensive pain history, severity, and management plan.',
    routeBase: 'pain',
    icon: '',
    accentColor: 'text-red-600',
    writePermission: 'canWritePainAssessment',
    viewPermission: 'canViewPainAssessment',
  },
  pharmacist: {
    key: 'pharmacist',
    label: 'Pharmacist Assessment',
    shortLabel: 'Pharmacist',
    description: 'Medication review, safety, and pharmaceutical care plan.',
    routeBase: 'pharmacist-assessment',
    icon: '',
    accentColor: 'text-green-600',
    writePermission: 'canWritePharmacistAssessment',
    viewPermission: 'canViewPharmacistAssessment',
  },
  physiotherapy: {
    key: 'physiotherapy',
    label: 'Physiotherapy Assessment',
    shortLabel: 'Physiotherapy',
    description: 'Mobility, function, and rehabilitation assessment.',
    routeBase: 'physiotherapy-assessment',
    icon: '',
    accentColor: 'text-indigo-600',
    writePermission: 'canWritePhysiotherapyAssessment',
    viewPermission: 'canViewPhysiotherapyAssessment',
  },
  family: {
    key: 'family',
    label: 'Family Assessment',
    shortLabel: 'Family',
    description: 'Family structure, caregiver burden, and support system.',
    routeBase: 'family-assessment',
    icon: '',
    accentColor: 'text-orange-600',
    writePermission: 'canWriteFamilyAssessment',
    viewPermission: 'canViewFamilyAssessment',
  },
  nutritional: {
    key: 'nutritional',
    label: 'Nutritional Assessment',
    shortLabel: 'Nutrition',
    description: 'Dietary intake, nutritional status, and care plan.',
    routeBase: 'nutritional-assessment',
    icon: '',
    accentColor: 'text-emerald-600',
    writePermission: 'canWriteNutritionalAssessment',
    viewPermission: 'canViewNutritionalAssessment',
  },
  social: {
    key: 'social',
    label: 'Social Assessment',
    shortLabel: 'Social',
    description: 'Living situation, financial, and social support assessment.',
    routeBase: 'social-assessment',
    icon: '',
    accentColor: 'text-cyan-600',
    writePermission: 'canWriteSocialAssessment',
    viewPermission: 'canViewSocialAssessment',
  },
  spiritual: {
    key: 'spiritual',
    label: 'Spiritual Assessment',
    shortLabel: 'Spiritual',
    description: 'Spiritual beliefs, support needs, and end-of-life preferences.',
    routeBase: 'spiritual-assessment',
    icon: '',
    accentColor: 'text-violet-600',
    writePermission: 'canWriteSpiritualAssessment',
    viewPermission: 'canViewSpiritualAssessment',
  },
  psychiatry: {
    key: 'psychiatry',
    label: 'Psychiatry Assessment',
    shortLabel: 'Psychiatry',
    description: 'Mental state, suicide risk, and psychiatric care plan.',
    routeBase: 'psychiatry-assessment',
    icon: '',
    accentColor: 'text-fuchsia-600',
    writePermission: 'canWritePsychiatryAssessment',
    viewPermission: 'canViewPsychiatryAssessment',
  },
};

export const ROLE_ASSESSMENTS: Record<string, AssessmentKey[]> = {
  Physician: ['pain'],
  Nurse: ['pain'],
  Pharmacist: ['pharmacist'],
  Physiologist: ['physiotherapy'],
  Nutritionist: ['nutritional'],
  SocialWorker: ['family', 'social'],
  Psychologist: ['psychiatry'],
  Psychiatrist: ['psychiatry'],
  SpiritualPerson: ['spiritual'],
  Radiologist: [],
  LaboratoryTechnician: [],
};

export function getAssessmentsForRole(
  role?: StaffRole | string | null,
  isAdmin = false,
): AssessmentDef[] {
  if (isAdmin) return Object.values(ASSESSMENTS);
  if (!role) return [];
  return (ROLE_ASSESSMENTS[role] ?? []).map((k) => ASSESSMENTS[k]);
}

export function getAssessmentDef(key: AssessmentKey): AssessmentDef {
  return ASSESSMENTS[key];
}