// src/pages/admin/AdminPatientDetailPage.tsx
// Route: /admin/patients/:patientId  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (admin)

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminPatientDetail, useCloseCase } from '@/hooks/useAdmin';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate, joinList } from '@/lib/utils';
import { ROUTES, DISEASE_STAGE_LABELS, PROGNOSIS_LABELS } from '@/constants';

export const AdminPatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState<'Improved' | 'Deceased' | ''>('');

  const { data: patient, isLoading, error, refetch } = useAdminPatientDetail(patientId!);
  const closeCaseMutation = useCloseCase();

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const handleCloseCase = () => {
    if (!closeReason) return;
    closeCaseMutation.mutate(
      { patientId: patientId!, data: { reason: closeReason } },
      {
        onSuccess: () => {
          setShowCloseModal(false);
          refetch();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.ADMIN_PATIENTS)}>
            ← Back
          </Button>
          <div>
            <h1 className="text-heading-1 text-on-surface">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-body-sm text-text-muted">{patient.patientDisplayId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={patient.status} />
          <StatusBadge status={patient.currentLocation} />
          {patient.status === 'Active' && (
            <Button variant="destructive" size="sm" onClick={() => setShowCloseModal(true)}>
              Close Case
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <Card>
          <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-body-sm">
              {[
                ['Age', patient.age],
                ['Sex', patient.sex],
                ['Date of Birth', formatDate(patient.dateOfBirth)],
                ['Phone', patient.phone],
                ['Address', patient.address],
                ['Emergency Contact', `${patient.emergencyContactName} (${patient.emergencyContactPhone})`],
                ['Caregiver', `${patient.caregiverName} (${patient.caregiverPhone})`],
                ['Registered By', patient.registeredBy?.name],
                ['Registered', formatDate(patient.createdAt)],
              ].map(([label, value]) => (
                <React.Fragment key={String(label)}>
                  <dt className="text-on-surface-variant font-semibold">{label}</dt>
                  <dd className="text-on-surface">{value ?? '—'}</dd>
                </React.Fragment>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Diagnosis */}
        <Card>
          <CardHeader><CardTitle>Medical Diagnosis</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-body-sm">
              <dt className="text-on-surface-variant font-semibold">Primary Diagnosis</dt>
              <dd className="text-on-surface">{patient.primaryDiagnosis}</dd>
              <dt className="text-on-surface-variant font-semibold">Secondary Diagnoses</dt>
              <dd className="text-on-surface">{joinList(patient.secondaryDiagnoses) || '—'}</dd>
              <dt className="text-on-surface-variant font-semibold">Disease Stage</dt>
              <dd className="text-on-surface">{DISEASE_STAGE_LABELS[patient.diseaseStage] ?? patient.diseaseStage}</dd>
              <dt className="text-on-surface-variant font-semibold">Comorbidities</dt>
              <dd className="text-on-surface">{joinList(patient.comorbidities) || '—'}</dd>
              <dt className="text-on-surface-variant font-semibold">Estimated Prognosis</dt>
              <dd className="text-on-surface">{PROGNOSIS_LABELS[patient.estimatedPrognosis] ?? patient.estimatedPrognosis}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Visits */}
      <RecordTable title="Visit History" rows={patient.visits ?? []}
        columns={[
          { label: 'Date', render: (r) => formatDate(r.visitDate) },
          { label: 'Outcome', render: (r) => <StatusBadge status={r.outcome} /> },
          { label: 'Staff', render: (r) => String(r.staff) },
        ]}
      />

      {/* Medications */}
      <RecordTable title="Medications" rows={patient.medications ?? []}
        columns={[
          { label: 'Name', render: (r) => r.name },
          { label: 'Dosage', render: (r) => r.dosage },
          { label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />

      {/* Lab Tests */}
      <RecordTable title="Lab Tests" rows={patient.labTests ?? []}
        columns={[
          { label: 'Test', render: (r) => r.name },
          { label: 'Date Ordered', render: (r) => formatDate(r.dateOrdered) },
          { label: 'Result', render: (r) => r.result ?? '—' },
        ]}
      />

      {/* Referrals */}
      <RecordTable title="Referrals" rows={patient.referrals ?? []}
        columns={[
          { label: 'Date', render: (r) => formatDate(r.date) },
          { label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />

      {/* Admissions */}
      <RecordTable title="Hospital Admissions" rows={patient.admissions ?? []}
        columns={[
          { label: 'Date', render: (r) => formatDate(r.date) },
          { label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />

      {/* Close Case Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Close Patient Case</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-md text-on-surface-variant">
                Are you sure you want to close the case for{' '}
                <strong>{patient.firstName} {patient.lastName}</strong>?
              </p>
              <p className="text-body-sm font-semibold text-on-surface">Select reason for closing case:</p>
              <div className="space-y-2">
                {(['Improved', 'Deceased'] as const).map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="closeReason"
                      value={r}
                      checked={closeReason === r}
                      onChange={() => setCloseReason(r)}
                      className="accent-primary"
                    />
                    <span className="text-body-md text-on-surface">{r}</span>
                  </label>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => { setShowCloseModal(false); setCloseReason(''); }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!closeReason || closeCaseMutation.isPending}
                loading={closeCaseMutation.isPending}
                onClick={handleCloseCase}
              >
                Confirm Close Case
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

// Reusable mini-table inside this page
function RecordTable<T extends Record<string, unknown>>({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: T[];
  columns: { label: string; render: (row: T) => React.ReactNode }[];
}) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        {!rows.length ? (
          <p className="text-body-md text-text-muted text-center py-4">No records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="border-b border-border-base">
                <tr>
                  {columns.map((c) => (
                    <th key={c.label} className="text-left py-2 pr-4 text-on-surface-variant font-semibold">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {rows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.label} className="py-2 pr-4 text-on-surface">{c.render(row)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
