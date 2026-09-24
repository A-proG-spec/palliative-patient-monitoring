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
  Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────
export type StaffRole =
  | 'TeamLeader'
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
  canViewPatients: ['Physician', 'Nurse', 'TeamLeader'],
  canViewPatientDetail: ['Physician', 'Nurse', 'TeamLeader'],
  canViewAllAssessments: ['Physician', 'Nurse'],

  // Visits
  canRecordVisit: ['Physician', 'Nurse', 'TeamLeader'],
  canViewVisits: ['Physician', 'Nurse', 'TeamLeader'],

  // Medications
  canOrderMedication: ['Physician', 'Nurse', 'TeamLeader'],
  canMarkMedicationGiven: ['Pharmacist'],
  canViewMedications: ['Physician', 'Nurse', 'TeamLeader', 'Pharmacist'],

  // Labs
  canOrderLab: ['Physician', 'Nurse', 'TeamLeader'],
  canEnterLabResult: ['LaboratoryTechnician'],
  canViewLabs: ['Physician', 'Nurse', 'TeamLeader', 'LaboratoryTechnician'],

  // Imaging
  canOrderImaging: ['Physician', 'Nurse', 'TeamLeader'],
  canEnterImagingReport: ['Radiologist'],
  canViewImaging: ['Physician', 'Nurse', 'TeamLeader', 'Radiologist'],

  // Referrals
  canRequestReferral: ['Physician', 'Nurse', 'TeamLeader'],
  // NOTE: `canCreateReferral` is an alias used by PatientDetailPage's
  // AddRecordModal. Keep both so neither call-site breaks.
  canCreateReferral: ['Physician', 'Nurse', 'TeamLeader'],
  canViewReferrals: ['Physician', 'Nurse', 'TeamLeader'],

  // Progress Notes
  canViewProgressNotes: ['Physician'],
  canCreateProgressNote: ['Physician'],
  canSignProgressNote: ['Physician'],

  // Admissions
  canRecordAdmission: ['Physician', 'Nurse', 'TeamLeader'],
  canViewAdmissions: ['Physician', 'Nurse', 'TeamLeader'],

  // Hospice Nursing (Nurse-only)
  canRecordHospiceNursing: ['Nurse'],
  canViewHospiceNursing: ['Nurse','Physician'],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(
  role: StaffRole | string,
  permission: string,
): boolean {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role as StaffRole);
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
 *
 * NOTE: the backend enum value is `LaboratoryTechnician` (long form).
 * Using the short form here causes the switch to fall through to the
 * default nav — the lab tech queue never appears.
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
        { label: 'Profile', href: '/profile', icon: User },
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
        { label: 'Profile', href: '/profile', icon: User },
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
        { label: 'Profile', href: '/profile', icon: User },
      ];

    // ── Physician / Nurse / TeamLeader ──
    //
    // Every sub-resource (visits, medications, labs, imaging,
    // referrals, progress notes, admissions) is scoped to a patient
    // and reached from the patient detail page's tabs / "Add Record"
    // modal. There is no top-level index route for any of them, so
    // the sidebar only links to the two routes that DO exist:
    // /dashboard and /patients.
    case 'Nurse':
    case 'Physician':
    case 'TeamLeader':
    default:
      return [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          end: true,
        },
        { label: 'Patients', href: '/patients', icon: Users },
        { label: 'Profile', href: '/profile', icon: User },
      ];
  }
}

/**
 * canAddAnyRecord — returns true if the role can add any patient record
 * (visits, medications, labs, imaging, referrals, admissions,
 * or hospice nursing assessments).
 * Used in PatientDetailPage to decide whether to show action buttons.
 */
export function canAddAnyRecord(role: StaffRole | string): boolean {
  return (
    hasPermission(role, 'canRecordVisit') ||
    hasPermission(role, 'canOrderMedication') ||
    hasPermission(role, 'canOrderLab') ||
    hasPermission(role, 'canOrderImaging') ||
    hasPermission(role, 'canRequestReferral') ||
    hasPermission(role, 'canRecordHospiceNursing')
  );
}