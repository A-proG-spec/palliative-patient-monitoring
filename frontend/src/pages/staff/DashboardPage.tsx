// src/pages/staff/DashboardPage.tsx
// Route: /dashboard  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (staff)
// Auto-refreshes every 60 seconds per spec.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffDashboardStats, useStaffProfileData } from '@/hooks/useStaff';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { ROUTES, VISIT_TYPE_LABELS } from '@/constants';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, error: statsError, refetch } = useStaffDashboardStats();
  const { data: profile, isLoading: profileLoading } = useStaffProfileData();

  if (statsLoading || profileLoading) return <PageLoader />;
  if (statsError) return <ErrorState onRetry={refetch} />;

  const statCards = [
    { label: "Today's Visits",  value: stats?.todayVisits   ?? 0, color: 'text-primary' },
    { label: 'Total Patients',  value: stats?.totalPatients ?? 0, color: 'text-on-surface' },
    { label: 'Active Patients', value: stats?.activePatients ?? 0, color: 'text-success' },
    { label: 'Pending Tasks',   value: stats?.pendingTasks   ?? 0, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-heading-1 text-on-surface">
            Welcome back, {profile?.name ?? '…'}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {profile?.role ?? ''} · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Card key={c.label} className="text-center p-4">
            <p className={`text-3xl font-extrabold ${c.color}`}>{c.value}</p>
            <p className="text-body-sm text-on-surface-variant mt-1">{c.label}</p>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {(stats?.alerts?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Alerts</CardTitle>
              <Badge variant="error">{stats!.alerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats!.alerts.map((a) => (
                <li
                  key={a.id}
                  onClick={() => navigate(ROUTES.PATIENT_DETAIL(a.patientId))}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border-base bg-surface-container-lowest hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <span className={`mt-0.5 shrink-0 h-2.5 w-2.5 rounded-full ${a.type === 'RedFlag' ? 'bg-error' : 'bg-warning'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-semibold text-on-surface">{a.message}</p>
                    <p className="text-body-sm text-text-muted">{a.patientName} · {formatRelativeTime(a.createdAt)}</p>
                  </div>
                  <StatusBadge status={a.type} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Patients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Patients</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PATIENTS)}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!stats?.assignedPatients?.length ? (
              <p className="text-body-md text-text-muted text-center py-6">No assigned patients.</p>
            ) : (
              <ul className="divide-y divide-border-base">
                {stats.assignedPatients.slice(0, 6).map((p) => (
                  <li
                    key={p.id}
                    onClick={() => navigate(ROUTES.PATIENT_DETAIL(p.id))}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-surface-container-low -mx-5 px-5 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-on-surface truncate">
                        {p.firstName} {p.lastName}
                        <span className="text-text-muted font-normal ml-2">{p.patientDisplayId}</span>
                      </p>
                      <p className="text-body-sm text-text-muted truncate">{p.primaryDiagnosis}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <StatusBadge status={p.currentLocation} />
                      <StatusBadge status={p.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Visits */}
        <Card>
          <CardHeader><CardTitle>Recent Visits</CardTitle></CardHeader>
          <CardContent>
            {!stats?.recentVisits?.length ? (
              <p className="text-body-md text-text-muted text-center py-6">No recent visits.</p>
            ) : (
              <ul className="divide-y divide-border-base">
                {stats.recentVisits.slice(0, 5).map((v) => (
                  <li
                    key={v.id}
                    onClick={() => navigate(ROUTES.PATIENT_DETAIL(v.patientId))}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-surface-container-low -mx-5 px-5 transition-colors"
                  >
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface">{v.patientName}</p>
                      <p className="text-body-sm text-text-muted">{formatDate(v.visitDate)}</p>
                    </div>
                    <StatusBadge status={v.outcome} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Visits */}
      {(stats?.upcomingVisits?.length ?? 0) > 0 && (
        <Card>
          <CardHeader><CardTitle>Upcoming Visits</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <thead className="border-b border-border-base">
                  <tr>
                    {['Patient', 'Scheduled Date', 'Visit Type'].map((h) => (
                      <th key={h} className="pb-2 pr-4 text-left text-on-surface-variant font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {stats!.upcomingVisits.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => navigate(ROUTES.PATIENT_DETAIL(v.patientId))}
                      className="cursor-pointer hover:bg-surface-container-low transition-colors"
                    >
                      <td className="py-3 pr-4 font-semibold text-on-surface">{v.patientName}</td>
                      <td className="py-3 pr-4 text-on-surface-variant">{formatDate(v.scheduledDate)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{VISIT_TYPE_LABELS[v.visitType] ?? v.visitType}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
