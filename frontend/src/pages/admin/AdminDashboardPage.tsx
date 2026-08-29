// src/pages/admin/AdminDashboardPage.tsx
// Route: /admin  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (admin)

import React from 'react';
import {
  useDashboardStats,
  useNotifications,
  useMarkNotificationRead,
  usePendingStaff,
  useApproveStaff,
  useRejectStaff,
  usePendingReferrals,
  useApproveReferral,
  useDeclineReferral,
} from '@/hooks/useAdmin';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { STAFF_ROLE_OPTIONS, ROUTES } from '@/constants';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading, error: statsError, refetch } = useDashboardStats();
  const { data: notifData, isLoading: notifLoading } = useNotifications({ limit: 10 });
  const { data: pendingStaff, isLoading: staffLoading } = usePendingStaff();
  const { data: pendingReferrals, isLoading: referralsLoading } = usePendingReferrals();

  const markReadMutation = useMarkNotificationRead();
  const approveStaffMutation = useApproveStaff();
  const rejectStaffMutation = useRejectStaff();
  const approveReferralMutation = useApproveReferral();
  const declineReferralMutation = useDeclineReferral();

  // Role selection state per staff member
  const [roleSelections, setRoleSelections] = React.useState<Record<string, string>>({});

  if (statsLoading) return <PageLoader />;
  if (statsError) return <ErrorState onRetry={refetch} />;

  const statCards = [
    { label: 'Total Patients',    value: stats?.totalPatients ?? 0,       color: 'text-primary' },
    { label: 'Active Patients',   value: stats?.activePatients ?? 0,       color: 'text-success' },
    { label: 'Hospitalized',      value: stats?.hospitalizedPatients ?? 0, color: 'text-warning' },
    { label: 'Discharged',        value: stats?.dischargedPatients ?? 0,   color: 'text-on-surface-variant' },
    { label: 'Pending Staff',     value: stats?.pendingStaff ?? 0,         color: 'text-error' },
    { label: 'Pending Referrals', value: stats?.pendingReferrals ?? 0,     color: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-heading-1 text-on-surface">Admin Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c) => (
          <Card key={c.label} className="text-center p-4">
            <p className={`text-3xl font-extrabold ${c.color}`}>{c.value}</p>
            <p className="text-body-sm text-on-surface-variant mt-1">{c.label}</p>
          </Card>
        ))}
      </div>

      {/* Notifications + Pending Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              {(notifData?.unreadCount ?? 0) > 0 && (
                <Badge variant="error">{notifData?.unreadCount} unread</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {notifLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
            ) : !notifData?.notifications?.length ? (
              <p className="text-body-md text-text-muted text-center py-6">No notifications.</p>
            ) : (
              <ul className="space-y-3">
                {notifData.notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`p-3 rounded-lg border ${n.read ? 'border-border-base bg-surface-container-lowest' : 'border-primary/20 bg-primary-light'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <StatusBadge status={n.type} />
                        <p className="text-body-sm text-on-surface mt-1">{n.message}</p>
                        <p className="text-body-sm text-text-muted mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markReadMutation.mutate(n.id)}
                          className="shrink-0 text-body-sm"
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Pending Staff Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Staff Approvals</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.ADMIN_STAFF)}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {staffLoading ? (
              <div className="space-y-2">{[1,2].map(i => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
            ) : !pendingStaff?.length ? (
              <p className="text-body-md text-text-muted text-center py-6">No pending approvals.</p>
            ) : (
              <ul className="space-y-3">
                {pendingStaff.slice(0, 5).map((s) => (
                  <li key={s.id} className="p-3 rounded-lg border border-border-base bg-surface-container-lowest">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-semibold text-on-surface truncate">{s.name}</p>
                        <p className="text-body-sm text-text-muted truncate">{s.email}</p>
                        <p className="text-body-sm text-text-muted">{s.phone}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Select
                          options={STAFF_ROLE_OPTIONS}
                          placeholder="Select role"
                          value={roleSelections[s.id] ?? ''}
                          onChange={(e) => setRoleSelections((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          className="text-body-sm py-1.5 w-36"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!roleSelections[s.id] || approveStaffMutation.isPending}
                          loading={approveStaffMutation.isPending}
                          onClick={() => {
                            if (roleSelections[s.id]) {
                              approveStaffMutation.mutate({
                                staffId: s.id,
                                data: { role: roleSelections[s.id] as 'TeamLeader' | 'Physician' | 'Nurse' },
                              });
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={rejectStaffMutation.isPending}
                          onClick={() => rejectStaffMutation.mutate(s.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Referrals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Referrals</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.ADMIN_REFERRALS)}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {referralsLoading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
          ) : !pendingReferrals?.length ? (
            <p className="text-body-md text-text-muted text-center py-6">No pending referrals.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="border-b border-border-base text-left">
                    <th className="py-2 pr-4 text-on-surface-variant font-semibold">Patient</th>
                    <th className="py-2 pr-4 text-on-surface-variant font-semibold hidden sm:table-cell">Diagnosis</th>
                    <th className="py-2 pr-4 text-on-surface-variant font-semibold hidden md:table-cell">Date</th>
                    <th className="py-2 text-on-surface-variant font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReferrals.slice(0, 5).map((r) => (
                    <tr key={r.id} className="border-b border-border-base last:border-0">
                      <td className="py-3 pr-4 font-medium text-on-surface">
                        {typeof r.patientId === 'string' ? r.patientId : '—'}
                      </td>
                      <td className="py-3 pr-4 text-on-surface-variant hidden sm:table-cell">{r.primaryDiagnosis}</td>
                      <td className="py-3 pr-4 text-on-surface-variant hidden md:table-cell">{formatDate(r.referralDate)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            loading={approveReferralMutation.isPending}
                            onClick={() => approveReferralMutation.mutate(r.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            loading={declineReferralMutation.isPending}
                            onClick={() => declineReferralMutation.mutate(r.id)}
                          >
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
        </CardContent>
      </Card>

      {/* Recent visits */}
      {stats?.recentVisits && stats.recentVisits.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Visits</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y divide-border-base">
              {stats.recentVisits.map((v, i) => (
                <li key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">{v.patientName}</p>
                    <p className="text-body-sm text-text-muted">{v.staff} · {formatDate(v.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
