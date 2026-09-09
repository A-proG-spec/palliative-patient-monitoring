import React from 'react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

interface StatusBadgeProps {
  status: string;
  type?: 'patient' | 'referral' | 'medication' | 'lab' | 'admission' | 'visit' | 'staff' | 'generic';
  className?: string;
}

const patientStatusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  Active: { variant: 'success', label: 'Active' },
  Discharged: { variant: 'default', label: 'Discharged' },
};

const referralStatusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  Pending: { variant: 'warning', label: 'Pending' },
  Accepted: { variant: 'success', label: 'Accepted' },
  Declined: { variant: 'error', label: 'Declined' },
  Admitted: { variant: 'primary', label: 'Admitted' },
  InfoRequested: { variant: 'warning', label: 'Info Requested' },
};

const medicationStatusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  Ordered: { variant: 'warning', label: 'Ordered' },
  Given: { variant: 'success', label: 'Given' },
};

const labStatusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  Ordered: { variant: 'warning', label: 'Ordered' },
  Completed: { variant: 'success', label: 'Completed' },
};

const admissionStatusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  Active: { variant: 'success', label: 'Active' },
  Discharged: { variant: 'default', label: 'Discharged' },
};

const visitOutcomeMap: Record<string, { variant: BadgeVariant; label: string }> = {
  Stable: { variant: 'success', label: 'Stable' },
  SymptomsImproved: { variant: 'success', label: 'Improved' },
  SymptomsUnchanged: { variant: 'warning', label: 'Unchanged' },
  SymptomsWorsened: { variant: 'error', label: 'Worsened' },
  ReferredToFacility: { variant: 'primary', label: 'Referred' },
  Deceased: { variant: 'error', label: 'Deceased' },
};

const staffStatusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  Active: { variant: 'success', label: 'Active' },
  Pending: { variant: 'warning', label: 'Pending' },
  Rejected: { variant: 'error', label: 'Rejected' },
};

const locationMap: Record<string, { variant: BadgeVariant; label: string }> = {
  Home: { variant: 'success', label: 'Home' },
  ReferredHospital: { variant: 'primary', label: 'Hospital' },
};

function getStatusConfig(status: string, type?: string): { variant: BadgeVariant; label: string } {
  switch (type) {
    case 'patient': return patientStatusMap[status] || { variant: 'default', label: status };
    case 'referral': return referralStatusMap[status] || { variant: 'default', label: status };
    case 'medication': return medicationStatusMap[status] || { variant: 'default', label: status };
    case 'lab': return labStatusMap[status] || { variant: 'default', label: status };
    case 'admission': return admissionStatusMap[status] || { variant: 'default', label: status };
    case 'visit': return visitOutcomeMap[status] || { variant: 'default', label: status };
    case 'staff': return staffStatusMap[status] || { variant: 'default', label: status };
    default:
      return (
        patientStatusMap[status] ||
        referralStatusMap[status] ||
        medicationStatusMap[status] ||
        labStatusMap[status] ||
        admissionStatusMap[status] ||
        visitOutcomeMap[status] ||
        staffStatusMap[status] ||
        locationMap[status] || { variant: 'default', label: status }
      );
  }
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, className }) => {
  const { variant, label } = getStatusConfig(status, type);
  return <Badge variant={variant} dot className={className}>{label}</Badge>;
};
