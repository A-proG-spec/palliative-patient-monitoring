import type { ComponentType } from 'react';
import type { StaffRole } from '@/types/auth.types';

// ═════════════════════════════════════════════════════════════
// Assessment keys — the canonical identifiers used in routing,
// query keys, and role mapping.
// ═════════════════════════════════════════════════════════════

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
  /** Full label used in headers and cards. */
  label: string;
  /** Short label for tight UI spots (sidebar-ish, badges). */
  shortLabel: string;
  /** One-line description for card subtitles. */
  description: string;
  /** URL segment — `/patients/:id/<routeBase>/new` etc. */
  routeBase: string;
  /** Emoji or icon node — kept simple so we don't import 8 icons here. */
  icon: string;
  /** Tailwind text color class for the card icon. */
  accentColor: string;
}

// ═════════════════════════════════════════════════════════════
// Registry — one entry per assessment
// ═════════════════════════════════════════════════════════════

export const ASSESSMENTS: Record<AssessmentKey, AssessmentDef> = {
  pain: {
    key: 'pain',
    label: 'Pain Assessment',
    shortLabel: 'Pain',
    description: 'Comprehensive pain history, severity, and management plan.',
    routeBase: 'pain',
    icon: '🔥',
    accentColor: 'text-red-600',
  },
  pharmacist: {
    key: 'pharmacist',
    label: 'Pharmacist Assessment',
    shortLabel: 'Pharmacist',
    description: 'Medication review, safety, and pharmaceutical care plan.',
    routeBase: 'pharmacist-assessment',
    icon: '💊',
    accentColor: 'text-green-600',
  },
  physiotherapy: {
    key: 'physiotherapy',
    label: 'Physiotherapy Assessment',
    shortLabel: 'Physiotherapy',
    description: 'Mobility, function, and rehabilitation assessment.',
    routeBase: 'physiotherapy-assessment',
    icon: '🦯',
    accentColor: 'text-indigo-600',
  },
  family: {
    key: 'family',
    label: 'Family Assessment',
    shortLabel: 'Family',
    description: 'Family structure, caregiver burden, and support system.',
    routeBase: 'family-assessment',
    icon: '👨‍👩‍👧',
    accentColor: 'text-orange-600',
  },
  nutritional: {
    key: 'nutritional',
    label: 'Nutritional Assessment',
    shortLabel: 'Nutrition',
    description: 'Dietary intake, nutritional status, and care plan.',
    routeBase: 'nutritional-assessment',
    icon: '🥗',
    accentColor: 'text-emerald-600',
  },
  social: {
    key: 'social',
    label: 'Social Assessment',
    shortLabel: 'Social',
    description: 'Living situation, financial, and social support assessment.',
    routeBase: 'social-assessment',
    icon: '🏠',
    accentColor: 'text-cyan-600',
  },
  spiritual: {
    key: 'spiritual',
    label: 'Spiritual Assessment',
    shortLabel: 'Spiritual',
    description: 'Spiritual beliefs, support needs, and end-of-life preferences.',
    routeBase: 'spiritual-assessment',
    icon: '🕊️',
    accentColor: 'text-violet-600',
  },
  psychiatry: {
    key: 'psychiatry',
    label: 'Psychiatry Assessment',
    shortLabel: 'Psychiatry',
    description: 'Mental state, suicide risk, and psychiatric care plan.',
    routeBase: 'psychiatry-assessment',
    icon: '🧠',
    accentColor: 'text-fuchsia-600',
  },
};

// ═════════════════════════════════════════════════════════════
// Role → assessments mapping
//
// Drives:
//   • Which assessment cards appear on the patient detail page
//   • Which "Add Assessment" buttons show up
//   • The recent-activity feed on the dashboard
// ═════════════════════════════════════════════════════════════

export const ROLE_ASSESSMENTS: Record<string, AssessmentKey[]> = {
  Physician: [],              // add 'pain' if you want physicians to record pain
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
): AssessmentDef[] {
  if (!role) return [];
  const keys = ROLE_ASSESSMENTS[role] ?? [];
  return keys.map((k) => ASSESSMENTS[k]);
}

/** Convenience — get one assessment def by key. */
export function getAssessmentDef(key: AssessmentKey): AssessmentDef {
  return ASSESSMENTS[key];
}