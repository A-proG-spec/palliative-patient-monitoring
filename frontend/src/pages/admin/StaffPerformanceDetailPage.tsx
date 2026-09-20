import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  ClipboardList,
  Pill,
  FlaskConical,
  Camera,
  GitBranch,
  Clock,
  Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState, EmptyState } from '@/components/common/EmptyState';
import { formatResponseTime, formatRelativeTime } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants';
import {
  useStaffPerformanceDetail,
  useStaffActivity,
} from '@/hooks/useAdmin';
import type { StaffActivityItem, StaffActivityType } from '@/types/admin.types';

// ═══════════════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color = 'text-primary',
}) => (
  <Card padding="md">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light ${color}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-on-surface truncate">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  </Card>
);

// ═══════════════════════════════════════════════════════════════════
// Activity helpers
// ═══════════════════════════════════════════════════════════════════

const activityIcon = (type: StaffActivityType) => {
  switch (type) {
    case 'visit':
      return <ClipboardList size={16} className="text-blue-600" />;
    case 'medication':
      return <Pill size={16} className="text-green-600" />;
    case 'lab':
      return <FlaskConical size={16} className="text-purple-600" />;
    case 'imaging':
      return <Camera size={16} className="text-indigo-600" />;
    case 'referral':
      return <GitBranch size={16} className="text-orange-600" />;
    case 'admission':
      return <Activity size={16} className="text-red-600" />;
    case 'progress_note':
      return <ClipboardList size={16} className="text-teal-600" />;
    default:
      return <Activity size={16} className="text-text-muted" />;
  }
};

const activityLabel = (type: StaffActivityType) => {
  switch (type) {
    case 'visit':
      return 'Visit Recorded';
    case 'medication':
      return 'Medication Ordered';
    case 'lab':
      return 'Lab Test Requested';
    case 'imaging':
      return 'Imaging Ordered';
    case 'referral':
      return 'Referral Submitted';
    case 'admission':
      return 'Admission Recorded';
    case 'progress_note':
      return 'Progress Note';
    default:
      return 'Activity';
  }
};

// ═══════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════

const StaffPerformanceDetailPage: React.FC = () => {
  const { staffId } = useParams<{ staffId: string }>();

  const {
    data: staff,
    isLoading,
    error,
    refetch,
  } = useStaffPerformanceDetail(staffId!);

  // ── Activity pagination ──
  // The detail response ships the first ~20 items; additional pages
  // are fetched via a separate endpoint.
  const [activityPage, setActivityPage] = useState(1);
  const { data: extraActivity, isLoading: extraLoading } = useStaffActivity(
    staffId!,
    { page: activityPage, limit: 20 },
  );

  // Merge initial page + any extra pages, dedupe by id, sort desc.
  const allActivity: StaffActivityItem[] = useMemo(() => {
    const initial = staff?.recentActivity ?? [];
    const extra = activityPage > 1 ? (extraActivity?.items ?? []) : [];
    const seen = new Set<string>();
    return [...initial, ...extra]
      .filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [staff?.recentActivity, extraActivity?.items, activityPage]);

  const hasMore = extraActivity?.hasMore ?? false;

  if (isLoading) return <PageLoader />;
  if (error || !staff) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <BackButton to="/admin/staff" label="Staff Management" />
          <h1 className="text-2xl font-bold text-on-surface">{staff.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {staff.role ? (
              <Badge variant="secondary">{ROLE_LABELS[staff.role] ?? staff.role}</Badge>
            ) : (
              <span className="text-sm text-text-muted">No role assigned</span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList size={18} />}
          label="Visits Recorded"
          value={staff.totalVisitsRecorded ?? 0}
          color="text-blue-600"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Patients Registered"
          value={staff.totalPatientsAssigned ?? 0}
          color="text-primary"
        />
        <StatCard
          icon={<Pill size={18} />}
          label="Medications Ordered"
          value={staff.totalMedicationsOrdered ?? 0}
          color="text-green-600"
        />
        <StatCard
          icon={<FlaskConical size={18} />}
          label="Lab Tests Requested"
          value={staff.totalLabTestsRequested ?? 0}
          color="text-purple-600"
        />
        <StatCard
          icon={<Camera size={18} />}
          label="Imaging Orders"
          value={staff.totalImagingOrdersPlaced ?? 0}
          color="text-indigo-600"
        />
        <StatCard
          icon={<GitBranch size={18} />}
          label="Referrals Submitted"
          value={staff.totalReferralsSubmitted ?? 0}
          color="text-orange-600"
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Avg Response Time"
          value={formatResponseTime(staff.averageResponseTimeMinutes)}
          color="text-text-secondary"
        />
      </div>

      {/* Activity timeline */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-4 border-b border-border-base">
          <h3 className="text-base font-semibold text-on-surface">Recent Activity</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Chronological timeline of clinical actions
          </p>
        </div>

        <div className="p-5">
          {!allActivity.length ? (
            <EmptyState
              icon={<TrendingUp size={28} />}
              title="No activity yet"
              description="This staff member hasn't recorded any clinical actions yet."
            />
          ) : (
            <div className="space-y-3">
              {allActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-3 border-b border-border-base last:border-0 last:pb-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-low flex-shrink-0 mt-0.5">
                    {activityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface">
                          {activityLabel(activity.type)}
                        </p>
                        {activity.patientName && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            Patient: {activity.patientName}
                          </p>
                        )}
                        {activity.description && (
                          <p className="text-xs text-text-muted mt-1">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-text-muted whitespace-nowrap">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && allActivity.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-base text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivityPage((p) => p + 1)}
                loading={extraLoading}
              >
                Load More Activity
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StaffPerformanceDetailPage;