import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import {
  usePsychiatryAssessment,
  useDeletePsychiatryAssessment,
} from '@/hooks/usePsychiatryAssessments';
import { useAuthStore } from '@/store/auth.store';
import { AssessmentDetailShell } from '@/components/assessments/AssessmentDetailShell';
import {
  DetailSectionRenderer,
  type DetailSectionDef,
} from '@/components/assessments/AssessmentDetailFields';

const SECTIONS: DetailSectionDef[] = [
  {
    title: 'Presenting Problem',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Reason for Referral', key: 'reasonForReferral' },
      { label: 'Current Symptoms', key: 'currentSymptoms', kind: 'chips' },
      { label: 'Other Symptom', key: 'symptomOther' },
      { label: 'Onset & Duration', key: 'onsetAndDuration' },
      { label: 'Severity', key: 'severity' },
    ],
  },
  {
    title: 'Mental State Examination',
    fields: [
      { label: 'Appearance & Behavior', key: 'appearanceBehavior', kind: 'chips' },
      { label: 'Speech', key: 'speech' },
      { label: 'Mood', key: 'mood' },
      { label: 'Affect', key: 'affect' },
      { label: 'Thought Process', key: 'thoughtProcess', kind: 'chips' },
      { label: 'Thought Content', key: 'thoughtContent', kind: 'chips' },
      { label: 'Perception', key: 'perception', kind: 'chips' },
      { label: 'Cognition', key: 'cognition', kind: 'chips' },
      { label: 'Insight & Judgment', key: 'insightJudgment' },
    ],
  },
  {
    title: 'Suicide Risk',
    fields: [
      { label: 'Suicidal Ideation', key: 'suicidalIdeation' },
      { label: 'Suicide Risk Level', key: 'suicideRiskLevel' },
      { label: 'Protective Factors', key: 'protectiveFactors', kind: 'chips' },
    ],
  },
  {
    title: 'Organic Causes',
    fields: [
      { label: 'Organic Causes', key: 'organicCauses', kind: 'chips' },
      { label: 'Medications Affecting State', key: 'medicationsAffectingMentalState' },
    ],
  },
  {
    title: 'Sleep, Appetite & Function',
    fields: [
      { label: 'Sleep Pattern', key: 'sleepPattern' },
      { label: 'Appetite', key: 'appetite' },
      { label: 'Daily Functioning', key: 'dailyFunctioning' },
      { label: 'Social Withdrawal', key: 'socialWithdrawal' },
    ],
  },
  {
    title: 'Diagnosis',
    fields: [
      { label: 'Diagnoses', key: 'diagnoses', kind: 'chips' },
      { label: 'Other Diagnosis', key: 'diagnosisOther' },
    ],
  },
  {
    title: 'Psychiatric Care Plan',
    fields: [
      { label: 'Immediate Interventions', key: 'immediateInterventions', kind: 'chips' },
      { label: 'Pharmacological Plan', key: 'pharmacologicalPlan', kind: 'chips' },
      { label: 'Non-Pharmacological Plan', key: 'nonPharmacologicalPlan', kind: 'chips' },
      { label: 'Monitoring Plan', key: 'monitoringPlan', kind: 'chips' },
    ],
  },
  {
    title: 'Family & Caregiver',
    fields: [
      { label: 'Family Distress Level', key: 'familyDistressLevel' },
      { label: 'Caregiver Burnout', key: 'caregiverBurnout', kind: 'boolean' },
      { label: 'Family Counseling Needed', key: 'familyCounselingNeeded', kind: 'boolean' },
    ],
  },
  {
    title: 'Summary & Recommendations',
    fields: [
      { label: 'Assessment Outcome', key: 'assessmentOutcome', kind: 'chips' },
      { label: 'Final Recommendations', key: 'finalRecommendations', kind: 'chips' },
    ],
  },
];

const PsychiatryAssessmentDetailPage: React.FC = () => {
  const { id, assessmentId } = useParams<{ id: string; assessmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.type === 'admin';
  const isOwner =
    user?.role === 'Psychiatrist' || user?.role === 'Psychologist';
  const canManage = isAdmin || isOwner;

  const { data: patient } = usePatient(id!);
  const { data: a, isLoading, error, refetch } = usePsychiatryAssessment(id!, assessmentId!);
  const deleteMutation = useDeletePsychiatryAssessment(id!);
  const [showDelete, setShowDelete] = useState(false);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  const handleDelete = (reason?: string) => {
    deleteMutation.mutate(
      { assessmentId: assessmentId!, reason },
      { onSuccess: () => navigate(`/patients/${id}/psychiatry-assessment`) },
    );
    setShowDelete(false);
  };

  return (
    <AssessmentDetailShell
      title="Psychiatry Assessment"
      patientLabel={patientLabel}
      createdAt={a?.createdAt ?? ''}
      createdByName={a?.createdByStaff?.name ?? null}
      isDeleted={!!a?.deletedAt}
      isAdmin={isAdmin}
      backTo={`/patients/${id}/psychiatry-assessment`}
      isLoading={isLoading}
      isError={!!error}
      onRetry={refetch}
      onPrint={() => window.print()}
      onEdit={canManage ? () => navigate(`/patients/${id}/psychiatry-assessment/${assessmentId}/edit`) : undefined}
      onDelete={canManage ? () => setShowDelete(true) : undefined}
    >
      {a &&
        SECTIONS.map((s) => (
          <DetailSectionRenderer key={s.title} section={s} data={a as any} />
        ))}
    </AssessmentDetailShell>
  );
};

export default PsychiatryAssessmentDetailPage;