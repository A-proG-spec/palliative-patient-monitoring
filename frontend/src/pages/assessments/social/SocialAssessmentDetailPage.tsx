import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { useSocialAssessment } from '@/hooks/useSocialAssessments';
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
      { label: 'Living Arrangement', key: 'livingArrangement' },
      { label: 'Other Living Arrangement', key: 'livingArrangementOther' },
    ],
  },
  {
    title: 'Primary Caregiver',
    fields: [
      { label: 'Availability', key: 'caregiverAvailability' },
      { label: 'Health', key: 'caregiverHealth' },
      { label: 'Understanding', key: 'caregiverUnderstanding' },
      { label: 'Stress', key: 'caregiverStress' },
    ],
  },
  {
    title: 'Social Support',
    fields: [
      { label: 'Family Support', key: 'familySupport' },
      { label: 'Community Support', key: 'communitySupport', kind: 'chips' },
      { label: 'Contact Frequency', key: 'contactFrequency' },
      { label: 'Isolation Risk', key: 'isolationRisk' },
    ],
  },
  {
    title: 'Financial',
    fields: [
      { label: 'Income Sources', key: 'incomeSources', kind: 'chips' },
      { label: 'Other Income Source', key: 'incomeSourceOther' },
      { label: 'Monthly Income', key: 'monthlyHouseholdIncome' },
      { label: 'Financial Risk', key: 'financialRiskLevel' },
      { label: 'Challenges', key: 'financialChallenges', kind: 'chips' },
      { label: 'Other Challenge', key: 'financialChallengeOther' },
    ],
  },
  {
    title: 'Housing & Environment',
    fields: [
      { label: 'Residence Type', key: 'residenceType' },
      { label: 'Other Residence Type', key: 'residenceTypeOther' },
      { label: 'Home Environment', key: 'homeEnvironment' },
      { label: 'Home-Based Care Suitability', key: 'homeBasedCareSuitability' },
    ],
  },
  {
    title: 'Transportation',
    fields: [
      { label: 'Transport Access', key: 'transportAccess', kind: 'chips' },
      { label: 'Distance to Facility (km)', key: 'distanceToHealthFacilityKm' },
      { label: 'Challenges', key: 'transportChallenges', kind: 'chips' },
      { label: 'Other Challenge', key: 'transportChallengeOther' },
    ],
  },
  {
    title: 'Employment & Education',
    fields: [
      { label: 'Employment Status', key: 'employmentStatus' },
      { label: 'Education Level', key: 'educationLevel' },
    ],
  },
  {
    title: 'Cultural & Spiritual',
    fields: [
      { label: 'Religious Affiliation', key: 'religiousAffiliation' },
      { label: 'Other Affiliation', key: 'religiousAffiliationOther' },
      { label: 'Spiritual Support Available', key: 'spiritualSupportAvailable', kind: 'boolean' },
      { label: 'Cultural Factors', key: 'culturalFactorsAffectingCare' },
    ],
  },
  {
    title: 'Legal & Advocacy',
    fields: [
      { label: 'Has Legal Representative', key: 'hasLegalRepresentative', kind: 'boolean' },
      { label: 'Advance Directives', key: 'advanceDirectivesAvailable', kind: 'boolean' },
      { label: 'Legal Concerns', key: 'legalConcerns', kind: 'chips' },
      { label: 'Other Concern', key: 'legalConcernOther' },
    ],
  },
  {
    title: 'Bereavement Risk',
    fields: [
      { label: 'Family Prepared', key: 'familyPreparedForPrognosis' },
      { label: 'Anticipatory Grief', key: 'anticipatoryGrief' },
      { label: 'Bereavement Risk', key: 'bereavementRisk' },
      { label: 'Family Requires Support', key: 'familyRequiresSupport', kind: 'boolean' },
    ],
  },
  {
    title: 'Social Work Assessment',
    fields: [
      { label: 'Major Issues', key: 'majorSocialIssues', kind: 'chips' },
      { label: 'Other Issue', key: 'majorSocialIssueOther' },
      { label: 'Strengths & Resources', key: 'strengthsAndResources' },
      { label: 'Areas Requiring Intervention', key: 'areasRequiringIntervention' },
    ],
  },
  {
    title: 'Care Plan & Summary',
    fields: [
      { label: 'Planned Interventions', key: 'plannedInterventions', kind: 'chips' },
      { label: 'Other Intervention', key: 'plannedInterventionOther' },
      { label: 'Follow-Up Plan', key: 'followUpPlan' },
      { label: 'Outcome', key: 'assessmentOutcome', kind: 'chips' },
    ],
  },
];

const SocialAssessmentDetailPage: React.FC = () => {
  const { id, assessmentId } = useParams<{ id: string; assessmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.type === 'admin';
  const isOwner = user?.role === 'SocialWorker';
  const canManage = isAdmin || isOwner;

  const { data: patient } = usePatient(id!);
  const { data: a, isLoading, error, refetch } = useSocialAssessment(id!, assessmentId!);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentDetailShell
      title="Social Assessment"
      patientLabel={patientLabel}
      createdAt={a?.createdAt ?? ''}
      createdByName={a?.createdByStaff?.name ?? null}
      isDeleted={!!a?.deletedAt}
      isAdmin={isAdmin}
      backTo={`/patients/${id}/social-assessment`}
      isLoading={isLoading}
      isError={!!error}
      onRetry={refetch}
      onPrint={() => window.print()}
      onEdit={canManage ? () => navigate(`/patients/${id}/social-assessment/${assessmentId}/edit`) : undefined}
    >
      {a &&
        SECTIONS.map((s) => (
          <DetailSectionRenderer key={s.title} section={s} data={a as any} />
        ))}
    </AssessmentDetailShell>
  );
};

export default SocialAssessmentDetailPage;