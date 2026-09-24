import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { useSpiritualAssessment } from '@/hooks/useSpiritualAssessments';
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
  const { user } = useAuthStore();
  const isAdmin = user?.type === 'admin';
  const isOwner = user?.role === 'SpiritualPerson';
  const canManage = isAdmin || isOwner;

  const { data: patient } = usePatient(id!);
  const { data: a, isLoading, error, refetch } = useSpiritualAssessment(id!, assessmentId!);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentDetailShell
      title="Spiritual Assessment"
      patientLabel={patientLabel}
      createdAt={a?.createdAt ?? ''}
      createdByName={a?.createdByStaff?.name ?? null}
      isDeleted={!!a?.deletedAt}
      isAdmin={isAdmin}
      backTo={`/patients/${id}/spiritual-assessment`}
      isLoading={isLoading}
      isError={!!error}
      onRetry={refetch}
      onPrint={() => window.print()}
      onEdit={canManage ? () => navigate(`/patients/${id}/spiritual-assessment/${assessmentId}/edit`) : undefined}
    >
      {a &&
        SECTIONS.map((s) => (
          <DetailSectionRenderer key={s.title} section={s} data={a as any} />
        ))}
    </AssessmentDetailShell>
  );
};

export default SpiritualAssessmentDetailPage;