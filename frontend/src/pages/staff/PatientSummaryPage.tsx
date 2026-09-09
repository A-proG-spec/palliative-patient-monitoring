import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { usePatientSummary } from '@/hooks/usePatients';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { DISEASE_STAGE_LABELS } from '@/constants';

const PatientSummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: summary, isLoading, error, refetch } = usePatientSummary(id!);

  if (isLoading) return <PageLoader />;
  if (error || !summary) return <ErrorState onRetry={refetch} />;

  const { patient, diagnosis, visits, medications, labTests, referrals, admissions } = summary;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton to={`/patients/${id}`} label="Patient" />
          <div>
            <h1 className="text-xl font-bold text-on-surface">
              Patient Summary: {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-xs text-text-muted font-mono">{patient.patientDisplayId}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" leftIcon={<BarChart2 size={14} />} onClick={() => navigate(`/patients/${id}/progress`)}>
          Progress Graph
        </Button>
      </div>

      {/* Patient info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card padding="md">
          <CardHeader><CardTitle className="text-sm">Patient</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1.5">
            <Row label="Name" value={`${patient.firstName} ${patient.lastName}`} />
            <Row label="Age" value={`${patient.age} yrs`} />
            <Row label="Sex" value={patient.sex} />
            <div className="flex gap-2 pt-1">
              <StatusBadge status={patient.status} type="patient" />
              <StatusBadge status={patient.currentLocation} />
            </div>
          </CardContent>
        </Card>

        <Card padding="md">
          <CardHeader><CardTitle className="text-sm">Diagnosis</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1.5">
            <Row label="Primary" value={diagnosis.primary} />
            {diagnosis.secondary?.length > 0 && <Row label="Secondary" value={diagnosis.secondary.join(', ')} />}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-text-muted text-xs">Stage:</span>
              <Badge variant="secondary">{DISEASE_STAGE_LABELS[diagnosis.stage] ?? diagnosis.stage}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <SummaryTable title={`Visits (${visits.length})`} headers={['Date', 'Outcome', 'Staff']} rows={visits.map((v) => [formatDate(v.date), v.outcome, v.staff.name])} />
      <SummaryTable title={`Medications (${medications.length})`} headers={['Name', 'Dosage', 'Status', 'Given At']} rows={medications.map((m) => [m.name, m.dosage, m.status, m.administeredAt])} />
      <SummaryTable title={`Lab Tests (${labTests.length})`} headers={['Test', 'Date Ordered', 'Result']} rows={labTests.map((l) => [l.name, formatDate(l.dateOrdered), l.result || '—'])} />
      <SummaryTable title={`Referrals (${referrals.length})`} headers={['Date', 'Status']} rows={referrals.map((r) => [formatDate(r.date), r.status])} />
      <SummaryTable title={`Admissions (${admissions.length})`} headers={['Date', 'Status']} rows={admissions.map((a) => [formatDate(a.date), a.status])} />
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div><span className="text-text-muted">{label}: </span><span className="text-on-surface">{value}</span></div>
);

const SummaryTable: React.FC<{ title: string; headers: string[]; rows: string[][] }> = ({ title, headers, rows }) => (
  <Card padding="none">
    <div className="px-5 py-3.5 border-b border-border-base">
      <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
    </div>
    {rows.length === 0 ? (
      <p className="px-5 py-4 text-sm text-text-muted">No records</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-low"><tr>{headers.map((h) => <th key={h} className="px-5 py-2.5 text-left text-xs font-medium text-text-muted">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border-base">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-surface-low/50">
                {row.map((cell, j) => <td key={j} className="px-5 py-3 text-on-surface">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

export default PatientSummaryPage;
