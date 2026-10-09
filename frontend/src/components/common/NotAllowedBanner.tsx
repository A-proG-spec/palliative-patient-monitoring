import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotAllowedBannerProps {
  reason?: string | null;
  /** Optional list of roles that ARE allowed (from RECORD_ROLES). */
  eligibleRoles?: string[];
  className?: string;
}

export const NotAllowedBanner: React.FC<NotAllowedBannerProps> = ({
  reason,
  eligibleRoles,
  className,
}) => (
  <div
    className={cn(
      'rounded-xl border border-warning/30 bg-warning-bg/30 px-5 py-4 flex items-start gap-3',
      className,
    )}
  >
    <ShieldAlert size={20} className="text-warning flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-semibold text-on-surface">
        You don't have permission to write this record
      </p>
      <p className="text-xs text-text-secondary mt-1">
        {reason ?? 'Contact an administrator if you believe this is a mistake.'}
      </p>
      {eligibleRoles && eligibleRoles.length > 0 && (
        <p className="text-xs text-text-muted mt-2">
          Eligible roles: <strong>{eligibleRoles.join(', ')}</strong>
        </p>
      )}
    </div>
  </div>
);

export default NotAllowedBanner;