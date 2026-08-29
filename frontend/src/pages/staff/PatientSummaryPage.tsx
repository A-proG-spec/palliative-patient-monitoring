// src/pages/staff/PatientSummaryPage.tsx
// Route: /patients/:patientId/summary  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (staff)

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientSummary } from '@/hooks/usePatients';
import { usePatientProgress } from '@/hooks/usePatientProgress';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PatientProgressGraph } from '@/components/patients/PatientProgressGraph';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants';

export const PatientSummaryPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const { data: summary, isLoading, error, refetch } = usePatientSummary(patientId!);
  const patientName = summary
    ? `${summary.patient.firstName} ${summary.patient.lastName}`
    : '';
  const { data: progressData, isLoading: progressLoading } = usePatientProgress(patientId!, patientName);

  if (isLoading) return <PageLoader />;
  if (error || !summary) return <ErrorState onRetry={refetch} />;

  const { patient, diagnosis, visits, medications, labTests, referrals, admissions } = summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENT_DETAIL(patientId!))}>
            ← Back
          </Button>
          <div>
            <h1 className="text-heading-1 text-on-surface">
              Patient Summary: {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-body-sm text-text-muted">{patient.patientDisplayId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={patient.status} />
          <StatusBadge status={patient.currentLocation} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Info */}
        <Card>
          <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-body-sm">
              <dt className="text-on-surface-variant font-semibold">Name</dt>
              <dd className="text-on-surface">{patient.firstName} {patient.lastName}</dd>
              <dt className="text-on-surface-variant font-semibold">Age / Sex</dt>
              <dd className="text-on-surface">{patient.age} / {patient.sex}</dd>
              <dt className="text-on-surface-variant font-semibold">Status</dt>
              <dd><StatusBadge status={patient.status} /></dd>
              <dt className="text-on-surface-variant font-semibold">Location</dt>
              <dd><StatusBadge status={patient.currentLocation} /></dd>
            </dl>
          </CardContent>
        </Card>

        {/* Diagnosis */}
        <Card>
          <CardHeader><CardTitle>Diagnosis</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-body-sm">
              <dt className="text-on-surface-variant font-semibold">Primary</dt>
              <dd className="text-on-surface">{diagnosis.primary}</dd>
              <dt className="text-on-surface-variant font-semibold">Secondary</dt>
              <dd className="text-on-surface">{diagnosis.secondary.join(', ') || '—'}</dd>
              <dt className="text-on-surface-variant font-semibold">Stage</dt>
              <dd className="text-on-surface">{diagnosis.stage}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* KPS / PPS Progress Graph */}
      <PatientProgressGraph
        patientName={patientName}
        data={progressData?.visits ?? []}
        loading={progressLoading}
        trends={progressData?.trends}
      />

      {/* Visit History */}
      <SummaryTable title="Visit History" rows={visits} columns={[
        { label: 'Date',    render: (r) => formatDate(r.date) },
        { label: 'Outcome', render: (r) => <StatusBadge status={r.outcome} /> },
        { label: 'Staff',   render: (r) => r.staff?.name ?? '—' },
      ]} />

      {/* Medications */}
      <SummaryTable title="Medications" rows={medications} columns={[
        { label: 'Name',            render: (r) => r.name },
        { label: 'Dosage',          render: (r) => r.dosage },
        { label: 'Status',          render: (r) => <StatusBadge status={r.status} /> },
        { label: 'Administered At', render: (r) => r.administeredAt },
      ]} />

      {/* Lab Tests */}
      <SummaryTable title="Lab Tests" rows={labTests} columns={[
        { label: 'Test',         render: (r) => r.name },
        { label: 'Date Ordered', render: (r) => formatDate(r.dateOrdered) },
        { label: 'Result',       render: (r) => r.result ?? '—' },
      ]} />

      {/* Referrals */}
      <SummaryTable title="Referrals" rows={referrals} columns={[
        { label: 'Date',   render: (r) => formatDate(r.date) },
        { label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]} />

      {/* Admissions */}
      <SummaryTable title="Hospital Admissions" rows={admissions} columns={[
        { label: 'Date',   render: (r) => formatDate(r.date) },
        { label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]} />
    </div>
  );
};

function SummaryTable<T>({
  title, rows, columns,
}: {
  title: string;
  rows: T[];
  columns: { label: string; render: (r: T) => React.ReactNode }[];
}) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        {!rows.length ? (
          <p className="text-body-md text-text-muted text-center py-4">No records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="border-b border-border-base">
                <tr>{columns.map((c) => <th key={c.label} className="pb-2 pr-4 text-left text-on-surface-variant font-semibold">{c.label}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {rows.map((r, i) => (
                  <tr key={i}>
                    {columns.map((c) => <td key={c.label} className="py-2 pr-4 text-on-surface">{c.render(r)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
