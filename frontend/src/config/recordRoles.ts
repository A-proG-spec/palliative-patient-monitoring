// src/config/recordRoles.ts
import type { StaffRole } from '@/types/auth.types';
import { getPermissionRoles } from './permissions';

/**
 * recordRoles.ts — DERIVED FROM permissions.ts
 * ─────────────────────────────────────────────
 * This file no longer stores its own role lists. Instead it maps
 * each record type to the permission key that governs it, and reads
 * the eligible roles from `permissions.ts` at module load.
 *
 * Consequence: to widen who can author a record, edit exactly ONE
 * place — the matching `PERMISSIONS.canXxx` array in permissions.ts.
 *
 * If you ever need a record type whose eligible roles ARE NOT the
 * same as a `canXxx` permission (rare), add a manual override to
 * `RECORD_ROLE_OVERRIDES` below. The override wins over the derived
 * list.
 */

export type RecordRoleKey =
  | 'visit'
  | 'progressNote'
  | 'medication'
  | 'lab'
  | 'imaging'
  | 'referral'
  | 'admission'
  | 'hospiceNursing'
  | 'painAssessment'
  | 'pharmacistAssessment'
  | 'physiotherapyAssessment'
  | 'familyAssessment'
  | 'nutritionalAssessment'
  | 'socialAssessment'
  | 'spiritualAssessment'
  | 'psychiatryAssessment';

/**
 * Bridge: recordKey → permission key.
 *
 * Every value on the right MUST exist as a key in
 * `PERMISSIONS` in `permissions.ts`.
 */
const RECORD_TO_PERMISSION: Record<RecordRoleKey, string> = {
  visit: 'canRecordVisit',
  progressNote: 'canCreateProgressNote',
  medication: 'canOrderMedication',
  lab: 'canOrderLab',
  imaging: 'canOrderImaging',
  referral: 'canCreateReferral',
  admission: 'canRecordAdmission',
  hospiceNursing: 'canRecordHospiceNursing',

  painAssessment: 'canRecordVisit',        // pain is Nurse/Physician; reuse visit gate
  pharmacistAssessment: 'canMarkMedicationGiven',  // Pharmacist-only
  physiotherapyAssessment: 'canRecordVisit',       // placeholder — see OVERRIDES below
  familyAssessment: 'canCreateReferral',           // placeholder — see OVERRIDES below
  nutritionalAssessment: 'canRecordVisit',         // placeholder — see OVERRIDES below
  socialAssessment: 'canCreateReferral',           // placeholder — see OVERRIDES below
  spiritualAssessment: 'canRecordVisit',           // placeholder — see OVERRIDES below
  psychiatryAssessment: 'canCreateProgressNote',   // placeholder — see OVERRIDES below
};

/**
 * Manual overrides for records whose eligible authors are NOT
 * captured by any existing `canXxx` permission.
 *
 * These are the assessment-authoring roles. The 8 assessments are
 * authored by disciplines that don't map cleanly to a `canXxx`
 * permission (Pharmacist, Physiologist, SocialWorker, etc. aren't
 * in the visit/lab/imaging role lists). So we keep explicit lists
 * here.
 *
 * If you widen a permission in permissions.ts and that permission
 * ALSO drives an assessment's author list, remove the override so
 * it re-derives from the permission map.
 */
const RECORD_ROLE_OVERRIDES: Partial<Record<RecordRoleKey, StaffRole[]>> = {
  painAssessment:           ['Nurse', 'Physician'],
  pharmacistAssessment:     ['Pharmacist'],
  physiotherapyAssessment:  ['Physiologist'],
  familyAssessment:         ['SocialWorker'],
  nutritionalAssessment:    ['Nutritionist'],
  socialAssessment:         ['SocialWorker'],
  spiritualAssessment:      ['SpiritualPerson'],
  psychiatryAssessment:     ['Psychologist', 'Psychiatrist'],
};

/**
 * The resolved map. Every key present in RecordRoleKey has a role
 * list — either derived from permissions.ts, or taken from the
 * override, or empty if neither is defined.
 */
export const RECORD_ROLES: Record<RecordRoleKey, StaffRole[]> = (() => {
  const out = {} as Record<RecordRoleKey, StaffRole[]>;
  const keys = Object.keys(RECORD_TO_PERMISSION) as RecordRoleKey[];

  for (const key of keys) {
    // 1. Override wins
    const override = RECORD_ROLE_OVERRIDES[key];
    if (override) {
      out[key] = override;
      continue;
    }

    // 2. Otherwise derive from the linked permission
    const permissionKey = RECORD_TO_PERMISSION[key];
    out[key] = [...getPermissionRoles(permissionKey)];
  }

  return out;
})();

/**
 * Convenience getter — same behaviour as before.
 */
export function getRecordRoles(key: RecordRoleKey): StaffRole[] {
  return RECORD_ROLES[key] ?? [];
}

/**
 * Reverse lookup — "which records can this role author?".
 *
 * Used by AddRecordModal and AssessmentCards to decide what to show
 * without duplicating the mapping logic.
 */
export function getRecordsForRole(role: StaffRole | string | null | undefined): RecordRoleKey[] {
  if (!role) return [];
  const keys = Object.keys(RECORD_ROLES) as RecordRoleKey[];
  return keys.filter((k) => RECORD_ROLES[k].includes(role as StaffRole));
}