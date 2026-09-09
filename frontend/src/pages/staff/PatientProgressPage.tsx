import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { usePatient } from '@/hooks/usePatients';
import { usePatientProgress } from '@/hooks/usePatientProgress';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState, EmptyState } from '@/components/common/EmptyState';

const TrendIcon: React.FC<{ trend: string }> = ({ trend }) => {
  if (trend === 'improving') return <TrendingUp size={14} className="text-success" />;
  if (trend === 'declining') return <TrendingDown size={14} className="text-error" />;
  return <Minus size={14} className="text-text-muted" />;
};

const PatientProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient } = usePatient(id!);
  const { data: progress, isLoading, error, refetch } = usePatientProgress(id!);

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  if (!progress?.visits?.length) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <BackButton to={`/patients/${id}`} label="Patient" />
          <h1 className="text-xl font-bold text-on-surface">Patient Progress</h1>
        </div>
        <EmptyState title="No progress data" description="KPS/PPS scores are recorded during home visits." />
      </div>
    );
  }

  const { trends } = progress;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">Progress: {progress.patientName}</h1>
          <p className="text-sm text-text-secondary">KPS & PPS trend over {progress.visits.length} visits</p>
        </div>
      </div>

      {/* Trend badges */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: 'KPS (Karnofsky)', trend: trends.kps },
          { label: 'PPS (Palliative Performance)', trend: trends.pps },
        ].map(({ label, trend }) => (
          <Card key={label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-text-muted mb-1">{label}</p>
                <p className="text-2xl font-bold text-on-surface">{trend.lastScore}</p>
                <p className="text-xs text-text-muted">from {trend.firstScore}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendIcon trend={trend.trend} />
                <Badge variant={trend.trend === 'improving' ? 'success' : trend.trend === 'declining' ? 'error' : 'default'}>
                  {trend.percentageChange > 0 ? '+' : ''}{trend.percentageChange}%
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>KPS & PPS Over Time</CardTitle>
          <CardDescription>Scores range 0–100. Higher = better functional status.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progress.visits}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6EBF4" />
              <XAxis dataKey="visitDate" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => active && payload?.length ? (
                  <div className="bg-surface-lowest rounded-xl border border-border-base shadow-lg p-3 text-xs">
                    <p className="font-semibold mb-1">{label}</p>
                    <p className="text-primary">KPS: {payload[0]?.value}</p>
                    <p className="text-success">PPS: {payload[1]?.value}</p>
                  </div>
                ) : null}
              />
              <Legend formatter={(v) => v === 'kpsScore' ? 'KPS Score' : 'PPS Score'} />
              <ReferenceLine y={80} stroke="#C2C6D6" strokeDasharray="4 2" label={{ value: 'High', fontSize: 10 }} />
              <ReferenceLine y={50} stroke="#C2C6D6" strokeDasharray="4 2" label={{ value: 'Medium', fontSize: 10 }} />
              <ReferenceLine y={20} stroke="#C2C6D6" strokeDasharray="4 2" label={{ value: 'Low', fontSize: 10 }} />
              <Line type="monotone" dataKey="kpsScore" stroke="#002395" strokeWidth={2} dot={{ fill: '#002395', r: 4 }} activeDot={{ r: 6 }} name="kpsScore" />
              <Line type="monotone" dataKey="ppsScore" stroke="#43B982" strokeWidth={2} dot={{ fill: '#43B982', r: 4 }} activeDot={{ r: 6 }} name="ppsScore" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProgressPage;
