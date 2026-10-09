import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import {
  useFamilyAssessment,
  useDeleteFamilyAssessment,
} from '@/hooks/useFamilyAssessments';
import { useAuthStore } from '@/store/auth.store';
import { AssessmentDetailShell } from '@/components/assessments/AssessmentDetailShell';
import {
  DetailSectionRenderer,
  type DetailSectionDef,
} from '@/components/assessments/AssessmentDetailFields';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { patientPath } from '@/lib/clinicalPaths';

// ── Display helper — mirrors the backend's patientDisplayId() ──
const displayId = (p: {
  id: number | string;
  hospitalPatientId?: string | null;
}): string =>
  p.hospitalPatientId ?? `PAT-${String(p.id).padStart(4, '0')}`;

const SECTIONS: DetailSectionDef[] = [
  {
    title: 'Family Composition',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Household Size', key: 'householdSize' },
      { label: 'Primary Decision Maker', key: 'primaryDecisionMaker' },
      { label: 'Decision Maker Name', key: 'primaryDecisionMakerName' },
    ],
  },
  {
    title: 'Primary Caregiver',
    fields: [
      { label: 'Name', key: 'primaryCaregiverName' },
      { label: 'Relationship', key: 'primaryCaregiverRelationship' },
      { label: 'Age', key: 'primaryCaregiverAge' },
      { label: 'Phone', key: 'primaryCaregiverPhone' },
    ],
  },
  {
    title: 'Secondary Caregiver',
    fields: [
      { label: 'Name', key: 'secondaryCaregiverName' },
      { label: 'Relationship', key: 'secondaryCaregiverRelationship' },
      { label: 'Phone', key: 'secondaryCaregiverPhone' },
    ],
  },
  {
    title: 'Caregiver Capacity',
    fields: [
      { label: 'Availability', key: 'caregiverAvailability' },
      { label: 'Physical Ability', key: 'physicalAbility' },
      { label: 'Emotional Readiness', key: 'emotionalReadiness' },
      { label: 'Knowledge of Illness', key: 'knowledgeOfIllness' },
    ],
  },
  {
    title: 'Support System',
    fields: [
      { label: 'Internal Support', key: 'internalSupport' },
      { label: 'External Support', key: 'externalSupport', kind: 'chips' },
      { label: 'Isolation Risk', key: 'socialIsolationRisk' },
    ],
  },
  {
    title: 'Financial Status',
    fields: [
      { label: 'Income Sources', key: 'incomeSources', kind: 'chips' },
      { label: 'Income Level', key: 'monthlyIncomeLevel' },
      { label: 'Financial Burden', key: 'financialBurden' },
      { label: 'Challenges', key: 'financialChallenges', kind: 'chips' },
    ],
  },
  {
    title: 'Living Conditions',
    fields: [
      { label: 'Housing Type', key: 'housingType' },
      { label: 'Other Housing Type', key: 'housingTypeOther' },
      { label: 'Home Environment', key: 'homeEnvironment' },
    ],
  },
  {
    title: 'Coping & Psychosocial',
    fields: [
      { label: 'Coping Ability', key: 'copingAbility' },
      { label: 'Family Emotional Status', key: 'familyEmotionalStatus' },
      { label: 'Anticipatory Grief', key: 'anticipatoryGrief' },
    ],
  },
  {
    title: 'Cultural & Religious',
    fields: [
      { label: 'Religious Affiliation', key: 'religiousAffiliation' },
      { label: 'Palliative Care Acceptance', key: 'palliativeCareAcceptance' },
      { label: 'Cultural Beliefs Affecting Care', key: 'culturalBeliefsAffectingCare' },
    ],
  },
  {
    title: 'Caregiver Burden',
    fields: [
      { label: 'Burden Level', key: 'burdenLevel' },
      { label: 'Burden Factors', key: 'burdenFactors', kind: 'chips' },
    ],
  },
  {
    title: 'Needs & Strengths',
    fields: [
      { label: 'Identified Needs', key: 'needs', kind: 'chips' },
      { label: 'Family Strengths', key: 'strengths', kind: 'chips' },
    ],
  },
  {
    title: 'Care Plan',
    fields: [
      { label: 'Planned Interventions', key: 'plannedInterventions' },
      { label: 'Support Services', key: 'supportServices', kind: 'chips' },
      { label: 'Follow-Up Plan', key: 'followUpPlan' },
    ],
  },
  {
    title: 'Summary',
    fields: [
      { label: 'Assessor', key: 'assessorName' },
      { label: 'Outcome', key: 'assessmentOutcome', kind: 'chips' },
      { label: 'Final Recommendations', key: 'finalRecommendations', kind: 'chips' },
    ],
  },
];

const FamilyAssessmentDetailPage: React.FC = () => {
  const { id, assessmentId } = useParams<{ id: string; assessmentId: string }>();
  const navigate = useNavigate();

  // ── Subscribe to only `user`, not the whole store ──
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.type === 'admin';

  // ── Edit / Delete are admin-only. Backend enforces
  //    roleMiddleware(['admin']) on PATCH/DELETE for family assessments;
  //    non-admins get 403. ──
  const canManage = isAdmin;

  const { data: patient } = usePatient(id!);
  const { data: a, isLoading, error, refetch } = useFamilyAssessment(
    id!,
    assessmentId!,
  );
  const deleteMutation = useDeleteFamilyAssessment(id!);

  const [showDelete, setShowDelete] = useState(false);

  const basePath = patientPath(isAdmin, id!);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${displayId(patient)}`
    : '—';

  const handleDelete = (reason?: string) => {
    deleteMutation.mutate(
      { assessmentId: assessmentId!, reason },
      {
        onSuccess: () => navigate(`${basePath}/family-assessment`),
        onError: () => {
          // Stay on the page so the user can retry.
          setShowDelete(false);
        },
      },
    );
    setShowDelete(false);
  };

  // ── Early returns so the shell never renders without data ──
  if (isLoading) return <PageLoader />;
  if (error || !a) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <AssessmentDetailShell
        title="Family Assessment"
        patientLabel={patientLabel}
        createdAt={a.createdAt}
        createdByName={
          // DTO shape first, then raw relation, then free-text
          (a as any)?.enteredBy?.name ??
          (a as any)?.createdByStaff?.name ??
          a?.assessorName ??
          null
        }
        isDeleted={!!a.deletedAt}
        isAdmin={isAdmin}
        backTo={`${basePath}/family-assessment`}
        isLoading={false}
        isError={false}
        onRetry={refetch}
        onPrint={() => window.print()}
        onEdit={
          canManage && !a.deletedAt
            ? () =>
                navigate(`${basePath}/family-assessment/${assessmentId}/edit`)
            : undefined
        }
        onDelete={
          canManage && !a.deletedAt ? () => setShowDelete(true) : undefined
        }
      >
        {SECTIONS.map((s) => (
          <DetailSectionRenderer key={s.title} section={s} data={a as any} />
        ))}
      </AssessmentDetailShell>

      {/* ── Delete confirmation modal ── */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
            <h2 className="text-lg font-semibold text-on-surface mb-2">
              Delete this family assessment?
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

export default FamilyAssessmentDetailPage;