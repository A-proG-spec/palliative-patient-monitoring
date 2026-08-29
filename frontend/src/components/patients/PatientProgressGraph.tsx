// src/components/patients/PatientProgressGraph.tsx
// KPS / PPS line chart per frontend-specification/00-frontend-conventions.md §5

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ProgressDataPoint } from '@/types/patient.types';

interface TrendSummary {
  trend: 'improving' | 'stable' | 'declining';
  percentageChange: number;
  firstScore?: number;
  lastScore?: number;
}

interface PatientProgressGraphProps {
  patientName: string;
  data: ProgressDataPoint[];
  loading?: boolean;
  trends?: {
    kps: TrendSummary;
    pps: TrendSummary;
  };
}

const trendVariant = (t: string) =>
  t === 'improving' ? 'success' : t === 'declining' ? 'error' : 'secondary';

const trendArrow = (t: string) =>
  t === 'improving' ? '↑' : t === 'declining' ? '↓' : '→';

export const PatientProgressGraph: React.FC<PatientProgressGraphProps> = ({
  patientName,
  data,
  loading,
  trends,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Progress</CardTitle>
          <CardDescription>Loading progress data…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 skeleton rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Progress</CardTitle>
          <CardDescription>
            No KPS/PPS scores have been recorded for this patient yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const lastKps = data[data.length - 1]?.kpsScore ?? 0;
  const lastPps = data[data.length - 1]?.ppsScore ?? 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <CardTitle>Patient Progress: {patientName}</CardTitle>
            <CardDescription>
              KPS (Karnofsky Performance Score) &amp; PPS (Palliative Performance Scale)
            </CardDescription>
          </div>
          <div className="flex gap-4 text-body-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-primary inline-block" />
              <span>KPS: {lastKps}</span>
              {trends && (
                <Badge variant={trendVariant(trends.kps.trend) as 'success' | 'error' | 'secondary'}>
                  {trendArrow(trends.kps.trend)} {Math.abs(trends.kps.percentageChange)}%
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-success inline-block" />
              <span>PPS: {lastPps}</span>
              {trends && (
                <Badge variant={trendVariant(trends.pps.trend) as 'success' | 'error' | 'secondary'}>
                  {trendArrow(trends.pps.trend)} {Math.abs(trends.pps.percentageChange)}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6EBF4" />
              <XAxis
                dataKey="visitDate"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={48}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-surface-container-lowest p-3 rounded-lg shadow-lg border border-border-base text-body-sm">
                      <p className="font-semibold mb-1">{label}</p>
                      <p className="text-primary">KPS: {payload[0]?.value}</p>
                      <p className="text-success">PPS: {payload[1]?.value}</p>
                    </div>
                  );
                }}
              />
              <Legend formatter={(v) => v === 'kpsScore' ? 'KPS Score' : 'PPS Score'} />
              <ReferenceLine y={80} stroke="#C2C6D6" strokeDasharray="4 4" label={{ value: 'High', fontSize: 10 }} />
              <ReferenceLine y={50} stroke="#C2C6D6" strokeDasharray="4 4" label={{ value: 'Medium', fontSize: 10 }} />
              <ReferenceLine y={20} stroke="#C2C6D6" strokeDasharray="4 4" label={{ value: 'Low', fontSize: 10 }} />
              <Line type="monotone" dataKey="kpsScore" stroke="#002395" strokeWidth={2}
                dot={{ fill: '#002395', r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="ppsScore" stroke="#43B982" strokeWidth={2}
                dot={{ fill: '#43B982', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trend summary */}
        {trends && (
          <div className="mt-4 p-3 bg-surface-container-low rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm">
            {[
              { label: 'KPS Trend', t: trends.kps },
              { label: 'PPS Trend', t: trends.pps },
            ].map(({ label, t }) => (
              <div key={label}>
                <p className="font-semibold text-on-surface">{label}</p>
                <p className="text-on-surface-variant">
                  {t.trend === 'improving' ? 'Patient shows improvement'
                    : t.trend === 'declining' ? 'Patient shows decline'
                    : 'Patient is stable'}
                </p>
                {t.firstScore !== undefined && (
                  <p className="text-text-muted mt-0.5">
                    {t.firstScore} → {t.lastScore} ({t.percentageChange}% change)
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-body-sm text-text-muted">
          Scores range from 0–100. Higher scores indicate better functional status. KPS measures functional independence · PPS measures overall performance.
        </p>
      </CardContent>
    </Card>
  );
};
