// src/config/permissions.ts
import {
  LayoutDashboard,
  Users,
  Pill,
  FlaskConical,
  Scan,
  GitBranch,
  ClipboardList,
  User as UserIcon,       // ← renamed to avoid clash with the auth `User` type
  Calendar,
  Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
// NOTE: we no longer need to import `User` from '@/types/auth.types'
// because `canDischarge` uses structural typing instead. This removes
// the "Duplicate identifier 'User'" error.

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
const PERMISSIONS: Record<string, StaffRole[]> = {
  // Patient management
  canRegisterPatient: ['Physician'],
  canEditPatient: ['Physician'],
  canViewPatients: ['Physician', 'Nurse', 'Nutritionist'],
  canViewPatientDetail: ['Physician', 'Nurse', 'Nutritionist'],
  canViewAllAssessments: ['Physician', 'Nurse'],

  // Visits
  canRecordVisit: ['Physician', 'Nurse'],
  canViewVisits: ['Physician', 'Nurse'],

  // Medications
  canOrderMedication: ['Physician', 'Nurse'],
  canMarkMedicationGiven: ['Pharmacist'],
  canViewMedications: ['Physician', 'Nurse', 'Pharmacist'],

  // Labs
  canOrderLab: ['Physician', 'Nurse'],
  canEnterLabResult: ['LaboratoryTechnician'],
  canViewLabs: ['Physician', 'Nurse', 'LaboratoryTechnician'],

  // Imaging
  canOrderImaging: ['Physician', 'Nurse'],
  canEnterImagingReport: ['Radiologist'],
  canViewImaging: ['Physician', 'Nurse', 'Radiologist'],

  // Referrals
  canRequestReferral: ['Physician', 'Nurse'],
  canCreateReferral: ['Physician', 'Nurse'],
  canViewReferrals: ['Physician', 'Nurse'],

  // Progress Notes
  canViewProgressNotes: ['Physician'],
  canCreateProgressNote: ['Physician'],
  canSignProgressNote: ['Physician'],

  // Admissions
  canRecordAdmission: ['Physician', 'Nurse'],
  canViewAdmissions: ['Physician', 'Nurse'],

  // Hospice Nursing (Nurse-only)
  canRecordHospiceNursing: ['Nurse'],
  canViewHospiceNursing: ['Nurse', 'Physician'],

  // Discharge — Physician + admin only
  canDischargePatient: ['Physician'],
};

/**
 * Check if a role has a specific permission.
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

/**
 * Discharge summaries are available to Physicians and admins only.
 *
 * Uses structural typing (not Pick<User, ...>) so it works with:
 *  - the auth `User` type where `role` is `StaffRole | null | undefined`
 *  - admin users who don't have a `role` at all
 *  - a `null` / `undefined` user (returns false)
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

/**
 * Returns the sidebar navigation items for the given staff role.
 *
 * IMPORTANT: the links below only point at routes that actually exist
 * in `src/routes/index.tsx`. Sub-resources like Medications, Labs,
 * Imaging, and Referrals do NOT have top-level index pages — they are
 * scoped per-patient and reached from the patient detail page.
 */
export function getSidebarItems(
  role?: string | null,
  badges?: SidebarBadges,
): NavItem[] {
  const b = badges ?? {};

  switch (role) {
    case 'Pharmacist':
      return [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          end: true,
        },
        {
          label: 'Medication Orders',
          href: '/medication-orders',
          icon: Pill,
          badge: b.medicationPending,
        },
        { label: 'Patients', href: '/patients', icon: Users },
        { label: 'Profile', href: '/profile', icon: UserIcon },
      ];

    case 'LaboratoryTechnician':
      return [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          end: true,
        },
        {
          label: 'Lab Requests',
          href: '/lab-requests',
          icon: FlaskConical,
          badge: b.labPending,
        },
        { label: 'Profile', href: '/profile', icon: UserIcon },
      ];

    case 'Radiologist':
      return [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          end: true,
        },
        {
          label: 'Imaging Orders',
          href: '/imaging-orders',
          icon: Scan,
          badge: b.imagingPending,
        },
        { label: 'Profile', href: '/profile', icon: UserIcon },
      ];

    case 'Nurse':
    case 'Physician':
    case 'Nutritionist':
    default:
      return [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          end: true,
        },
        { label: 'Patients', href: '/patients', icon: Users },
        { label: 'Profile', href: '/profile', icon: UserIcon },
      ];
  }
}

/**
 * canAddAnyRecord — returns true if the role can add any patient record
 * (visits, medications, labs, imaging, referrals, admissions,
 * or hospice nursing assessments).
 */
export function canAddAnyRecord(role: StaffRole | string, isAdmin = false): boolean {
  if (isAdmin) return true;
  return (
    hasPermission(role, 'canRecordVisit') ||
    hasPermission(role, 'canOrderMedication') ||
    hasPermission(role, 'canOrderLab') ||
    hasPermission(role, 'canOrderImaging') ||
    hasPermission(role, 'canRequestReferral') ||
    hasPermission(role, 'canRecordHospiceNursing')
  );
}