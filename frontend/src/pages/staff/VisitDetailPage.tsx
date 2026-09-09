import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVisitDetail } from '@/hooks/useVisits';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate, formatEnumLabel } from '@/lib/utils';
import { VISIT_TYPE_LABELS, OUTCOME_LABELS, PAIN_LOCATION_LABELS, SYMPTOM_LABELS, RED_FLAG_LABELS } from '@/constants';

const VisitDetailPage: React.FC = () => {
  const { id, visitId } = useParams<{ id: string; visitId: string }>();
  const navigate = useNavigate();
  const { data: visit, isLoading, error, refetch } = useVisitDetail(id!, visitId!);

  if (isLoading) return <PageLoader />;
  if (error || !visit) return <ErrorState onRetry={refetch} />;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">Visit Record</h1>
          <p className="text-sm text-text-secondary">{formatDate(visit.visitDate)}</p>
        </div>
        <StatusBadge status={visit.outcome} type="visit" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InfoCard title="Visit Details">
          <Row label="Date" value={formatDate(visit.visitDate)} />
          <Row label="Time" value={`${visit.timeStarted} – ${visit.timeEnded}`} />
          <Row label="Type" value={VISIT_TYPE_LABELS[visit.visitType] || visit.visitType} />
          <Row label="Outcome" value={OUTCOME_LABELS[visit.outcome] || visit.outcome} />
          {visit.nextVisitDate && <Row label="Next Visit" value={formatDate(visit.nextVisitDate)} />}
        </InfoCard>

        <InfoCard title="General Condition">
          <Row label="Overall Status" value={formatEnumLabel(visit.overallStatus)} />
          <Row label="Mobility" value={formatEnumLabel(visit.mobility)} />
          {visit.vitals && (
            <>
              <Row label="Temperature" value={`${visit.vitals.temperature}°C`} />
              <Row label="Pulse" value={`${visit.vitals.pulse} bpm`} />
              <Row label="Blood Pressure" value={visit.vitals.bp} />
              <Row label="Respiration" value={`${visit.vitals.respiration}/min`} />
              <Row label="SpO₂" value={`${visit.vitals.spo2}%`} />
            </>
          )}
        </InfoCard>

        <InfoCard title="Pain Assessment">
          <Row label="Pain Score" value={`${visit.painScore}/10`} />
          <Row label="Locations" value={visit.painLocation.map((l) => PAIN_LOCATION_LABELS[l] || l).join(', ') || '—'} />
          <Row label="Characteristics" value={visit.painCharacteristics.join(', ') || '—'} />
          <Row label="Medication Effective" value={visit.painMedicationEffective ? 'Yes' : 'No'} />
        </InfoCard>

        <InfoCard title="Functional Status">
          <Row label="PPS Score" value={`${visit.ppsScore}%`} />
          <Row label="KPS Score" value={`${visit.kpsScore}/100`} />
          <Row label="Feeding" value={formatEnumLabel(visit.adl.feeding)} />
          <Row label="Bathing" value={formatEnumLabel(visit.adl.bathing)} />
          <Row label="Dressing" value={formatEnumLabel(visit.adl.dressing)} />
          <Row label="Toileting" value={formatEnumLabel(visit.adl.toileting)} />
          <Row label="Mobility" value={formatEnumLabel(visit.adl.mobility)} />
        </InfoCard>
      </div>

      {/* Symptoms */}
      <InfoCard title="Symptoms">
        <div className="flex flex-wrap gap-1.5">
          {visit.symptoms.length ? visit.symptoms.map((s) => (
            <Badge key={s} variant="warning">{SYMPTOM_LABELS[s] || s}</Badge>
          )) : <span className="text-sm text-text-muted">None reported</span>}
        </div>
      </InfoCard>

      {/* Red flags */}
      {visit.redFlags.filter((f) => f !== 'None').length > 0 && (
        <InfoCard title="Red Flags">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {visit.redFlags.filter((f) => f !== 'None').map((f) => (
              <Badge key={f} variant="error">{RED_FLAG_LABELS[f] || f}</Badge>
            ))}
          </div>
          {visit.redFlagActions && <p className="text-sm text-on-surface"><span className="text-text-muted">Action: </span>{visit.redFlagActions}</p>}
        </InfoCard>
      )}

      {/* Team members */}
      <InfoCard title="Team Members">
        <div className="flex flex-wrap gap-2">
          {visit.teamMembers.map((m, i) => (
            <Badge key={i} variant="secondary">{m.role}: {m.name}</Badge>
          ))}
        </div>
      </InfoCard>
    </div>
  );
};

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card padding="md">
    <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
    <CardContent className="space-y-1.5 text-sm">{children}</CardContent>
  </Card>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div><span className="text-text-muted">{label}: </span><span className="text-on-surface">{value}</span></div>
);

export default VisitDetailPage;
