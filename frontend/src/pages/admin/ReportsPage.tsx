// src/pages/admin/ReportsPage.tsx
// Route: /admin/reports  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (admin)

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { useReports, useExportReport } from '@/hooks/useAdmin';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

const COLORS = ['#002395', '#43B982', '#F5A34A', '#E74F3D', '#4C5C7D', '#DCE3ED'];

export const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, error, refetch } = useReports({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  const exportMutation = useExportReport();

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  const statCards = [
    { label: 'Total Patients',   value: data?.totalPatients    ?? 0, color: 'text-primary'  },
    { label: 'Active',           value: data?.activePatients   ?? 0, color: 'text-success'  },
    { label: 'Discharged',       value: data?.dischargedPatients ?? 0, color: 'text-on-surface-variant' },
    { label: 'Hospitalized',     value: data?.hospitalizedPatients ?? 0, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-heading-1 text-on-surface">Reports</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={exportMutation.isPending}
            onClick={() => exportMutation.mutate({ format: 'pdf' })}
          >
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            loading={exportMutation.isPending}
            onClick={() => exportMutation.mutate({ format: 'excel' })}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date range filter */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-44"
              />
            </div>
            <Button variant="primary" size="sm" onClick={() => refetch()}>
              Apply Filter
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Card key={c.label} className="text-center p-4">
            <p className={`text-3xl font-extrabold ${c.color}`}>{c.value}</p>
            <p className="text-body-sm text-on-surface-variant mt-1">{c.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referrals by Status */}
        {data?.referralsByStatus?.length ? (
          <Card>
            <CardHeader><CardTitle>Referrals by Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.referralsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EBF4" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#002395" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : null}

        {/* Patients by Stage */}
        {data?.patientsByStage?.length ? (
          <Card>
            <CardHeader><CardTitle>Patients by Disease Stage</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.patientsByStage}
                    dataKey="count"
                    nameKey="stage"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ stage, percent }) =>
                      `${stage} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {data.patientsByStage.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : null}

        {/* Visits by Month */}
        {data?.visitsByMonth?.length ? (
          <Card>
            <CardHeader><CardTitle>Visits by Month</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.visitsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EBF4" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#43B982" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : null}

        {/* Close cases by reason */}
        {data?.closeCasesByReason?.length ? (
          <Card>
            <CardHeader><CardTitle>Closed Cases by Reason</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.closeCasesByReason}
                    dataKey="count"
                    nameKey="reason"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ reason, count }) => `${reason}: ${count}`}
                  >
                    {data.closeCasesByReason.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};
