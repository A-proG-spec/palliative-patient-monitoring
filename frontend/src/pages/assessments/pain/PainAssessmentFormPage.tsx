import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { useCreatePainAssessment } from '@/hooks/usePainAssessments';
import {
  createPainAssessmentSchema,
  type CreatePainAssessmentFormData,
} from '@/schemas/pain-assessment.schema';
import { AssessmentFormShell } from '@/components/assessments/AssessmentFormShell';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';

// ─────────────────────────────────────────────────────────────
// Small layout helper
// ─────────────────────────────────────────────────────────────
const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="bg-surface-lowest border border-border-base rounded-2xl p-5 space-y-4">
    <h2 className="text-sm font-semibold text-primary uppercase tracking-wide border-b border-border-base pb-2">
      {title}
    </h2>
    {children}
  </div>
);

const Grid: React.FC<{ cols?: 2 | 3; children: React.ReactNode }> = ({
  cols = 2,
  children,
}) => (
  <div
    className={
      cols === 3
        ? 'grid grid-cols-1 sm:grid-cols-3 gap-4'
        : 'grid grid-cols-1 sm:grid-cols-2 gap-4'
    }
  >
    {children}
  </div>
);

const PainAssessmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading, error, refetch } = usePatient(id!);
  const createMutation = useCreatePainAssessment(id!);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePainAssessmentFormData>({
    resolver: zodResolver(createPainAssessmentSchema),
    defaultValues: {
      assessmentType: 'Admission',
      painLocations: [],
      painDescriptions: [],
      painType: [],
      painPattern: [],
      aggravatingFactors: [],
      relievingFactors: [],
      adjuvantDrugs: [],
      associatedSymptoms: [],
      patientBehaviors: [],
      managementBarriers: [],
      diagnosis: [],
      interventions: [],
      nonPharmacologicalMethods: [],
      monitoringPlan: [],
      assessmentOutcome: [],
      finalRecommendations: [],
      impacts: [],
    },
  });

  const onSubmit = (data: CreatePainAssessmentFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        navigate(`/patients/${id}`);
      },
    });
  };

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const patientLabel = `${patient.firstName} ${patient.lastName} · ${patient.patientDisplayId ?? patient.id}`;

  return (
    <AssessmentFormShell
      title="Pain Assessment"
      patientLabel={patientLabel}
      backTo={`/patients/${id}`}
      mode="create"
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate(`/patients/${id}`)}
    >
      {/* ── Section 1: Header ── */}
      <Section title="1. Assessment Type">
        <Select
          label="Assessment Type"
          options={[
            { value: 'Admission', label: 'Admission' },
            { value: 'FollowUp', label: 'Follow-up' },
            { value: 'EmergencyPainReview', label: 'Emergency Pain Review' },
          ]}
          error={errors.assessmentType?.message}
          {...register('assessmentType')}
        />
      </Section>

      {/* ── Section 2: Pain history ── */}
      <Section title="2. Pain History">
        <Input
          label="Primary Pain Complaint"
          placeholder="e.g. Persistent lower back pain"
          {...register('primaryPainComplaint')}
        />
        <Grid cols={2}>
          <Select
            label="Onset"
            options={[
              { value: 'Acute', label: 'Acute' },
              { value: 'Chronic', label: 'Chronic' },
              { value: 'Progressive', label: 'Progressive' },
            ]}
            placeholder="Select…"
            {...register('painOnset')}
          />
          <Input
            label="Duration"
            placeholder="e.g. 3 weeks"
            {...register('painDuration')}
          />
        </Grid>
      </Section>

      {/* ── Section 3: Severity ── */}
      <Section title="3. Pain Severity (NRS 0–10)">
        <Grid cols={3}>
          <Input
            label="Current Pain Score"
            type="number"
            min={0}
            max={10}
            {...register('currentPainScore')}
          />
          <Input
            label="Worst (last 24h)"
            type="number"
            min={0}
            max={10}
            {...register('worstPainLast24h')}
          />
          <Input
            label="Least (last 24h)"
            type="number"
            min={0}
            max={10}
            {...register('leastPainLast24h')}
          />
        </Grid>
      </Section>

      {/* ── Section 4: Pain characteristics ── */}
      <Section title="4. Pain Characteristics">
        <Textarea
          label="Locations (comma-separated)"
          rows={2}
          placeholder="Head, Chest, Lower back"
          {...register('painLocationOther')}
        />
        <Textarea
          label="Descriptions (comma-separated)"
          rows={2}
          placeholder="Sharp, Dull, Burning"
          {...register('relievingOther')}
        />
      </Section>

      {/* ── Section 5: Clinical plan ── */}
      <Section title="5. Management Plan">
        <Textarea
          label="Management Goals"
          rows={3}
          {...register('managementGoals')}
        />
      </Section>
    </AssessmentFormShell>
  );
};

export default PainAssessmentFormPage;