import {
  LayoutDashboard,
  Users,
  Pill,
  FlaskConical,
  Scan,
  GitBranch,
  ClipboardList,
  User,
  Calendar,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────
export type StaffRole =
  | 'TeamLeader'
  | 'Physician'
  | 'Nurse'
  | 'Pharmacist'
  | 'LabTechnician'
  | 'Radiologist';

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
  canViewPatients: ['Physician', 'Nurse', 'TeamLeader'],
  canViewPatientDetail: ['Physician', 'Nurse', 'TeamLeader'],

  // Visits
  canRecordVisit: ['Physician', 'Nurse', 'TeamLeader'],
  canViewVisits: ['Physician', 'Nurse', 'TeamLeader'],

  // Medications
  canOrderMedication: ['Physician', 'Nurse', 'TeamLeader'],
  canMarkMedicationGiven: ['Pharmacist'],
  canViewMedications: ['Physician', 'Nurse', 'TeamLeader', 'Pharmacist'],

  // Labs
  canOrderLab: ['Physician', 'Nurse', 'TeamLeader'],
  canEnterLabResult: ['LabTechnician'],
  canViewLabs: ['Physician', 'Nurse', 'TeamLeader', 'LabTechnician'],

  // Imaging
  canOrderImaging: ['Physician', 'Nurse', 'TeamLeader'],
  canEnterImagingReport: ['Radiologist'],
  canViewImaging: ['Physician', 'Nurse', 'TeamLeader', 'Radiologist'],

  // Referrals
  canRequestReferral: ['Physician', 'Nurse', 'TeamLeader'],
  canViewReferrals: ['Physician', 'Nurse', 'TeamLeader'],

  // Progress Notes
  canViewProgressNotes: ['Physician'],
  canCreateProgressNote: ['Physician'],
  canSignProgressNote: ['Physician'],

  // Admissions
  canRecordAdmission: ['Physician', 'Nurse', 'TeamLeader'],
  canViewAdmissions: ['Physician', 'Nurse', 'TeamLeader'],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: StaffRole | string, permission: string): boolean {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role as StaffRole);
}

// ── Sidebar nav items per role ─────────────────────────────────────

/**
 * Returns the sidebar navigation items for the given staff role.
 * Each role only sees the routes they are permitted to use.
 */
export function getSidebarItems(role?: string | null, badges?: {
  medicationPending?: number;
  labPending?: number;
  imagingPending?: number;
}): NavItem[] {
  const b = badges ?? {};

  switch (role) {
    case 'Pharmacist':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
        { label: 'Medication Orders', href: '/medication-orders', icon: Pill, badge: b.medicationPending },
        { label: 'Profile', href: '/profile', icon: User },
      ];

    case 'LabTechnician':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
        { label: 'Lab Requests', href: '/lab-requests', icon: FlaskConical, badge: b.labPending },
        { label: 'Profile', href: '/profile', icon: User },
      ];

    case 'Radiologist':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
        { label: 'Imaging Orders', href: '/imaging-orders', icon: Scan, badge: b.imagingPending },
        { label: 'Profile', href: '/profile', icon: User },
      ];

    case 'Nurse':
    case 'TeamLeader':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
        { label: 'Patients', href: '/patients', icon: Users },
        { label: 'Visits', href: '/patients', icon: Calendar },
        { label: 'Medications', href: '/medication-orders', icon: Pill },
        { label: 'Labs', href: '/lab-requests', icon: FlaskConical },
        { label: 'Imaging', href: '/imaging-orders', icon: Scan },
        { label: 'Referrals', href: '/patients', icon: GitBranch },
        { label: 'Profile', href: '/profile', icon: User },
      ];

    case 'Physician':
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
        { label: 'Patients', href: '/patients', icon: Users },
        { label: 'Medications', href: '/medication-orders', icon: Pill },
        { label: 'Labs', href: '/lab-requests', icon: FlaskConical },
        { label: 'Imaging', href: '/imaging-orders', icon: Scan },
        { label: 'Referrals', href: '/patients', icon: GitBranch },
        { label: 'Progress Notes', href: '/patients', icon: ClipboardList },
        { label: 'Profile', href: '/profile', icon: User },
      ];

    default:
      // Unknown / null role - minimal navigation
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
        { label: 'Profile', href: '/profile', icon: User },
      ];
  }
}

/**
 * canAddAnyRecord — returns true if the role can add any patient record
 * (visits, medications, labs, imaging, referrals, admissions).
 * Used in PatientDetailPage to decide whether to show action buttons.
 */
export function canAddAnyRecord(role: StaffRole | string): boolean {
  return hasPermission(role, 'canRecordVisit') ||
    hasPermission(role, 'canOrderMedication') ||
    hasPermission(role, 'canOrderLab') ||
    hasPermission(role, 'canOrderImaging') ||
    hasPermission(role, 'canRequestReferral');
}
