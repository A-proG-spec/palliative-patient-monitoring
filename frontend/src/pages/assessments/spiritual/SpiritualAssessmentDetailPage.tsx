import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import {
  useSpiritualAssessment,
  useDeleteSpiritualAssessment,
} from '@/hooks/useSpiritualAssessments';
import { useAuthStore } from '@/store/auth.store';
import { AssessmentDetailShell } from '@/components/assessments/AssessmentDetailShell';
import {
  DetailSectionRenderer,
  type DetailSectionDef,
} from '@/components/assessments/AssessmentDetailFields';

const SECTIONS: DetailSectionDef[] = [
  {
    title: 'Religious Background',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Religious Affiliation', key: 'religiousAffiliation' },
      { label: 'Other Affiliation', key: 'religiousAffiliationOther' },
      { label: 'Faith Importance', key: 'faithImportance' },
      { label: 'Activity Participation', key: 'activityParticipation' },
      { label: 'Place of Worship', key: 'placeOfWorship' },
    ],
  },
  {
    title: 'Spiritual Support',
    fields: [
      { label: 'Support Sources', key: 'supportSources', kind: 'chips' },
      { label: 'Religious Leader', key: 'religiousLeaderName' },
      { label: 'Organization', key: 'religiousLeaderOrganization' },
      { label: 'Phone', key: 'religiousLeaderPhone' },
    ],
  },
  {
    title: 'Beliefs & Values',
    fields: [
      { label: 'Meaning & Purpose', key: 'lifeMeaningAndPurpose' },
      { label: 'Sources of Strength', key: 'sourcesOfStrength' },
      { label: 'Practices to Continue', key: 'practicesToContinue', kind: 'boolean' },
      { label: 'Practices Details', key: 'practicesToContinueDetails' },
      { label: 'Rituals to Respect', key: 'ritualsToRespect', kind: 'boolean' },
      { label: 'Rituals Details', key: 'ritualsToRespectDetails' },
    ],
  },
  {
    title: 'Distress Assessment',
    fields: [
      { label: 'Distress Level', key: 'spiritualDistressLevel' },
      { label: 'Concerns Description', key: 'spiritualConcernsDescription' },
    ],
  },
  {
    title: 'Hope & Coping',
    fields: [
      { label: 'Current Hopes', key: 'currentHopes' },
      { label: 'Coping Methods', key: 'copingMethods', kind: 'chips' },
      { label: 'Other Method', key: 'copingMethodOther' },
      { label: 'Feels at Peace', key: 'feelsAtPeace' },
    ],
  },
  {
    title: 'Family & Spiritual',
    fields: [
      { label: 'Family Shares Beliefs', key: 'familySharesBeliefs' },
      { label: 'Family Benefits', key: 'familyBenefitFromSupport', kind: 'boolean' },
      { label: 'Family Concerns', key: 'familySpiritualConcerns' },
    ],
  },
  {
    title: 'End-of-Life Preferences',
    fields: [
      { label: 'Preferred End-of-Life Care', key: 'preferredEndOfLifeCare', kind: 'chips' },
      { label: 'Other Preference', key: 'preferredEndOfLifeCareOther' },
      { label: 'Preferred Place of Care', key: 'preferredPlaceOfCare' },
      { label: 'Other Care Place', key: 'preferredPlaceOfCareOther' },
      { label: 'Preferred Place of Death', key: 'preferredPlaceOfDeath' },
      { label: 'Religious Practices After Death', key: 'religiousPracticesAfterDeath' },
    ],
  },
  {
    title: 'Strengths & Needs',
    fields: [
      { label: 'Patient Strengths', key: 'patientStrengths', kind: 'chips' },
      { label: 'Other Strength', key: 'patientStrengthOther' },
      { label: 'Additional Strengths', key: 'additionalStrengths' },
      { label: 'Identified Needs', key: 'identifiedNeeds', kind: 'chips' },
      { label: 'Other Need', key: 'identifiedNeedOther' },
    ],
  },
  {
    title: 'Care Plan & Summary',
    fields: [
      { label: 'Planned Interventions', key: 'plannedInterventions' },
      { label: 'Follow-Up Schedule', key: 'followUpSchedule' },
      { label: 'Provider Summary', key: 'summaryOfAssessment' },
      { label: 'Provider Distress Level', key: 'providerDistressLevel' },
      { label: 'Recommended Services', key: 'recommendedServices', kind: 'chips' },
      { label: 'Assessment Outcome', key: 'assessmentOutcome', kind: 'chips' },
    ],
  },
];

const SpiritualAssessmentDetailPage: React.FC = () => {
  const { id, assessmentId } = useParams<{ id: string; assessmentId: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { user } = useAuthStore();
  const isAdmin = user?.type === 'admin';
  const canManage = isAdmin;

  // ── Route-aware base path ──
  const isAdminRoute = pathname.startsWith('/admin/');
  const basePath = isAdminRoute
    ? `/admin/patients/${id}`
    : `/patients/${id}`;

  const { data: patient } = usePatient(id!);
  const { data: a, isLoading, error, refetch } = useSpiritualAssessment(
    id!,
    assessmentId!,
  );
  const deleteMutation = useDeleteSpiritualAssessment(id!);
  const [showDelete, setShowDelete] = useState(false);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  const handleDelete = (reason?: string) => {
    deleteMutation.mutate(
      { assessmentId: assessmentId!, reason },
      {
        onSuccess: () => navigate(`${basePath}/spiritual-assessment`),
        onError: () => setShowDelete(false),
      },
    );
    setShowDelete(false);
  };

  return (
    <>
      <AssessmentDetailShell
        title="Spiritual Assessment"
        patientLabel={patientLabel}
        createdAt={a?.createdAt ?? ''}
        createdByName={a?.createdByStaff?.name ?? null}
        isDeleted={!!a?.deletedAt}
        isAdmin={isAdmin}
        backTo={`${basePath}/spiritual-assessment`}
        isLoading={isLoading}
        isError={!!error}
        onRetry={refetch}
        onPrint={() => window.print()}
        onEdit={
          canManage && !a?.deletedAt
            ? () =>
                navigate(
                  `${basePath}/spiritual-assessment/${assessmentId}/edit`,
                )
            : undefined
        }
        onDelete={
          canManage && !a?.deletedAt ? () => setShowDelete(true) : undefined
        }
      >
        {a &&
          SECTIONS.map((s) => (
            <DetailSectionRenderer key={s.title} section={s} data={a as any} />
          ))}
      </AssessmentDetailShell>

      {/* ── Delete confirmation modal ── */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
            <h2 className="text-lg font-semibold text-on-surface mb-2">
              Delete this spiritual assessment?
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

export default SpiritualAssessmentDetailPage;