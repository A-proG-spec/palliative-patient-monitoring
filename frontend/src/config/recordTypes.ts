import React from 'react';
import {
  ClipboardList,
  Pill,
  FlaskConical,
  GitBranch,
  Building2,
  Camera,
  NotebookPen,
  Heart,
} from 'lucide-react';
import {
  hasPermission,
  type StaffRole,
} from '@/config/permissions';

// ═════════════════════════════════════════════════════════════
// Record type descriptor
// ═════════════════════════════════════════════════════════════

export interface RecordType {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: (id: string) => string;
  color?: string;
}

// ── Visit vs progress-note depends on patient location ──
export function getVisitRecordType(
  currentLocation: 'Home' | 'ReferredHospital',
): RecordType {
  if (currentLocation === 'ReferredHospital') {
    return {
      key: 'progress-note',
      label: 'Patient Progress Note',
      description:
        'Record a clinical progress note for a hospitalised or facility-based patient.',
      icon: React.createElement(NotebookPen, { size: 20 }),
      route: (id) => `/patients/${id}/progress-note/new`,
      color: 'text-teal-600',
    };
  }
  return {
    key: 'visit',
    label: 'Home Visit Record',
    description:
      'Record a home visit, vitals, pain assessment, and care observations.',
    icon: React.createElement(ClipboardList, { size: 20 }),
    route: (id) => `/patients/${id}/visits`,
    color: 'text-blue-600',
  };
}

// ── Every other record type ──
export const STATIC_RECORD_TYPES: RecordType[] = [
  {
    key: 'medication',
    label: 'Medication Order',
    description: 'Order or document a medication for this patient.',
    icon: React.createElement(Pill, { size: 20 }),
    route: (id) => `/patients/${id}/medications`,
    color: 'text-green-600',
  },
  {
    key: 'lab',
    label: 'Lab Test Order',
    description:
      'Request a laboratory test (blood, urine, microbiology, etc.).',
    icon: React.createElement(FlaskConical, { size: 20 }),
    route: (id) => `/patients/${id}/labs`,
    color: 'text-purple-600',
  },
  {
    key: 'imaging',
    label: 'Imaging Order',
    description:
      'Request imaging examination (X-Ray, CT, MRI, Ultrasound, etc.).',
    icon: React.createElement(Camera, { size: 20 }),
    route: (id) => `/patients/${id}/imaging`,
    color: 'text-indigo-600',
  },
  {
    key: 'referral',
    label: 'Referral Request',
    description: 'Submit a referral to another facility or specialist.',
    icon: React.createElement(GitBranch, { size: 20 }),
    route: (id) => `/patients/${id}/referrals`,
    color: 'text-orange-600',
  },
  {
    key: 'admission',
    label: 'Hospital Admission',
    description:
      'Record a hospital admission linked to an accepted referral.',
    icon: React.createElement(Building2, { size: 20 }),
    route: (id) => `/patients/${id}/admissions`,
    color: 'text-red-600',
  },
  {
    key: 'hospice-nursing',
    label: 'Hospice Nursing Assessment',
    description: 'Record a hospice nursing assessment for this patient.',
    icon: React.createElement(Heart, { size: 20 }),
    route: (id) => `/patients/${id}/hospice-nursing`,
    color: 'text-pink-600',
  },
];

// ═════════════════════════════════════════════════════════════
// Filter record types by role permission
// ═════════════════════════════════════════════════════════════

export function filterRecordTypesForRole(
  role: StaffRole,
  currentLocation: 'Home' | 'ReferredHospital',
): RecordType[] {
  const all = [getVisitRecordType(currentLocation), ...STATIC_RECORD_TYPES];

  return all.filter((r) => {
    switch (r.key) {
      case 'visit':
      case 'progress-note':
        return hasPermission(role, 'canRecordVisit');
      case 'medication':
        return hasPermission(role, 'canOrderMedication');
      case 'lab':
        return hasPermission(role, 'canOrderLab');
      case 'imaging':
        return hasPermission(role, 'canOrderImaging');
      case 'referral':
        return hasPermission(role, 'canCreateReferral');
      case 'admission':
        return hasPermission(role, 'canRecordAdmission');
      case 'hospice-nursing':
        return role === 'Nurse';
      default:
        return false;
    }
  });
}