import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import {
  useNutritionalAssessment,
  useDeleteNutritionalAssessment,
} from '@/hooks/useNutritionalAssessments';
import { useAuthStore } from '@/store/auth.store';
import { AssessmentDetailShell } from '@/components/assessments/AssessmentDetailShell';
import {
  DetailSectionRenderer,
  type DetailSectionDef,
} from '@/components/assessments/AssessmentDetailFields';

const SECTIONS: DetailSectionDef[] = [
  {
    title: 'Anthropometric',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Weight (kg)', key: 'weightKg' },
      { label: 'Height (cm)', key: 'heightCm' },
      { label: 'BMI', key: 'bmi' },
      { label: 'MUAC (cm)', key: 'muacCm' },
      { label: 'Recent Weight Loss (kg)', key: 'recentWeightLossKg' },
      { label: 'Weight Loss Period', key: 'weightLossPeriod' },
      { label: 'Status Classification', key: 'nutritionalStatusClassification' },
    ],
  },
  {
    title: 'Weight History',
    fields: [
      { label: 'Weight 6 mo ago', key: 'weightSixMonthsAgoKg' },
      { label: 'Weight 3 mo ago', key: 'weightThreeMonthsAgoKg' },
      { label: 'Current Weight', key: 'currentWeightKg' },
      { label: '% Weight Loss', key: 'percentageWeightLoss' },
      { label: 'Significant Weight Loss', key: 'significantWeightLoss' },
    ],
  },
  {
    title: 'Appetite',
    fields: [
      { label: 'Current Appetite', key: 'currentAppetite' },
      { label: 'Appetite Trend', key: 'appetiteTrend' },
      { label: 'Causes', key: 'appetiteCauses', kind: 'chips' },
      { label: 'Other Cause', key: 'appetiteCauseOther' },
    ],
  },
  {
    title: 'Dietary Intake',
    fields: [
      { label: 'Meals Per Day', key: 'mealsPerDay' },
      { label: 'Oral Intake', key: 'oralIntake' },
      { label: 'Fluid Intake', key: 'fluidIntake' },
      { label: 'Special Diet', key: 'specialDiet' },
      { label: 'Special Diet Details', key: 'specialDietSpecify' },
    ],
  },
  {
    title: 'Feeding',
    fields: [
      { label: 'Feeding Method', key: 'feedingMethod' },
      { label: 'Other Method', key: 'feedingMethodOther' },
      { label: 'Assistance Required', key: 'feedingAssistanceRequired' },
      { label: 'Difficulty Swallowing', key: 'difficultySwallowing', kind: 'boolean' },
      { label: 'Swallowing Details', key: 'difficultySwallowingDetails' },
    ],
  },
  {
    title: 'GI Symptoms',
    fields: [
      { label: 'Nausea', key: 'nauseaSeverity' },
      { label: 'Vomiting', key: 'vomitingSeverity' },
      { label: 'Constipation', key: 'constipationSeverity' },
      { label: 'Diarrhea', key: 'diarrheaSeverity' },
      { label: 'Abdominal Pain', key: 'abdominalPainSeverity' },
      { label: 'Bloating', key: 'bloatingSeverity' },
      { label: 'Mouth Sores', key: 'mouthSoresSeverity' },
    ],
  },
  {
    title: 'Functional Impact',
    fields: [
      { label: 'Energy Level', key: 'energyLevel' },
      { label: 'Meal Preparation', key: 'mealPreparation' },
      { label: 'Feeding Ability', key: 'feedingAbility' },
    ],
  },
  {
    title: 'Risk Screening',
    fields: [
      { label: 'Risk Factors', key: 'riskFactors', kind: 'chips' },
      { label: 'Overall Risk', key: 'overallNutritionalRisk' },
    ],
  },
  {
    title: 'Food Security',
    fields: [
      { label: 'Adequate Food Access', key: 'adequateFoodAccess', kind: 'boolean' },
      { label: 'Financial Barriers', key: 'financialBarriersToNutrition', kind: 'boolean' },
      { label: 'Requires Assistance', key: 'requiresNutritionalAssistance', kind: 'boolean' },
    ],
  },
  {
    title: 'Diagnosis & Plan',
    fields: [
      { label: 'Diagnoses', key: 'diagnoses', kind: 'chips' },
      { label: 'Other Diagnosis', key: 'diagnosisOther' },
      { label: 'Goals', key: 'nutritionalGoals' },
      { label: 'Interventions', key: 'interventions', kind: 'chips' },
      { label: 'Other Intervention', key: 'interventionOther' },
      { label: 'Monitoring Plans', key: 'monitoringPlans', kind: 'chips' },
      { label: 'Other Monitoring', key: 'monitoringOther' },
    ],
  },
  {
    title: 'Summary',
    fields: [
      { label: 'Outcome', key: 'assessmentOutcome', kind: 'chips' },
      { label: 'Final Recommendations', key: 'finalRecommendations', kind: 'chips' },
    ],
  },
];

const NutritionalAssessmentDetailPage: React.FC = () => {
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
  const { data: a, isLoading, error, refetch } = useNutritionalAssessment(
    id!,
    assessmentId!,
  );
  const deleteMutation = useDeleteNutritionalAssessment(id!);
  const [showDelete, setShowDelete] = useState(false);

  const patientLabel = patient
    ? `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`
    : '—';

  const handleDelete = (reason?: string) => {
    deleteMutation.mutate(
      { assessmentId: assessmentId!, reason },
      {
        onSuccess: () => navigate(`${basePath}/nutritional-assessment`),
        onError: () => setShowDelete(false),
      },
    );
    setShowDelete(false);
  };

  return (
    <>
      <AssessmentDetailShell
        title="Nutritional Assessment"
        patientLabel={patientLabel}
        createdAt={a?.createdAt ?? ''}
        createdByName={a?.createdByStaff?.name ?? null}
        isDeleted={!!a?.deletedAt}
        isAdmin={isAdmin}
        backTo={`${basePath}/nutritional-assessment`}
        isLoading={isLoading}
        isError={!!error}
        onRetry={refetch}
        onPrint={() => window.print()}
        onEdit={
          canManage && !a?.deletedAt
            ? () =>
                navigate(
                  `${basePath}/nutritional-assessment/${assessmentId}/edit`,
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
              Delete this nutritional assessment?
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

export default NutritionalAssessmentDetailPage;