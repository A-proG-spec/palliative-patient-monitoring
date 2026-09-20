import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { usePatientVisits } from '@/hooks/useVisits';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { Pagination } from '@/components/common/Pagination';
import { PageLoader, SkeletonTable } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { VISIT_TYPE_LABELS } from '@/constants';

const VisitsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data: patientsData, isLoading: patientsLoading } = usePatients({ limit: 100 });
  const { data: visitsData, isLoading: visitsLoading, error, refetch } = usePatientVisits(
    selectedPatient || '',
    { page, limit }
  );

  if (patientsLoading) return <PageLoader />;

  const patients = patientsData?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <BackButton to="/dashboard" label="Dashboard" />
        <h1 className="text-2xl font-bold text-on-surface">Visit History</h1>
        <p className="text-sm text-text-secondary">View all visits recorded for patients</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          label="Select Patient"
          options={[
            { value: '', label: 'All Patients' },
            ...patients.map((p) => ({
              value: p.id,
              label: `${p.firstName} ${p.lastName} (${p.patientDisplayId || ''})`,
            })),
          ]}
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          className="w-64"
        />
      </div>

      <Card padding="none">
        {visitsLoading ? (
          <div className="p-5"><SkeletonTable /></div>
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : !selectedPatient ? (
          <EmptyState
            icon={<Calendar size={28} />}
            title="Select a patient"
            description="Choose a patient from the dropdown to view their visit history."
          />
        ) : !visitsData?.items?.length ? (
          <EmptyState
            icon={<Calendar size={28} />}
            title="No visits recorded"
            description="This patient has no recorded visits yet."
            actionLabel="Record Visit"
            onAction={() => navigate(`/patients/${selectedPatient}/visits`)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-low border-b border-border-base">
                <tr>
                  {['Date', 'Type', 'Status', 'Outcome', 'PPS', 'KPS', 'Team', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {visitsData.items.map((visit) => (
                  <tr
                    key={visit.id}
                    className="hover:bg-surface-low/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/patients/${visit.patientId}/visits/${visit.id}`)}
                  >
                    <td className="px-5 py-3.5">{formatDate(visit.visitDate)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary">
                        {VISIT_TYPE_LABELS[visit.visitType] || visit.visitType}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={visit.overallStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={visit.outcome} type="visit" />
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">{visit.ppsScore}%</td>
                    <td className="px-5 py-3.5 text-text-secondary">{visit.kpsScore}</td>
                    <td className="px-5 py-3.5 text-text-secondary text-xs">
                      {visit.teamMembers.map((m) => `${m.role}: ${m.name}`).join(', ')}
                    </td>
                    <td className="px-5 py-3.5">
                      <ChevronRight size={14} className="text-outline-variant" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {visitsData && visitsData.total > limit && (
          <div className="px-5 py-4 border-t border-border-base">
            <Pagination
              page={page}
              total={visitsData.total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default VisitsListPage;