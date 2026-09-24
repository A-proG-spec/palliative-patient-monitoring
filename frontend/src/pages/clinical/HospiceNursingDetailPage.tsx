import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { useHospiceAssessment } from '@/hooks/useHospiceNursing';
import { formatDate } from '@/lib/utils';

const Row: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-border-base last:border-0">
      <span className="text-text-muted text-sm min-w-[180px] flex-shrink-0">{label}:</span>
      <span className="text-on-surface text-sm">{value}</span>
    </div>
  );
};

const HospiceNursingDetailPage: React.FC = () => {
  const { id, assessmentId } = useParams<{ id: string; assessmentId: string }>();
  const navigate = useNavigate();
  const { data: a, isLoading, error, refetch } = useHospiceAssessment(id!, assessmentId!);

  if (isLoading) return <PageLoader />;
  if (error || !a) return <ErrorState onRetry={refetch} />;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}/hospice-nursing`} label="Hospice Nursing" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">Hospice Nursing Assessment</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {formatDate(a.assessmentDate)} · Assessed by {a.assessedByStaff?.name ?? '—'}
          </p>
        </div>
      </div>

      <Card padding="lg">
        <CardHeader><CardTitle>General Observation</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <Row label="Level of Consciousness" value={a.levelOfConsciousness} />
          <Row label="Orientation" value={(a.orientation ?? []).join(', ')} />
          <Row label="General Appearance" value={(a.generalAppearance ?? []).join(', ')} />
        </CardContent>
      </Card>

      <Card padding="lg">
        <CardHeader><CardTitle>Vital Signs</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <Row label="Blood Pressure" value={a.bloodPressure} />
          <Row label="Pulse Rate" value={a.pulseRate} />
          <Row label="Respiratory Rate" value={a.respiratoryRate} />
          <Row label="Temperature" value={a.temperature} />
          <Row label="SpO₂" value={a.oxygenSaturation} />
          <Row label="Weight" value={a.weightKg} />
          <Row label="Height" value={a.heightCm} />
        </CardContent>
      </Card>

      <Card padding="lg">
        <CardHeader><CardTitle>Pain</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <Row label="Pain Present" value={a.painPresent ? 'Yes' : 'No'} />
          <Row label="Pain Score" value={a.painScore !== null && a.painScore !== undefined ? `${a.painScore}/10` : undefined} />
          <Row label="Location" value={(a.painLocation ?? []).join(', ')} />
          <Row label="Characteristics" value={(a.painCharacteristics ?? []).join(', ')} />
        </CardContent>
      </Card>

      <Card padding="lg">
        <CardHeader><CardTitle>Nursing Diagnoses</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {(a.nursingDiagnoses ?? []).map((d) => (
              <Badge key={d} variant="secondary">{d}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {a.nurseSummary && (
        <Card padding="lg">
          <CardHeader><CardTitle>Nurse's Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-on-surface whitespace-pre-wrap">{a.nurseSummary}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end pb-6">
        <Button variant="outline" onClick={() => navigate(`/patients/${id}/hospice-nursing`)}>
          Back to List
        </Button>
      </div>
    </div>
  );
};

export default HospiceNursingDetailPage;