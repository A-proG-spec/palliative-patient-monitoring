import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Activity, Bell, AlertTriangle, Clock, ArrowRight, Home, Hospital, Pill, FlaskConical, Scan } from 'lucide-react';
import { useStaffDashboardStats, useStaffProfile } from '@/hooks/useStaff';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { ROLE_LABELS as RL, VISIT_TYPE_LABELS, OUTCOME_LABELS } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission, type StaffRole } from '@/config/permissions';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color?: string }> = ({ icon, label, value, color = 'text-primary' }) => (
  <Card padding="md">
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light ${color}`}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-on-surface">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  </Card>
);

const alertIconMap: Record<string, React.ReactNode> = {
  RedFlag: <AlertTriangle size={14} className="text-error" />,
  ReferralPending: <Bell size={14} className="text-warning" />,
  VisitOverdue: <Clock size={14} className="text-warning" />,
  MedicationDue: <Activity size={14} className="text-primary" />,
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, error, refetch } = useStaffDashboardStats();
  const { data: profile } = useStaffProfile();
  const { user } = useAuthStore();

  const userRole = (user?.role ?? '') as StaffRole;

  // Determine which dashboard view to show based on role
  const canRegisterPatient = hasPermission(userRole, 'canRegisterPatient');
  const canViewMedicationQueue = hasPermission(userRole, 'canMarkMedicationGiven');
  const canViewLabQueue = hasPermission(userRole, 'canEnterLabResult');
  const canViewImagingQueue = hasPermission(userRole, 'canEnterImagingReport');

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  // Role-specific queue dashboard for Pharmacist, Lab Technician, Radiologist
  if (canViewMedicationQueue || canViewLabQueue || canViewImagingQueue) {
    const queueInfo = canViewMedicationQueue
      ? { title: 'Pending Medication Orders', icon: <Pill size={48} />, route: '/medication-orders', color: 'text-primary' }
      : canViewLabQueue
      ? { title: 'Pending Lab Requests', icon: <FlaskConical size={48} />, route: '/lab-requests', color: 'text-success' }
      : { title: 'Pending Imaging Orders', icon: <Scan size={48} />, route: '/imaging-orders', color: 'text-warning' };

    return (
      <div className="space-y-7">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            Welcome back, {profile?.name?.split(' ')[0] ?? 'User'} 👋
          </h1>
          <p className="text-sm text-text-secondary">
            {RL[profile?.role ?? ''] || 'Staff'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Queue Summary Card */}
        <Card>
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light ${queueInfo.color} mb-6`}>
              {queueInfo.icon}
            </div>
            <p className="text-xl font-semibold text-on-surface mb-6">
              {queueInfo.title}
            </p>
            <Button onClick={() => navigate(queueInfo.route)} rightIcon={<ArrowRight size={14} />}>
              View Queue
            </Button>
          </div>
        </Card>

        {/* Info message */}
        <div className="rounded-xl bg-surface-low border border-border-base px-5 py-4">
          <p className="text-sm text-text-secondary">
            <strong className="text-on-surface">Note:</strong> Your dashboard shows your pending work queue. 
            {canViewMedicationQueue && ' Review and process medication orders assigned to you.'}
            {canViewLabQueue && ' Review and enter results for lab requests.'}
            {canViewImagingQueue && ' Review and submit reports for imaging orders.'}
          </p>
        </div>
      </div>
    );
  }

  // Original patient-caring role dashboard (TeamLeader, Physician, Nurse)
  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            Welcome back, {profile?.name?.split(' ')[0] ?? 'Doctor'} 👋
          </h1>
          <p className="text-sm text-text-secondary">
            {RL[profile?.role ?? ''] || 'Staff'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {canRegisterPatient && (
          <Button onClick={() => navigate('/patients/new')} rightIcon={<ArrowRight size={14} />}>
            Register Patient
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Calendar size={18} />} label="Today's Visits" value={stats?.todayVisits ?? 0} />
        <StatCard icon={<Users size={18} />} label="Total Patients" value={stats?.totalPatients ?? 0} />
        <StatCard icon={<Activity size={18} />} label="Active Patients" value={stats?.activePatients ?? 0} color="text-success" />
        <StatCard icon={<Bell size={18} />} label="Pending Tasks" value={stats?.pendingTasks ?? 0} color="text-warning" />
      </div>

      {/* Alerts */}
      {(stats?.alerts?.length ?? 0) > 0 && (
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border-base">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-error" />
              <CardTitle>Alerts</CardTitle>
              <Badge variant="error">{stats!.alerts.length}</Badge>
            </div>
          </CardHeader>
          <div className="divide-y divide-border-base">
            {stats!.alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-low cursor-pointer transition-colors"
                onClick={() => navigate(`/patients/${alert.patientId}`)}
              >
                <div className="mt-0.5">{alertIconMap[alert.type] ?? <Bell size={14} />}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface">{alert.message}</p>
                  <p className="text-xs text-text-muted">{alert.patientName} · {formatRelativeTime(alert.createdAt)}</p>
                </div>
                <ArrowRight size={14} className="text-outline-variant flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assigned patients */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border-base flex items-center justify-between">
            <CardTitle>My Patients</CardTitle>
            <button className="text-xs text-primary hover:underline" onClick={() => navigate('/patients')}>View all</button>
          </CardHeader>
          <div className="divide-y divide-border-base max-h-80 overflow-y-auto">
            {!stats?.assignedPatients?.length ? (
              <p className="p-5 text-sm text-text-muted text-center">No assigned patients</p>
            ) : (
              stats.assignedPatients.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-low cursor-pointer transition-colors"
                  onClick={() => navigate(`/patients/${p.id}`)}
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-text-muted truncate">{p.primaryDiagnosis}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {p.currentLocation === 'ReferredHospital' ? <Hospital size={12} className="text-warning" /> : <Home size={12} className="text-success" />}
                    <StatusBadge status={p.status} type="patient" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent visits */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border-base">
            <CardTitle>Recent Visits</CardTitle>
          </CardHeader>
          <div className="divide-y divide-border-base max-h-80 overflow-y-auto">
            {!stats?.recentVisits?.length ? (
              <p className="p-5 text-sm text-text-muted text-center">No recent visits</p>
            ) : (
              stats.recentVisits.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-low cursor-pointer"
                  onClick={() => navigate(`/patients/${v.patientId}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface">{v.patientName}</p>
                    <p className="text-xs text-text-muted">{formatDate(v.visitDate)}</p>
                  </div>
                  <StatusBadge status={v.outcome} type="visit" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Upcoming visits */}
      {(stats?.upcomingVisits?.length ?? 0) > 0 && (
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border-base">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <CardTitle>Upcoming Visits</CardTitle>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-low">
                <tr>
                  {['Patient', 'Scheduled Date', 'Visit Type'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {stats!.upcomingVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-low/50 cursor-pointer" onClick={() => navigate(`/patients/${v.patientId}`)}>
                    <td className="px-5 py-3.5 font-medium text-on-surface">{v.patientName}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{formatDate(v.scheduledDate)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={v.visitType === 'Emergency' ? 'error' : 'secondary'}>
                        {VISIT_TYPE_LABELS[v.visitType] || v.visitType}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
