import React from 'react';
import { ActivityStats as ActivityStatsType } from '@/types/profile.types';
import { formatDate } from '@/lib/utils';

interface ActivityStatsProps {
  stats: ActivityStatsType;
  userType: 'staff' | 'admin';
}

export const ActivityStats: React.FC<ActivityStatsProps> = ({ stats, userType }) => {
  const isStaff = userType === 'staff';

  const cards = isStaff ? [
    { label: 'Visits Recorded', value: (stats as any).totalVisits || 0 },
    { label: 'Total Patients', value: (stats as any).totalPatients || 0 },
    { label: 'Active Patients', value: (stats as any).activePatients || 0 },
    { label: "Today's Visits", value: (stats as any).todayVisits || 0 },
  ] : [
    { label: 'Total Patients', value: (stats as any).totalPatients || 0 },
    { label: 'Active Patients', value: (stats as any).activePatients || 0 },
    { label: 'Discharged', value: (stats as any).dischargedPatients || 0 },
    { label: 'Pending Referrals', value: (stats as any).pendingReferrals || 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-surface-low p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-primary">{card.value}</p>
            <p className="text-xs text-text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      {isStaff && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Last Login: </span>
            <span className="text-on-surface">{formatDate((stats as any).lastLogin)}</span>
          </div>
        </div>
      )}
    </div>
  );
};