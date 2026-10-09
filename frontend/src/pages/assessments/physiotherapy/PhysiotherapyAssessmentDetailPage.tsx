import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import {
  usePhysiotherapyAssessment,
  useDeletePhysiotherapyAssessment,
} from '@/hooks/usePhysiotherapyAssessments';
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
  const { pathname } = useLocation();

  const { user } = useAuthStore();
  const isAdmin = user?.type === 'admin';
  const isOwner = user?.role === 'Physiologist';
  const canManage = isAdmin || isOwner;

  // ── Route-aware base path ──
  const isAdminRoute = pathname.startsWith('/admin/');
  const basePath = isAdminRoute
    ? `/admin/patients/${id}`
    : `/patients/${id}`;

  const { data: patient } = usePatient(id!);
  const { data: a, isLoading, error, refetch } = usePhysiotherapyAssessment(id!, assessmentId!);
  const deleteMutation = useDeletePhysiotherapyAssessment(id!);
  const [showDelete, setShowDelete] = useState(false);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  const handleDelete = (reason?: string) => {
    deleteMutation.mutate(
      { assessmentId: assessmentId!, reason },
      {
        onSuccess: () => navigate(`${basePath}/physiotherapy-assessment`),
        onError: () => setShowDelete(false),
      },
    );
    setShowDelete(false);
  };

  return (
    <>
      <AssessmentDetailShell
        title="Physiotherapy Assessment"
        patientLabel={patientLabel}
        createdAt={a?.createdAt ?? ''}
        createdByName={a?.createdByStaff?.name ?? null}
        isDeleted={!!a?.deletedAt}
        isAdmin={isAdmin}
        backTo={`${basePath}/physiotherapy-assessment`}
        isLoading={isLoading}
        isError={!!error}
        onRetry={refetch}
        onPrint={() => window.print()}
        onEdit={
          canManage && !a?.deletedAt
            ? () => navigate(`${basePath}/physiotherapy-assessment/${assessmentId}/edit`)
            : undefined
        }
        onDelete={canManage && !a?.deletedAt ? () => setShowDelete(true) : undefined}
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
              Delete this physiotherapy assessment?
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

export default PhysiotherapyAssessmentDetailPage;