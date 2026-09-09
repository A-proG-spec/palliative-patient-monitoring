import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Hospital, UserX, GitBranch, Bell, CheckCircle2, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { useDashboardStats, useNotifications, useMarkNotificationRead, usePendingStaff, useApproveStaff, useRejectStaff, usePendingReferrals, useApproveReferral, useDeclineReferral } from '@/hooks/useAdmin';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatRelativeTime, formatDate } from '@/lib/utils';

// ── Stat card ────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: number; color?: string; onClick?: () => void;
}> = ({ icon, label, value, color = 'text-primary', onClick }) => (
  <Card hover={!!onClick} padding="md" onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
    <div className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-on-surface">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  </Card>
);

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { data: notifData, isLoading: notifLoading } = useNotifications({ limit: 8 });
  const { data: pendingStaff, isLoading: staffLoading } = usePendingStaff();
  const { data: pendingReferrals, isLoading: refLoading } = usePendingReferrals();

  const markReadMutation = useMarkNotificationRead();
  const approveStaffMutation = useApproveStaff();
  const rejectStaffMutation = useRejectStaff();
  const approveRefMutation = useApproveReferral();
  const declineRefMutation = useDeclineReferral();

  const [roleSelections, setRoleSelections] = useState<Record<string, string>>({});

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  const notifTypeIcon = (type: string) => {
    if (type === 'StaffApproval') return <UserCheck size={15} className="text-primary" />;
    if (type === 'ReferralApproval') return <GitBranch size={15} className="text-warning" />;
    return <CheckCircle2 size={15} className="text-success" />;
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Admin Dashboard</h1>
          <p className="text-sm text-text-secondary">Palliative Care System Overview</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={<Users size={20} />} label="Total Patients" value={stats?.totalPatients ?? 0} onClick={() => navigate('/admin/patients')} />
        <StatCard icon={<CheckCircle2 size={20} />} label="Active Patients" value={stats?.activePatients ?? 0} color="text-success" onClick={() => navigate('/admin/patients')} />
        <StatCard icon={<Hospital size={20} />} label="Hospitalized" value={stats?.hospitalizedPatients ?? 0} color="text-warning" />
        <StatCard icon={<UserX size={20} />} label="Discharged" value={stats?.dischargedPatients ?? 0} color="text-text-muted" />
        <StatCard icon={<GitBranch size={20} />} label="Pending Referrals" value={stats?.pendingReferrals ?? 0} color="text-warning" onClick={() => navigate('/admin/referrals')} />
        <StatCard icon={<UserCheck size={20} />} label="Pending Staff" value={stats?.pendingStaff ?? 0} color="text-primary" onClick={() => navigate('/admin/staff')} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-4 border-b border-border-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-primary" />
              <CardTitle>Notifications</CardTitle>
              {(notifData?.unreadCount ?? 0) > 0 && (
                <Badge variant="primary">{notifData?.unreadCount} unread</Badge>
              )}
            </div>
          </CardHeader>
          <div className="divide-y divide-border-base max-h-80 overflow-y-auto">
            {notifLoading ? (
              <div className="p-5 text-sm text-text-muted">Loading…</div>
            ) : !notifData?.notifications?.length ? (
              <div className="p-5 text-sm text-text-muted text-center">All clear — no notifications</div>
            ) : (
              notifData.notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${!n.read ? 'bg-primary-light/30' : 'hover:bg-surface-low'}`}>
                  <div className="mt-0.5">{notifTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface truncate">{n.message}</p>
                    <p className="text-xs text-text-muted mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <button
                      className="text-xs text-primary hover:underline flex-shrink-0"
                      onClick={() => markReadMutation.mutate(n.id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent referrals */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-4 border-b border-border-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-primary" />
              <CardTitle>Recent Referrals</CardTitle>
            </div>
            <button className="text-xs text-primary hover:underline" onClick={() => navigate('/admin/referrals')}>View all</button>
          </CardHeader>
          <div className="divide-y divide-border-base max-h-80 overflow-y-auto">
            {!stats?.recentReferrals?.length ? (
              <div className="p-5 text-sm text-text-muted text-center">No recent referrals</div>
            ) : (
              stats.recentReferrals.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-low cursor-pointer" onClick={() => navigate('/admin/referrals')}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{r.patientName}</p>
                    <p className="text-xs text-text-muted">{formatDate(r.date)}</p>
                  </div>
                  <StatusBadge status={r.status} type="referral" />
                  <ChevronRight size={14} className="text-outline-variant flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Pending Staff Approvals */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-4 border-b border-border-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-primary" />
            <CardTitle>Pending Staff Approvals</CardTitle>
            {(pendingStaff?.length ?? 0) > 0 && (
              <Badge variant="warning">{pendingStaff?.length}</Badge>
            )}
          </div>
          <button className="text-xs text-primary hover:underline" onClick={() => navigate('/admin/staff')}>View all</button>
        </CardHeader>
        {staffLoading ? (
          <div className="p-5 text-sm text-text-muted">Loading…</div>
        ) : !pendingStaff?.length ? (
          <div className="p-5 text-sm text-text-muted text-center">No pending approvals</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-low">
                <tr>
                  {['Name', 'Email', 'Phone', 'Requested', 'Role', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {pendingStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-on-surface">{staff.name}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{staff.email}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{staff.phone}</td>
                    <td className="px-5 py-3.5 text-text-muted">{formatRelativeTime(staff.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <Select
                        options={[
                          { value: 'TeamLeader', label: 'Team Leader' },
                          { value: 'Physician', label: 'Physician' },
                          { value: 'Nurse', label: 'Nurse' },
                        ]}
                        placeholder="Select role…"
                        value={roleSelections[staff.id] || ''}
                        onChange={(e) => setRoleSelections((prev) => ({ ...prev, [staff.id]: e.target.value }))}
                        className="w-36 text-xs"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={!roleSelections[staff.id]}
                          loading={approveStaffMutation.isPending}
                          onClick={() => roleSelections[staff.id] && approveStaffMutation.mutate({ staffId: staff.id, data: { role: roleSelections[staff.id] as 'TeamLeader' | 'Physician' | 'Nurse' } })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          loading={rejectStaffMutation.isPending}
                          onClick={() => rejectStaffMutation.mutate(staff.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pending Referrals */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-4 border-b border-border-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-primary" />
            <CardTitle>Pending Referral Approvals</CardTitle>
            {(pendingReferrals?.length ?? 0) > 0 && (
              <Badge variant="warning">{pendingReferrals?.length}</Badge>
            )}
          </div>
        </CardHeader>
        {refLoading ? (
          <div className="p-5 text-sm text-text-muted">Loading…</div>
        ) : !pendingReferrals?.length ? (
          <div className="p-5 text-sm text-text-muted text-center">No pending referrals</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-low">
                <tr>
                  {['Patient', 'Diagnosis', 'Receiving Facility', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {pendingReferrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-on-surface">{ref.patientId}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{ref.primaryDiagnosis}</td>
                    <td className="px-5 py-3.5 text-text-secondary truncate max-w-xs">{ref.receivingFacility}</td>
                    <td className="px-5 py-3.5 text-text-muted">{formatDate(ref.referralDate)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <Button size="sm" loading={approveRefMutation.isPending} onClick={() => approveRefMutation.mutate(ref.id)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" loading={declineRefMutation.isPending} onClick={() => declineRefMutation.mutate(ref.id)}>
                          Decline
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
