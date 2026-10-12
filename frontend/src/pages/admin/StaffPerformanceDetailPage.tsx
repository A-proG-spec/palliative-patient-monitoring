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
  Heart,
  Brain,
  Home,
  Apple,
  Accessibility,
  UserPlus,
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
import { hasPermission, type StaffRole } from '@/config/permissions';
import type { StaffActivityItem, StaffActivityType } from '@/types/admin.types';

// ═══════════════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  isPrimary?: boolean;
  change?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  isPrimary = false,
  change,
}) => (
  <div
    className={`p-5 rounded-2xl transition-all ${
      isPrimary
        ? 'bg-[#4D73D9] text-white shadow-lg shadow-[#4D73D9]/20'
        : 'bg-card border border-border text-on-surface shadow-sm'
    }`}
  >
    <div className="flex items-center justify-between">
      <span
        className={`text-xs font-medium ${
          isPrimary ? 'text-white/80' : 'text-text-secondary'
        }`}
      >
        {label}
      </span>
      <div
        className={`p-1.5 rounded-full ${
          isPrimary ? 'bg-white/20 text-white' : 'bg-muted text-on-surface'
        }`}
      >
        {icon}
      </div>
    </div>

    <div className="mt-3">
      <span className="text-3xl font-extrabold tracking-tight">{value}</span>
    </div>

    {change && (
      <p
        className={`text-[11px] mt-2 ${
          isPrimary ? 'text-white/70' : 'text-text-muted'
        }`}
      >
        {change}
      </p>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// Metric definitions
// ═══════════════════════════════════════════════════════════════════

interface MetricDef {
  key: string;
  icon: React.ReactNode;
  label: string;
  permission: string;
  /** Field name on the flat StaffPerformanceDetail DTO. */
  valueKey: string;
}

const ALL_METRICS: MetricDef[] = [
  // ── Top-level clinical actions ──
  {
    key: 'visits',
    icon: <ClipboardList size={16} />,
    label: 'Visits Recorded',
    permission: 'canRecordVisit',
    valueKey: 'totalVisitsRecorded',
  },
  {
    key: 'patients',
    icon: <Users size={16} />,
    label: 'Patients Registered',
    permission: 'canRegisterPatient',
    valueKey: 'totalPatientsAssigned',
  },
  {
    key: 'medicationsOrdered',
    icon: <Pill size={16} />,
    label: 'Medications Ordered',
    permission: 'canOrderMedication',
    valueKey: 'totalMedicationsOrdered',
  },
  {
    key: 'medicationsGiven',
    icon: <Pill size={16} />,
    label: 'Medications Administered',
    permission: 'canMarkMedicationGiven',
    valueKey: 'totalMedicationsGiven',
  },
  {
    key: 'labsOrdered',
    icon: <FlaskConical size={16} />,
    label: 'Lab Tests Requested',
    permission: 'canOrderLab',
    valueKey: 'totalLabTestsRequested',
  },
  {
    key: 'labsCompleted',
    icon: <FlaskConical size={16} />,
    label: 'Lab Results Entered',
    permission: 'canEnterLabResult',
    valueKey: 'totalLabTestsCompleted',
  },
  {
    key: 'imagingOrdered',
    icon: <Camera size={16} />,
    label: 'Imaging Orders',
    permission: 'canOrderImaging',
    valueKey: 'totalImagingOrdersPlaced',
  },
  {
    key: 'imagingReports',
    icon: <Camera size={16} />,
    label: 'Imaging Reports Submitted',
    permission: 'canEnterImagingReport',
    valueKey: 'totalImagingReportsSubmitted',
  },
  {
    key: 'referrals',
    icon: <GitBranch size={16} />,
    label: 'Referrals Submitted',
    permission: 'canCreateReferral',
    valueKey: 'totalReferralsSubmitted',
  },
  {
    key: 'progressNotes',
    icon: <ClipboardList size={16} />,
    label: 'Progress Notes',
    permission: 'canCreateProgressNote',
    valueKey: 'totalProgressNotesCreated',
  },

  // ── Assessment authoring ──
  {
    key: 'painAssessments',
    icon: <Activity size={16} />,
    label: 'Pain Assessments',
    permission: 'canWritePainAssessment',
    valueKey: 'totalPainAssessments',
  },
  {
    key: 'pharmacistAssessments',
    icon: <Pill size={16} />,
    label: 'Pharmacist Assessments',
    permission: 'canWritePharmacistAssessment',
    valueKey: 'totalPharmacistAssessments',
  },
  {
    key: 'physiotherapyAssessments',
    icon: <Accessibility size={16} />,
    label: 'Physiotherapy Assessments',
    permission: 'canWritePhysiotherapyAssessment',
    valueKey: 'totalPhysiotherapyAssessments',
  },
  {
    key: 'familyAssessments',
    icon: <Users size={16} />,
    label: 'Family Assessments',
    permission: 'canWriteFamilyAssessment',
    valueKey: 'totalFamilyAssessments',
  },
  {
    key: 'nutritionalAssessments',
    icon: <Apple size={16} />,
    label: 'Nutritional Assessments',
    permission: 'canWriteNutritionalAssessment',
    valueKey: 'totalNutritionalAssessments',
  },
  {
    key: 'socialAssessments',
    icon: <Home size={16} />,
    label: 'Social Assessments',
    permission: 'canWriteSocialAssessment',
    valueKey: 'totalSocialAssessments',
  },
  {
    key: 'spiritualAssessments',
    icon: <Heart size={16} />,
    label: 'Spiritual Assessments',
    permission: 'canWriteSpiritualAssessment',
    valueKey: 'totalSpiritualAssessments',
  },
  {
    key: 'psychiatryAssessments',
    icon: <Brain size={16} />,
    label: 'Psychiatry Assessments',
    permission: 'canWritePsychiatryAssessment',
    valueKey: 'totalPsychiatryAssessments',
  },
];

// ═══════════════════════════════════════════════════════════════════
// Role → allowed activity types
//
// Physician / Nurse include 'patient' because they register patients.
// ═══════════════════════════════════════════════════════════════════

const ROLE_ACTIVITY_TYPES: Record<StaffRole, StaffActivityType[]> = {
  Physician: [
    'visit',
    'patient',
    'medication',
    'lab',
    'imaging',
    'referral',
    'admission',
    'progress_note',
    'assessment',
  ],
  Nurse: [
    'visit',
    'patient',
    'medication',
    'lab',
    'imaging',
    'referral',
    'admission',
    'progress_note',
    'assessment',
  ],

  // ── Specialists ──
  Pharmacist: ['medication', 'assessment'],
  LaboratoryTechnician: ['lab'],
  Radiologist: ['imaging'],

  // Physiologist = Physiotherapist
  Physiologist: ['visit', 'assessment'],

  Psychiatrist: ['progress_note', 'assessment'],
  Psychologist: ['progress_note', 'assessment'],

  SocialWorker: ['referral', 'assessment'],

  SpiritualPerson: ['assessment'],
  Nutritionist: ['assessment'],
};

// ═══════════════════════════════════════════════════════════════════
// Activity icons + labels
// ═══════════════════════════════════════════════════════════════════

const activityIcon = (type: StaffActivityType) => {
  switch (type) {
    case 'visit':
      return <ClipboardList size={16} className="text-blue-600" />;
    case 'patient':
      return <UserPlus size={16} className="text-pink-600" />;
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
    case 'assessment':
      return <ClipboardList size={16} className="text-amber-600" />;
    default:
      return <Activity size={16} className="text-text-muted" />;
  }
};

const activityLabel = (type: StaffActivityType) => {
  switch (type) {
    case 'visit':
      return 'Visit Recorded';
    case 'patient':
      return 'Patient Registered';
    case 'medication':
      return 'Medication Activity';
    case 'lab':
      return 'Lab Activity';
    case 'imaging':
      return 'Imaging Activity';
    case 'referral':
      return 'Referral Submitted';
    case 'admission':
      return 'Admission Recorded';
    case 'progress_note':
      return 'Progress Note';
    case 'assessment':
      return 'Assessment Recorded';
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

  const [activityPage, setActivityPage] = useState(1);
  const { data: extraActivity, isLoading: extraLoading } = useStaffActivity(
    staffId!,
    { page: activityPage, limit: 20 },
  );

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

  const role = (staff?.role ?? '') as StaffRole;

  const visibleMetrics = useMemo(
    () =>
      ALL_METRICS.filter((m) =>
        role ? hasPermission(role, m.permission) : false,
      ),
    [role],
  );

  const allowedActivityTypes = useMemo<StaffActivityType[]>(
    () => (role ? ROLE_ACTIVITY_TYPES[role] ?? [] : []),
    [role],
  );

  const visibleActivity = useMemo(
    () =>
      allowedActivityTypes.length === 0
        ? []
        : allActivity.filter((a) => allowedActivityTypes.includes(a.type)),
    [allActivity, allowedActivityTypes],
  );

  const hasMore = extraActivity?.hasMore ?? false;

  if (isLoading) return <PageLoader />;
  if (error || !staff) return <ErrorState onRetry={refetch} />;

  const showResponseTime = staff.averageResponseTimeMinutes != null;

  return (
    <div className="p-6 space-y-6 text-on-surface">
      {/* Page Title & Navigation Header */}
      <div>
        <BackButton to="/admin/staff" label="Staff Management" />
        <h1 className="text-2xl font-bold tracking-tight text-on-surface mt-1">
          {staff.name}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          {staff.role ? (
            <Badge variant="secondary">{ROLE_LABELS[staff.role] ?? staff.role}</Badge>
          ) : (
            <span className="text-sm text-text-muted">No role assigned</span>
          )}
        </div>
        <p className="text-sm text-text-secondary mt-0.5">
          Performance metrics and clinical activity timeline
        </p>
      </div>

      {/* Metrics grid — KPI card style */}
      {!role ? (
        <Card padding="lg">
          <EmptyState
            icon={<TrendingUp size={28} />}
            title="No role assigned"
            description="This staff member hasn't been assigned a role yet. Performance metrics become available once an admin approves them with a role."
          />
        </Card>
      ) : visibleMetrics.length === 0 && !showResponseTime ? (
        <Card padding="lg">
          <EmptyState
            icon={<TrendingUp size={28} />}
            title="No metrics for this role"
            description={`The ${ROLE_LABELS[role] ?? role} role doesn't record top-level clinical actions.`}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleMetrics.map((m, index) => (
            <StatCard
              key={m.key}
              icon={m.icon}
              label={m.label}
              value={(staff as any)[m.valueKey] ?? 0}
              isPrimary={index === 0}
              change={
                index === 0
                  ? 'Primary action for this role'
                  : undefined
              }
            />
          ))}

          {showResponseTime && (
            <StatCard
              icon={<Clock size={16} />}
              label="Avg Response Time"
              value={formatResponseTime(staff.averageResponseTimeMinutes)}
              change="Average across all actions"
            />
          )}
        </div>
      )}

      {/* Activity timeline — role-filtered */}
      <Card className="p-6 bg-card border border-border rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-on-surface">
            Recent Activity
          </h2>
          <span className="text-xs text-text-muted bg-muted px-2.5 py-1 rounded-full font-medium">
            Timeline
          </span>
        </div>

        {!role ? (
          <EmptyState
            icon={<TrendingUp size={28} />}
            title="No role assigned"
            description="Activity will appear here once a role has been assigned."
          />
        ) : allowedActivityTypes.length === 0 ? (
          <EmptyState
            icon={<TrendingUp size={28} />}
            title="No clinical activity for this role"
            description={`The ${ROLE_LABELS[role] ?? role} role records assessments rather than top-level clinical actions.`}
          />
        ) : !visibleActivity.length ? (
          <EmptyState
            icon={<TrendingUp size={28} />}
            title="No activity yet"
            description="This staff member hasn't recorded any clinical actions yet."
          />
        ) : (
          <div className="space-y-3">
            {visibleActivity.map((activity) => (
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

        {hasMore &&
          allowedActivityTypes.length > 0 &&
          visibleActivity.length > 0 && (
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
      </Card>
    </div>
  );
};

export default StaffPerformanceDetailPage;