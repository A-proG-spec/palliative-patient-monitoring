import type { AdminActivityStats } from '../../types/admin-profile.types';

interface ActivityStatsCardProps {
  stats: AdminActivityStats;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function ActivityStatsCard({ stats }: ActivityStatsCardProps) {
  const items = [
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      color: 'text-blue-600',
    },
    {
      label: 'Active Patients',
      value: stats.activePatients,
      color: 'text-green-600',
    },
    {
      label: 'Discharged',
      value: stats.dischargedPatients,
      color: 'text-gray-600',
    },
    {
      label: 'Pending Referrals',
      value: stats.pendingReferrals,
      color: 'text-yellow-600',
    },
    {
      label: 'Pending Staff',
      value: stats.pendingStaff,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Activity Overview</h2>
      <p className="mt-1 text-sm text-gray-500">
        Snapshot of current system activity.
      </p>

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-gray-100 bg-gray-50 p-4"
          >
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </div>
            <div className="mt-1 text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-gray-100 pt-4 text-sm">
        <div>
          <span className="text-gray-500">Member since: </span>
          <span className="font-medium text-gray-900">
            {formatDate(stats.memberSince)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Last login: </span>
          <span className="font-medium text-gray-900">
            {formatDate(stats.lastLogin)}
          </span>
        </div>
      </div>
    </div>
  );
}