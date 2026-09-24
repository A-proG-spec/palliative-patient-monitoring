import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import {
  usePharmacistAssessment,
  useDeletePharmacistAssessment,
} from '@/hooks/usePharmacistAssessments';
import { useAuthStore } from '@/store/auth.store';
import { AssessmentDetailShell } from '@/components/assessments/AssessmentDetailShell';
import {
  DetailSectionRenderer,
  type DetailSectionDef,
} from '@/components/assessments/AssessmentDetailFields';

const SECTIONS: DetailSectionDef[] = [
  {
    title: 'Header',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Weight (kg)', key: 'weightKg' },
      { label: 'Ward / Unit', key: 'wardUnit' },
      { label: 'Allergies', key: 'allergies' },
    ],
  },
  {
    title: 'Medication History',
    fields: [
      { label: 'OTC / Herbal Used', key: 'otcHerbalUsed', kind: 'boolean' },
      { label: 'OTC / Herbal Details', key: 'otcHerbalDetails' },
      { label: 'Adherence', key: 'medicationHistoryAdherence' },
      { label: 'ADR History', key: 'hasAdrHistory', kind: 'boolean' },
      { label: 'ADR Details', key: 'adrHistoryDetails' },
    ],
  },
  {
    title: 'Pain Management Review',
    fields: [
      { label: 'Non-Opioids', key: 'analgesicNonOpioids', kind: 'boolean' },
      { label: 'Weak Opioids', key: 'analgesicWeakOpioids', kind: 'boolean' },
      { label: 'Strong Opioids', key: 'analgesicStrongOpioids', kind: 'boolean' },
      { label: 'Adjuvants', key: 'analgesicAdjuvants', kind: 'boolean' },
      { label: 'Other Analgesic Details', key: 'analgesicOtherDetails' },
      { label: 'Pain Control', key: 'painControl' },
      { label: 'Breakthrough Pain', key: 'breakthroughPain' },
      { label: 'Opioid Side Effects', key: 'opioidSideEffects', kind: 'chips' },
    ],
  },
  {
    title: 'Medication Safety',
    fields: [
      { label: 'Drug-Drug Interactions', key: 'drugDrugInteractions' },
      { label: 'Interaction Details', key: 'drugDrugInteractionDetails' },
      { label: 'Drug-Disease Interactions', key: 'drugDiseaseInteractions', kind: 'boolean' },
      { label: 'Disease Interaction Details', key: 'drugDiseaseInteractionDetails' },
      { label: 'High-Risk Medications', key: 'highRiskMedications', kind: 'chips' },
    ],
  },
  {
    title: 'Renal & Hepatic',
    fields: [
      { label: 'Renal Function', key: 'renalFunction' },
      { label: 'Creatinine', key: 'creatinine' },
      { label: 'Hepatic Function', key: 'hepaticFunction' },
      { label: 'LFTs', key: 'lfts' },
    ],
  },
  {
    title: 'Adverse Drug Reactions',
    fields: [
      { label: 'Suspected ADR', key: 'suspectedAdr', kind: 'boolean' },
      { label: 'Suspected Drug', key: 'suspectedAdrDrug' },
      { label: 'Reaction', key: 'suspectedAdrReaction' },
      { label: 'Severity', key: 'adrSeverity' },
      { label: 'Management', key: 'adrManagement', kind: 'chips' },
    ],
  },
  {
    title: 'Bowel Management',
    fields: [
      { label: 'Bowel Function', key: 'bowelFunction' },
      { label: 'On Laxatives', key: 'laxativeUse', kind: 'boolean' },
      { label: 'Laxative Details', key: 'laxativeDetails' },
    ],
  },
  {
    title: 'Dose Adjustment',
    fields: [
      { label: 'Required', key: 'doseAdjustmentRequired', kind: 'boolean' },
      { label: 'Reasons', key: 'doseAdjustmentReasons', kind: 'chips' },
    ],
  },
  {
    title: 'Patient Counselling',
    fields: [
      { label: 'Understanding', key: 'patientUnderstanding' },
      { label: 'Topics Covered', key: 'counselingTopics', kind: 'chips' },
    ],
  },
  {
    title: 'Pharmaceutical Care Plan',
    fields: [
      { label: 'Issues Identified', key: 'currentIssuesIdentified' },
      { label: 'Plan Actions', key: 'medicationPlanActions', kind: 'chips' },
      { label: 'Other Action', key: 'medicationPlanOther' },
    ],
  },
  {
    title: 'Access & Supply',
    fields: [
      { label: 'Availability', key: 'medicationAvailability' },
      { label: 'Financial Barriers', key: 'financialBarriers', kind: 'boolean' },
      { label: 'Pharmacy Intervention', key: 'pharmacyIntervention', kind: 'boolean' },
    ],
  },
  {
    title: 'Summary & Recommendations',
    fields: [
      { label: 'Clinical Pharmacist', key: 'clinicalPharmacistName' },
      { label: 'Summary', key: 'pharmacistSummary' },
      { label: 'Summary Flags', key: 'summaryFlags', kind: 'chips' },
      { label: 'Final Recommendations', key: 'finalRecommendations', kind: 'chips' },
    ],
  },
];

const PharmacistAssessmentDetailPage: React.FC = () => {
  const { id, assessmentId } = useParams<{ id: string; assessmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.type === 'admin';
  const isOwner = user?.role === 'Pharmacist';
  const canManage = isAdmin || isOwner;

  const { data: patient } = usePatient(id!);
  const { data: a, isLoading, error, refetch } = usePharmacistAssessment(id!, assessmentId!);
  const deleteMutation = useDeletePharmacistAssessment(id!);
  const [showDelete, setShowDelete] = useState(false);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  const handleDelete = (reason?: string) => {
    deleteMutation.mutate(
      { assessmentId: assessmentId!, reason },
      { onSuccess: () => navigate(`/patients/${id}/pharmacist-assessment`) },
    );
    setShowDelete(false);
  };

  return (
    <AssessmentDetailShell
      title="Pharmacist Assessment"
      patientLabel={patientLabel}
      createdAt={a?.createdAt ?? ''}
      createdByName={a?.createdByStaff?.name ?? null}
      isDeleted={!!a?.deletedAt}
      isAdmin={isAdmin}
      backTo={`/patients/${id}/pharmacist-assessment`}
      isLoading={isLoading}
      isError={!!error}
      onRetry={refetch}
      onPrint={() => window.print()}
      onEdit={canManage ? () => navigate(`/patients/${id}/pharmacist-assessment/${assessmentId}/edit`) : undefined}
      onDelete={canManage ? () => setShowDelete(true) : undefined}
    >
      {a &&
        SECTIONS.map((s) => (
          <DetailSectionRenderer key={s.title} section={s} data={a as any} />
        ))}
    </AssessmentDetailShell>
  );
};

export default PharmacistAssessmentDetailPage;