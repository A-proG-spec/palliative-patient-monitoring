// src/pages/staff/PatientListPage.tsx
// Route: /patients  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (staff)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '@/hooks/usePatients';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ROUTES, PATIENT_STATUS_FILTER_OPTIONS, DEFAULT_PAGE_SIZE } from '@/constants';
import { formatDate } from '@/lib/utils';

export const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, error, refetch } = usePatients({
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: search || undefined,
    status: (status as 'Active' | 'Discharged') || undefined,
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-heading-1 text-on-surface">Patients</h1>
        <Button variant="primary" onClick={() => navigate(ROUTES.PATIENT_NEW)}>
          + Register New Patient
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="search"
          placeholder="Search by name or ID…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="sm:max-w-xs"
        />
        <Select
          options={PATIENT_STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="sm:w-44"
        />
      </div>

      {!data?.items?.length ? (
        <EmptyState
          title="No patients found"
          description="Register your first patient to get started."
          actionLabel="Register New Patient"
          onAction={() => navigate(ROUTES.PATIENT_NEW)}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border-base bg-surface-container-lowest shadow-card">
            <table className="w-full text-body-sm">
              <thead className="bg-surface-container-low border-b border-border-base">
                <tr>
                  {['ID', 'Name', 'Age/Sex', 'Primary Diagnosis', 'Status', 'Location', 'Registered'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-on-surface-variant font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {data.items.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(ROUTES.PATIENT_DETAIL(p.id))}
                    className="hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-on-surface-variant text-body-sm">{p.patientDisplayId}</td>
                    <td className="px-4 py-3 font-semibold text-on-surface whitespace-nowrap">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{p.age} / {p.sex}</td>
                    <td className="px-4 py-3 text-on-surface max-w-[200px] truncate">{p.primaryDiagnosis}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={p.currentLocation} /></td>
                    <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={data.total} limit={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};
