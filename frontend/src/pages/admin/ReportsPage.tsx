import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useReports } from '@/hooks/useAdmin';
import { useChartTheme } from '@/hooks/useChartTheme';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';

const COLORS = ['#4D73D9', '#43B982', '#F5A34A', '#E74F3D', '#4C5C7D'];

const ReportsPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useReports();
  const ct = useChartTheme();

  if (isLoading) return <PageLoader />;
  if (error || !data) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton to="/admin" label="Dashboard" />
          <h1 className="text-2xl font-bold text-on-surface">Reports & Analytics</h1>
          <p className="text-sm text-text-secondary">System-wide statistics and trends</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: data.totalPatients },
          { label: 'Active', value: data.activePatients },
          { label: 'Hospitalized', value: data.hospitalizedPatients },
          { label: 'Discharged', value: data.dischargedPatients },
        ].map(({ label, value }) => (
          <Card key={label} padding="md">
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Visits by month */}
        <Card padding="lg">
          <CardHeader><CardTitle>Visits by Month</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.visitsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: ct.axisTick }} stroke={ct.axisStroke} />
                <YAxis tick={{ fontSize: 11, fill: ct.axisTick }} stroke={ct.axisStroke} />
                <Tooltip
                  contentStyle={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}`, borderRadius: 8, color: ct.tooltipText }}
                />
                <Bar dataKey="count" fill="#4D73D9" radius={[4, 4, 0, 0]} name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Patients by location */}
        <Card padding="lg">
          <CardHeader><CardTitle>Patients by Location</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.patientsByLocation} dataKey="count" nameKey="location" cx="50%" cy="50%" outerRadius={80} label={({ location, percent }) => `${location} ${(percent * 100).toFixed(0)}%`}>
                  {data.patientsByLocation.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}`, borderRadius: 8, color: ct.tooltipText }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Disease stage */}
        <Card padding="lg">
          <CardHeader><CardTitle>Patients by Disease Stage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.patientsByStage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
                <XAxis type="number" tick={{ fontSize: 11, fill: ct.axisTick }} stroke={ct.axisStroke} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: ct.axisTick }} stroke={ct.axisStroke} width={70} />
                <Tooltip contentStyle={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}`, borderRadius: 8, color: ct.tooltipText }} />
                <Bar dataKey="count" fill="#43B982" radius={[0, 4, 4, 0]} name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Referrals by status */}
        <Card padding="lg">
          <CardHeader><CardTitle>Referrals by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.referralsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }) => `${status}: ${count}`}>
                  {data.referralsByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}`, borderRadius: 8, color: ct.tooltipText }} />
                <Legend formatter={(v) => <span style={{ color: ct.legendText }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
