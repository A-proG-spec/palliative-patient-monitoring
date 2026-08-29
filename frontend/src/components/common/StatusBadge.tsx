// src/components/common/StatusBadge.tsx
// Maps all domain status values to the correct color per UI foundation spec.

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BadgeProps } from './StatusBadge.types';

// Re-export for convenience
export type { BadgeProps };

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'outline';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  // Patient
  Active:           { label: 'Active',           variant: 'success'   },
  Discharged:       { label: 'Discharged',        variant: 'secondary' },

  // Patient location
  Home:             { label: 'Home',              variant: 'primary'   },
  ReferredHospital: { label: 'Referred Hospital', variant: 'warning'   },

  // Staff
  Pending:          { label: 'Pending',           variant: 'warning'   },
  Rejected:         { label: 'Rejected',          variant: 'error'     },

  // Referral
  Accepted:         { label: 'Accepted',          variant: 'success'   },
  Declined:         { label: 'Declined',          variant: 'error'     },
  Admitted:         { label: 'Admitted',          variant: 'primary'   },
  InfoRequested:    { label: 'Info Requested',    variant: 'warning'   },

  // Admission
  // Active already defined above

  // Medication / Lab
  Ordered:          { label: 'Ordered',           variant: 'warning'   },
  Given:            { label: 'Given',             variant: 'success'   },
  Completed:        { label: 'Completed',         variant: 'success'   },

  // Visit outcome
  Stable:           { label: 'Stable',            variant: 'success'   },
  Deteriorating:    { label: 'Deteriorating',     variant: 'warning'   },
  Critical:         { label: 'Critical',          variant: 'error'     },
  BedBound:         { label: 'Bed Bound',         variant: 'error'     },
  SymptomsImproved: { label: 'Improved',          variant: 'success'   },
  SymptomsUnchanged:{ label: 'Unchanged',         variant: 'secondary' },
  SymptomsWorsened: { label: 'Worsened',          variant: 'error'     },
  ReferredToFacility:{ label: 'Referred',         variant: 'primary'   },
  Deceased:         { label: 'Deceased',          variant: 'secondary' },

  // Alert types
  RedFlag:          { label: 'Red Flag',          variant: 'error'     },
  ReferralPending:  { label: 'Referral Pending',  variant: 'warning'   },
  MedicationDue:    { label: 'Medication Due',    variant: 'warning'   },
  VisitOverdue:     { label: 'Visit Overdue',     variant: 'warning'   },

  // Notification types
  StaffApproval:    { label: 'Staff Approval',    variant: 'primary'   },
  ReferralApproval: { label: 'Referral',          variant: 'warning'   },
  CloseCase:        { label: 'Case Closed',       variant: 'secondary' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = STATUS_MAP[status];
  if (!config) {
    return (
      <Badge variant="default" className={className}>
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};
