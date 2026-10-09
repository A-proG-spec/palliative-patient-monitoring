import {
  LayoutDashboard,
  Users,
  Pill,
  FlaskConical,
  Scan,
  GitBranch,
  User as UserIcon,
  Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────
export type StaffRole =
  | 'Physician'
  | 'Nurse'
  | 'Pharmacist'
  | 'LaboratoryTechnician'
  | 'Radiologist'
  | 'Physiologist'
  | 'Psychiatrist'
  | 'Psychologist'
  | 'SocialWorker'
  | 'SpiritualPerson'
  | 'Nutritionist';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
}

// ── Permissions map ────────────────────────────────────────────────
//
// Every write action in the app is gated by exactly one key in this
// map. To widen or narrow access to a feature, edit the array here —
// and ONLY here. All UI (buttons, routes, cards) reads from this map.
//
const PERMISSIONS: Record<string, StaffRole[]> = {
  // ── Patient registration / lifecycle ──
  canRegisterPatient: ['Physician'],
  canEditPatient: ['Physician'],
  canViewPatients: ['Physician', 'Nurse'],
  canViewPatientDetail: ['Physician', 'Nurse'],
  canDischargePatient: ['Physician'],

  // ── Visits ──
  canRecordVisit: ['Physician', 'Nurse'],
  canViewVisits: ['Physician', 'Nurse'],

  // ── Progress Notes ──
  canCreateProgressNote: ['Physician', 'Nurse'],
  canViewProgressNotes: ['Physician', 'Nurse'],
  canSignProgressNote: ['Physician', 'Nurse'],

  // ── Medications ──
  canOrderMedication: ['Physician', 'Nurse'],
  canMarkMedicationGiven: ['Pharmacist'],
  canViewMedications: ['Physician', 'Nurse'],

  // ── Labs ──
  canOrderLab: ['Physician', 'Nurse'],
  canEnterLabResult: ['LaboratoryTechnician'],
  canViewLabs: ['Physician', 'Nurse'],

  // ── Imaging ──
  canOrderImaging: ['Physician', 'Nurse'],
  canEnterImagingReport: ['Radiologist'],
  canViewImaging: ['Physician', 'Nurse'],

  // ── Referrals ──
  canCreateReferral: ['Physician', 'Nurse'],
  canViewReferrals: ['Physician', 'Nurse'],

  // ── Admissions ──
  canRecordAdmission: ['Physician', 'Nurse'],
  canViewAdmissions: ['Physician', 'Nurse'],

  // ── Hospice Nursing ──
  canRecordHospiceNursing: ['Nurse'],
  canViewHospiceNursing: ['Nurse'],

  // ── Assessments — one write key + one view key each ──
  canWritePainAssessment: ['Nurse', 'Physician'],
  canViewPainAssessment: ['Nurse', 'Physician'],

  canWritePharmacistAssessment: ['Pharmacist'],
  canViewPharmacistAssessment: ['Pharmacist', 'Physician', 'Nurse'],

  canWritePhysiotherapyAssessment: ['Physiologist'],
  canViewPhysiotherapyAssessment: ['Physiologist', 'Physician', 'Nurse'],

  canWriteFamilyAssessment: ['SocialWorker'],
  canViewFamilyAssessment: ['SocialWorker', 'Physician', 'Nurse'],

  canWriteNutritionalAssessment: ['Nutritionist'],
  canViewNutritionalAssessment: ['Nutritionist', 'Physician', 'Nurse'],

  canWriteSocialAssessment: ['SocialWorker'],
  canViewSocialAssessment: ['SocialWorker', 'Physician', 'Nurse'],

  canWriteSpiritualAssessment: ['SpiritualPerson'],
  canViewSpiritualAssessment: ['SpiritualPerson', 'Physician', 'Nurse'],

  canWritePsychiatryAssessment: ['Psychiatrist', 'Psychologist'],
  canViewPsychiatryAssessment: ['Psychiatrist', 'Psychologist', 'Physician', 'Nurse'],
};

/**
 * Check if a role has a specific permission.
 * Admins bypass every check.
 */
export function hasPermission(
  role: StaffRole | string | null | undefined,
  permission: string,
  isAdmin = false,
): boolean {
  if (isAdmin) return true;
  if (!role) return false;
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role as StaffRole);
}

/** Return the raw role array for a permission (used by config). */
export function getPermissionRoles(permission: string): readonly StaffRole[] {
  return PERMISSIONS[permission] ?? [];
}

/**
 * Discharge summaries are available to Physicians and admins only.
 */
export function canDischarge(
  user?: { role?: string | null; type?: 'staff' | 'admin' } | null,
): boolean {
  if (!user) return false;
  if (user.type === 'admin') return true;
  return user.type === 'staff' && user.role === 'Physician';
}

// ── Sidebar nav items per role ─────────────────────────────────────

export interface SidebarBadges {
  medicationPending?: number;
  labPending?: number;
  imagingPending?: number;
}

export function getSidebarItems(
  role?: string | null,
  badges?: SidebarBadges,
): NavItem[] {
  const b = badges ?? {};

  switch (role) {
    case 'Pharmacist':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
        { label: 'Medication Orders', href: '/medication-orders', icon: Pill, badge: b.medicationPending },
        { label: 'Patients', href: '/patients', icon: Users },
        { label: 'Profile', href: '/profile', icon: UserIcon },
      ];

    case 'LaboratoryTechnician':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
        { label: 'Lab Requests', href: '/lab-requests', icon: FlaskConical, badge: b.labPending },
        { label: 'Profile', href: '/profile', icon: UserIcon },
      ];

    case 'Radiologist':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
        { label: 'Imaging Orders', href: '/imaging-orders', icon: Scan, badge: b.imagingPending },
        { label: 'Profile', href: '/profile', icon: UserIcon },
      ];

    case 'Physician':
    case 'Nurse':
    case 'Nutritionist':
    case 'Physiologist':
    case 'SocialWorker':
    case 'SpiritualPerson':
    case 'Psychiatrist':
    case 'Psychologist':
    default:
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
        { label: 'Patients', href: '/patients', icon: Users },
        { label: 'Profile', href: '/profile', icon: UserIcon },
      ];
  }
}

/**
 * canAddAnyRecord — true if the role can add ANY of the top-level
 * patient records handled by the AddRecordModal
 * (visit / progress note / medication / lab / imaging / referral / admission).
 *
 * This is deliberately scoped to Physician + Nurse (+ Admin) because
 * the modal only contains those tiles. Assessments are added from
 * the AssessmentCards section, not from this modal.
 */
export function canAddAnyRecord(
  role: StaffRole | string | null | undefined,
  isAdmin = false,
): boolean {
  if (isAdmin) return true;
  return (
    hasPermission(role, 'canRecordVisit') ||
    hasPermission(role, 'canCreateProgressNote') ||
    hasPermission(role, 'canOrderMedication') ||
    hasPermission(role, 'canOrderLab') ||
    hasPermission(role, 'canOrderImaging') ||
    hasPermission(role, 'canCreateReferral') ||
    hasPermission(role, 'canRecordAdmission') ||
    hasPermission(role, 'canRecordHospiceNursing')
  );
}