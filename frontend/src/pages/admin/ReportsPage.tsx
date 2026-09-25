import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import { useReports } from '@/hooks/useAdmin';
import { useChartTheme } from '@/hooks/useChartTheme';
import { Card } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';

// Palette retained from original code
const COLORS = ['#4D73D9', '#43B982', '#F5A34A', '#E74F3D', '#4C5C7D'];

const ReportsPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useReports();
  const ct = useChartTheme();

  if (isLoading) return <PageLoader />;
  if (error || !data) return <ErrorState onRetry={refetch} />;

  const kpis = [
    { label: 'Total Patients', value: data.totalPatients, isPrimary: true, change: 'Increased from last month' },
    { label: 'Active', value: data.activePatients, isPrimary: false, change: 'Currently active' },
    { label: 'Hospitalized', value: data.hospitalizedPatients, isPrimary: false, change: 'In patient care' },
    { label: 'Discharged', value: data.dischargedPatients, isPrimary: false, change: 'Completed treatment' },
  ];

  return (
    <div className="p-6 space-y-6 text-on-surface">
      {/* Page Title & Navigation Header */}
      <div>
        <BackButton to="/admin" label="Dashboard" />
        <h1 className="text-2xl font-bold tracking-tight text-on-surface mt-1">Reports & Analytics</h1>
        <p className="text-sm text-text-secondary mt-0.5">System-wide statistics and trends overview</p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`p-5 rounded-2xl transition-all ${
              kpi.isPrimary
                ? 'bg-[#4D73D9] text-white shadow-lg shadow-[#4D73D9]/20'
                : 'bg-card border border-border text-on-surface shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${kpi.isPrimary ? 'text-white/80' : 'text-text-secondary'}`}>
                {kpi.label}
              </span>
              <div
                className={`p-1.5 rounded-full ${
                  kpi.isPrimary ? 'bg-white/20 text-white' : 'bg-muted text-on-surface'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-3xl font-extrabold tracking-tight">{kpi.value}</span>
            </div>

            <p className={`text-[11px] mt-2 ${kpi.isPrimary ? 'text-white/70' : 'text-text-muted'}`}>
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Visits by month */}
        <Card className="p-6 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-on-surface">Visits by Month</h2>
            <span className="text-xs text-text-muted bg-muted px-2.5 py-1 rounded-full font-medium">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.visitsByMonth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={ct.gridStroke} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: ct.axisTick }} stroke={ct.axisStroke} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: ct.axisTick }} stroke={ct.axisStroke} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: ct.tooltipBg,
                  border: `1px solid ${ct.tooltipBorder}`,
                  borderRadius: '12px',
                  color: ct.tooltipText,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              />
              <Bar dataKey="count" fill="#4D73D9" radius={[8, 8, 0, 0]} name="Visits" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Patients by location */}
        <Card className="p-6 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-on-surface">Patients by Location</h2>
            <span className="text-xs text-text-muted bg-muted px-2.5 py-1 rounded-full font-medium">Regional</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.patientsByLocation}
                dataKey="count"
                nameKey="location"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                label={({ location, percent }) => `${location} ${(percent * 100).toFixed(0)}%`}
              >
                {data.patientsByLocation.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: ct.tooltipBg,
                  border: `1px solid ${ct.tooltipBorder}`,
                  borderRadius: '12px',
                  color: ct.tooltipText,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Disease stage */}
        <Card className="p-6 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-on-surface">Patients by Disease Stage</h2>
            <span className="text-xs text-text-muted bg-muted px-2.5 py-1 rounded-full font-medium">Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.patientsByStage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={ct.gridStroke} />
              <XAxis type="number" tick={{ fontSize: 11, fill: ct.axisTick }} stroke={ct.axisStroke} axisLine={false} tickLine={false} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: ct.axisTick }} stroke={ct.axisStroke} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{
                  background: ct.tooltipBg,
                  border: `1px solid ${ct.tooltipBorder}`,
                  borderRadius: '12px',
                  color: ct.tooltipText,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              />
              <Bar dataKey="count" fill="#43B982" radius={[0, 8, 8, 0]} name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Referrals by status */}
        <Card className="p-6 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-on-surface">Referrals by Status</h2>
            <span className="text-xs text-text-muted bg-muted px-2.5 py-1 rounded-full font-medium">Status</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.referralsByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                label={({ status, count }) => `${status}: ${count}`}
              >
                {data.referralsByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: ct.tooltipBg,
                  border: `1px solid ${ct.tooltipBorder}`,
                  borderRadius: '12px',
                  color: ct.tooltipText,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              />
              <Legend formatter={(v) => <span style={{ color: ct.legendText }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;