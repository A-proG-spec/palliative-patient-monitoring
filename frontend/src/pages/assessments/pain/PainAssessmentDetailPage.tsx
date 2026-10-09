import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import {
  usePainAssessment,
  useDeletePainAssessment,
} from '@/hooks/usePainAssessments';
import { useAuthStore } from '@/store/auth.store';
import { AssessmentDetailShell } from '@/components/assessments/AssessmentDetailShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const Row: React.FC<{ label: string; value?: string | number | null }> = ({
  label,
  value,
}) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-border-base last:border-0">
      <span className="text-text-muted text-sm min-w-[180px] flex-shrink-0">
        {label}:
      </span>
      <span className="text-on-surface text-sm">{value}</span>
    </div>
  );
};

const ChipList: React.FC<{ label: string; values: string[] }> = ({
  label,
  values,
}) => {
  if (!values || values.length === 0) return null;
  return (
    <div className="py-2">
      <p className="text-text-muted text-xs mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="inline-block rounded-full bg-surface-low border border-border-base px-2.5 py-0.5 text-xs text-on-surface"
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
};

const PainAssessmentDetailPage: React.FC = () => {
  const { id, assessmentId } = useParams<{
    id: string;
    assessmentId: string;
  }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.type === 'admin';

  // ── Route-aware base path ──
  const isAdminRoute = pathname.startsWith('/admin/');
  const basePath = isAdminRoute
    ? `/admin/patients/${id}`
    : `/patients/${id}`;

  const canManage = isAdmin;

  const { data: patient } = usePatient(id!);
  const { data: a, isLoading, error, refetch } = usePainAssessment(
    id!,
    assessmentId!,
  );
  const deleteMutation = useDeletePainAssessment(id!);

  const [showDelete, setShowDelete] = useState(false);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${
        patient.patientDisplayId ?? patient.id
      }`
    : '—';

  const handleDelete = (reason?: string) => {
    deleteMutation.mutate(
      { assessmentId: assessmentId!, reason },
      {
        onSuccess: () => navigate(`${basePath}/pain`),
        onError: () => {
          // Stay on the page so the user can retry.
          setShowDelete(false);
        },
      },
    );
    setShowDelete(false);
  };

  return (
    <>
      <AssessmentDetailShell
        title="Pain Assessment"
        patientLabel={patientLabel}
        createdAt={a?.createdAt ?? ''}
        createdByName={a?.createdByStaff?.name ?? null}
        isDeleted={!!a?.deletedAt}
        isAdmin={isAdmin}
        backTo={`${basePath}/pain`}
        isLoading={isLoading}
        isError={!!error}
        onRetry={refetch}
        onEdit={
          canManage
            ? () => navigate(`${basePath}/pain/${assessmentId}/edit`)
            : undefined
        }
        onDelete={canManage ? () => setShowDelete(true) : undefined}
        onPrint={() => window.print()}
      >
        {a && (
          <>
            <Card padding="lg">
              <CardHeader>
                <CardTitle className="text-sm">Assessment Overview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <Row label="Assessment Type" value={a.assessmentType} />
                <Row label="Onset" value={a.painOnset ?? '—'} />
                <Row label="Duration" value={a.painDuration ?? '—'} />
                <Row
                  label="Current Pain Score"
                  value={
                    a.currentPainScore != null
                      ? `${a.currentPainScore}/10`
                      : undefined
                  }
                />
                <Row
                  label="Worst (24h)"
                  value={
                    a.worstPainLast24h != null
                      ? `${a.worstPainLast24h}/10`
                      : undefined
                  }
                />
                <Row
                  label="Least (24h)"
                  value={
                    a.leastPainLast24h != null
                      ? `${a.leastPainLast24h}/10`
                      : undefined
                  }
                />
                <Row label="Opioid Use" value={a.opioidUse ?? '—'} />
                <Row
                  label="Breakthrough Frequency"
                  value={a.breakthroughFrequency ?? '—'}
                />
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <CardTitle className="text-sm">Pain Characteristics</CardTitle>
              </CardHeader>
              <CardContent>
                <ChipList label="Locations" values={a.painLocations ?? []} />
                <ChipList
                  label="Descriptions"
                  values={a.painDescriptions ?? []}
                />
                <ChipList label="Types" values={a.painType ?? []} />
                <ChipList label="Patterns" values={a.painPattern ?? []} />
                <ChipList
                  label="Aggravating Factors"
                  values={a.aggravatingFactors ?? []}
                />
                <ChipList
                  label="Relieving Factors"
                  values={a.relievingFactors ?? []}
                />
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <CardTitle className="text-sm">Clinical Assessment</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <ChipList label="Diagnosis" values={a.diagnosis ?? []} />
                <Row label="Management Goals" value={a.managementGoals} />
                <ChipList
                  label="Interventions"
                  values={a.interventions ?? []}
                />
                <ChipList
                  label="Non-Pharmacological Methods"
                  values={a.nonPharmacologicalMethods ?? []}
                />
                <ChipList
                  label="Monitoring Plan"
                  values={a.monitoringPlan ?? []}
                />
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <CardTitle className="text-sm">Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <ChipList
                  label="Assessment Outcome"
                  values={a.assessmentOutcome ?? []}
                />
                <ChipList
                  label="Final Recommendations"
                  values={a.finalRecommendations ?? []}
                />
              </CardContent>
            </Card>
          </>
        )}
      </AssessmentDetailShell>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
            <h2 className="text-lg font-semibold text-on-surface mb-2">
              Delete this pain assessment?
            </h2>
            <p className="text-sm text-text-secondary mb-5">
              The assessment will be soft-deleted and can be restored later.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl border border-border-base bg-surface-lowest px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-low transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete()}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-error px-4 py-2.5 text-sm font-medium text-white hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PainAssessmentDetailPage;