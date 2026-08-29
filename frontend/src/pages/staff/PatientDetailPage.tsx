// src/pages/staff/PatientDetailPage.tsx
// Route: /patients/:patientId  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (staff)

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { usePatientVisits } from '@/hooks/useVisits';
import { usePatientMedications } from '@/hooks/useMedications';
import { usePatientLabs } from '@/hooks/useLabs';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate, joinList } from '@/lib/utils';
import { ROUTES, DISEASE_STAGE_LABELS, PROGNOSIS_LABELS } from '@/constants';

const TABS = ['Visits', 'Medications', 'Labs', 'Referrals', 'Admissions'] as const;
type Tab = typeof TABS[number];

export const PatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Visits');

  const { data: patient, isLoading, error, refetch } = usePatient(patientId!);
  const { data: visits } = usePatientVisits(patientId!, { limit: 20 });
  const { data: meds } = usePatientMedications(patientId!);
  const { data: labs } = usePatientLabs(patientId!);
  const { data: referrals } = usePatientReferrals(patientId!);
  const { data: admissions } = usePatientAdmissions(patientId!);

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENTS)}>← Back</Button>
          <div>
            <h1 className="text-heading-1 text-on-surface">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-body-sm text-text-muted">{patient.patientDisplayId}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={patient.status} />
          <StatusBadge status={patient.currentLocation} />
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENT_SUMMARY(patientId!))}>
            View Summary
          </Button>
        </div>
      </div>

      {/* Quick-action row */}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.PATIENT_VISITS(patientId!))}>
          Record Visit
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENT_MEDICATIONS(patientId!))}>
          Order Medication
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENT_LABS(patientId!))}>
          Order Lab Test
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENT_REFERRALS(patientId!))}>
          Request Referral
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENT_ADMISSIONS(patientId!))}>
          Record Admission
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <Card>
          <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-body-sm">
              {[
                ['Age', patient.age],
                ['Sex', patient.sex],
                ['Date of Birth', formatDate(patient.dateOfBirth)],
                ['Phone', patient.phone],
                ['Address', patient.address],
                ['Emergency Contact', `${patient.emergencyContactName} (${patient.emergencyContactPhone})`],
                ['Caregiver', `${patient.caregiverName} (${patient.caregiverPhone})`],
              ].map(([l, v]) => (
                <React.Fragment key={String(l)}>
                  <dt className="text-on-surface-variant font-semibold">{l}</dt>
                  <dd className="text-on-surface">{v ?? '—'}</dd>
                </React.Fragment>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Diagnosis */}
        <Card>
          <CardHeader><CardTitle>Medical Diagnosis</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-body-sm">
              <dt className="text-on-surface-variant font-semibold">Primary Diagnosis</dt>
              <dd className="text-on-surface">{patient.primaryDiagnosis}</dd>
              <dt className="text-on-surface-variant font-semibold">Secondary Diagnoses</dt>
              <dd className="text-on-surface">{joinList(patient.secondaryDiagnoses) || '—'}</dd>
              <dt className="text-on-surface-variant font-semibold">Disease Stage</dt>
              <dd className="text-on-surface">{DISEASE_STAGE_LABELS[patient.diseaseStage] ?? patient.diseaseStage}</dd>
              <dt className="text-on-surface-variant font-semibold">Comorbidities</dt>
              <dd className="text-on-surface">{joinList(patient.comorbidities) || '—'}</dd>
              <dt className="text-on-surface-variant font-semibold">Est. Prognosis</dt>
              <dd className="text-on-surface">{PROGNOSIS_LABELS[patient.estimatedPrognosis] ?? patient.estimatedPrognosis}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-base flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-body-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Visits' && (
        <SimpleTable
          rows={visits?.items ?? []}
          columns={[
            { label: 'Date',    render: (r) => formatDate(r.visitDate) },
            { label: 'Type',    render: (r) => r.visitType },
            { label: 'Status',  render: (r) => <StatusBadge status={r.overallStatus} /> },
            { label: 'Outcome', render: (r) => <StatusBadge status={r.outcome} /> },
          ]}
          empty="No visits recorded."
        />
      )}
      {activeTab === 'Medications' && (
        <SimpleTable
          rows={meds?.items ?? []}
          columns={[
            { label: 'Name',     render: (r) => r.name },
            { label: 'Dosage',   render: (r) => r.dosage },
            { label: 'Frequency', render: (r) => r.frequency },
            { label: 'Status',   render: (r) => <StatusBadge status={r.status} /> },
          ]}
          empty="No medications ordered."
        />
      )}
      {activeTab === 'Labs' && (
        <SimpleTable
          rows={labs?.items ?? []}
          columns={[
            { label: 'Test',         render: (r) => r.testName },
            { label: 'Date Ordered', render: (r) => formatDate(r.dateOrdered) },
            { label: 'Status',       render: (r) => <StatusBadge status={r.status} /> },
            { label: 'Result',       render: (r) => r.result ?? '—' },
          ]}
          empty="No lab tests ordered."
        />
      )}
      {activeTab === 'Referrals' && (
        <SimpleTable
          rows={referrals?.items ?? []}
          columns={[
            { label: 'Date',     render: (r) => formatDate(r.referralDate) },
            { label: 'Type',     render: (r) => r.referralType },
            { label: 'Facility', render: (r) => r.receivingFacility },
            { label: 'Status',   render: (r) => <StatusBadge status={r.status} /> },
          ]}
          empty="No referrals requested."
        />
      )}
      {activeTab === 'Admissions' && (
        <SimpleTable
          rows={admissions?.items ?? []}
          columns={[
            { label: 'Date',      render: (r) => formatDate(r.admissionDate) },
            { label: 'Ward',      render: (r) => r.ward },
            { label: 'Bed',       render: (r) => r.bedNumber },
            { label: 'Status',    render: (r) => <StatusBadge status={r.status} /> },
          ]}
          empty="No admissions recorded."
        />
      )}
    </div>
  );
};

function SimpleTable<T>({
  rows, columns, empty,
}: {
  rows: T[];
  columns: { label: string; render: (r: T) => React.ReactNode }[];
  empty: string;
}) {
  if (!rows.length) {
    return <p className="text-body-md text-text-muted text-center py-8">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border-base bg-surface-container-lowest shadow-card">
      <table className="w-full text-body-sm">
        <thead className="bg-surface-container-low border-b border-border-base">
          <tr>
            {columns.map((c) => (
              <th key={c.label} className="px-4 py-3 text-left text-on-surface-variant font-semibold whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base">
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.label} className="px-4 py-3 text-on-surface">{c.render(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
