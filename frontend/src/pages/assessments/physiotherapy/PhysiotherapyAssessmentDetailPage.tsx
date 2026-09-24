import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { usePhysiotherapyAssessment } from '@/hooks/usePhysiotherapyAssessments';
import { useAuthStore } from '@/store/auth.store';
import { AssessmentDetailShell } from '@/components/assessments/AssessmentDetailShell';
import {
  DetailSectionRenderer,
  type DetailSectionDef,
} from '@/components/assessments/AssessmentDetailFields';

const SECTIONS: DetailSectionDef[] = [
  {
    title: 'Medical Overview',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Comorbidities', key: 'comorbidities', kind: 'chips' },
      { label: 'Other Comorbidity', key: 'comorbidityOther' },
      { label: 'General Condition', key: 'generalCondition' },
    ],
  },
  {
    title: 'Pain & Symptoms',
    fields: [
      { label: 'Pain Level', key: 'painLevel' },
      { label: 'Pain Types', key: 'painTypes', kind: 'chips' },
      { label: 'Other Pain Type', key: 'painTypeOther' },
      { label: 'Symptoms', key: 'symptoms', kind: 'chips' },
    ],
  },
  {
    title: 'Functional Mobility',
    fields: [
      { label: 'Mobility Status', key: 'mobilityStatus' },
      { label: 'Transfer Ability', key: 'transferAbility' },
      { label: 'Walking Ability', key: 'walkingAbility' },
      { label: 'Assistive Devices', key: 'assistiveDevices', kind: 'chips' },
      { label: 'Other Device', key: 'assistiveDeviceOther' },
    ],
  },
  {
    title: 'Musculoskeletal',
    fields: [
      { label: 'Upper Limb Strength', key: 'upperLimbStrength' },
      { label: 'Lower Limb Strength', key: 'lowerLimbStrength' },
      { label: 'Range of Motion', key: 'rangeOfMotion' },
      { label: 'Joint Pain / Stiffness', key: 'jointPainOrStiffness' },
      { label: 'Joint Pain Location', key: 'jointPainLocation' },
    ],
  },
  {
    title: 'Neurological',
    fields: [
      { label: 'Consciousness', key: 'consciousness' },
      { label: 'Coordination', key: 'coordination' },
      { label: 'Sensory Deficit', key: 'sensoryDeficit' },
      { label: 'Balance', key: 'balance' },
    ],
  },
  {
    title: 'Respiratory',
    fields: [
      { label: 'Breathing Pattern', key: 'breathingPattern' },
      { label: 'Breathlessness', key: 'breathlessnessLevel' },
      { label: 'Chest Expansion', key: 'chestExpansion' },
      { label: 'Respiratory Needs', key: 'respiratoryNeeds', kind: 'chips' },
    ],
  },
  {
    title: 'Pressure Injury Risk',
    fields: [
      { label: 'Pressure Risk', key: 'pressureRisk' },
      { label: 'Pressure Areas', key: 'pressureAreas', kind: 'chips' },
      { label: 'Other Area', key: 'pressureAreaOther' },
      { label: 'Preventions', key: 'pressurePreventions', kind: 'chips' },
    ],
  },
  {
    title: 'Fall Risk',
    fields: [
      { label: 'Fall History', key: 'fallHistory', kind: 'boolean' },
      { label: 'Fall Risk Level', key: 'fallRiskLevel' },
      { label: 'Contributors', key: 'fallContributors', kind: 'chips' },
    ],
  },
  {
    title: 'Diagnosis & Care Plan',
    fields: [
      { label: 'Diagnoses', key: 'diagnosis', kind: 'chips' },
      { label: 'Goals', key: 'goals' },
      { label: 'Interventions', key: 'interventions', kind: 'chips' },
      { label: 'Frequency', key: 'frequency', kind: 'chips' },
      { label: 'Equipment', key: 'equipment', kind: 'chips' },
      { label: 'Caregiver Training', key: 'caregiverTrainings', kind: 'chips' },
    ],
  },
  {
    title: 'Summary',
    fields: [
      { label: 'Outcome', key: 'outcome', kind: 'chips' },
      { label: 'Final Recommendations', key: 'finalRecommendations', kind: 'chips' },
    ],
  },
];

const PhysiotherapyAssessmentDetailPage: React.FC = () => {
  const { id, assessmentId } = useParams<{ id: string; assessmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.type === 'admin';
  const isOwner = user?.role === 'Physiologist';
  const canManage = isAdmin || isOwner;

  const { data: patient } = usePatient(id!);
  const { data: a, isLoading, error, refetch } = usePhysiotherapyAssessment(id!, assessmentId!);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  return (
    <AssessmentDetailShell
      title="Physiotherapy Assessment"
      patientLabel={patientLabel}
      createdAt={a?.createdAt ?? ''}
      createdByName={a?.createdByStaff?.name ?? null}
      isDeleted={!!a?.deletedAt}
      isAdmin={isAdmin}
      backTo={`/patients/${id}/physiotherapy-assessment`}
      isLoading={isLoading}
      isError={!!error}
      onRetry={refetch}
      onPrint={() => window.print()}
      onEdit={canManage ? () => navigate(`/patients/${id}/physiotherapy-assessment/${assessmentId}/edit`) : undefined}
    >
      {a &&
        SECTIONS.map((s) => (
          <DetailSectionRenderer key={s.title} section={s} data={a as any} />
        ))}
    </AssessmentDetailShell>
  );
};

export default PhysiotherapyAssessmentDetailPage;