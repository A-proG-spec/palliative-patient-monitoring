import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { useFamilyAssessment } from '@/hooks/useFamilyAssessments';
import { useAuthStore } from '@/store/auth.store';
import { AssessmentDetailShell } from '@/components/assessments/AssessmentDetailShell';
import {
  DetailSectionRenderer,
  type DetailSectionDef,
} from '@/components/assessments/AssessmentDetailFields';

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
  const { user } = useAuthStore();
  const isAdmin = user?.type === 'admin';
  const isOwner = user?.role === 'SocialWorker';
  const canManage = isAdmin || isOwner;

  const { data: patient } = usePatient(id!);
  const { data: a, isLoading, error, refetch } = useFamilyAssessment(id!, assessmentId!);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentDetailShell
      title="Family Assessment"
      patientLabel={patientLabel}
      createdAt={a?.createdAt ?? ''}
      createdByName={a?.createdByStaff?.name ?? null}
      isDeleted={!!a?.deletedAt}
      isAdmin={isAdmin}
      backTo={`/patients/${id}/family-assessment`}
      isLoading={isLoading}
      isError={!!error}
      onRetry={refetch}
      onPrint={() => window.print()}
      onEdit={canManage ? () => navigate(`/patients/${id}/family-assessment/${assessmentId}/edit`) : undefined}
    >
      {a &&
        SECTIONS.map((s) => (
          <DetailSectionRenderer key={s.title} section={s} data={a as any} />
        ))}
    </AssessmentDetailShell>
  );
};

export default FamilyAssessmentDetailPage;