import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useAdminPatients } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { Pagination } from '@/components/common/Pagination';
import { PageLoader, SkeletonTable } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { DISEASE_STAGE_LABELS } from '@/constants';

const AdminPatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, error, refetch } = useAdminPatients({ page, limit, search: search || undefined, status: status || undefined });

  return (
    <div className="space-y-6">
      <div>
        <BackButton to="/admin" label="Dashboard" />
        <h1 className="text-2xl font-bold text-on-surface">All Patients</h1>
        <p className="text-sm text-text-secondary">View and manage all registered patients</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or ID…"
          leftIcon={<Search size={15} />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
        <Select
          options={[{ value: 'Active', label: 'Active' }, { value: 'Discharged', label: 'Discharged' }]}
          placeholder="All statuses"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-40"
        />
      </div>

      <Card padding="none">
        {isLoading ? (
          <div className="p-5"><SkeletonTable /></div>
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.items?.length ? (
          <EmptyState title="No patients found" description="Try adjusting your search filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-low border-b border-border-base">
                <tr>
                  {['ID', 'Name', 'Age/Sex', 'Diagnosis', 'Stage', 'Location', 'Status', 'Registered', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {data.items.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface-low/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/patients/${p.id}`)}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-text-muted">{p.patientDisplayId}</td>
                    <td className="px-5 py-3.5 font-medium text-on-surface">{p.firstName} {p.lastName}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{p.age}y · {p.sex[0]}</td>
                    <td className="px-5 py-3.5 text-text-secondary max-w-[180px] truncate">{p.primaryDiagnosis}</td>
                    <td className="px-5 py-3.5"><Badge variant="secondary">{DISEASE_STAGE_LABELS[p.diseaseStage] ?? p.diseaseStage}</Badge></td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.currentLocation} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.status} type="patient" /></td>
                    <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">{formatDate(p.registeredAt)}</td>
                    <td className="px-5 py-3.5"><ChevronRight size={14} className="text-outline-variant" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.total > limit && (
          <div className="px-5 py-4 border-t border-border-base">
            <Pagination page={page} total={data.total} limit={limit} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminPatientListPage;
