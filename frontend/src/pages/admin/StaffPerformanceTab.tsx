import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { formatResponseTime } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants';
import { useStaffPerformanceList } from '@/hooks/useAdmin';
import type { StaffRole } from '@/types/admin.types';

export const StaffPerformanceTab: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | ''>('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, error, refetch } = useStaffPerformanceList({
    page,
    limit,
    search: searchTerm.trim() || undefined,
    role: roleFilter || undefined,
  });

  return (
    <Card padding="none">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 border-b border-border-base">
        <Input          placeholder="Search by name…"
          leftIcon={<Search size={15} />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-72"
        />
        <Select
          options={[
            { value: '', label: 'All Roles' },
            { value: 'Physician', label: 'Physician' },
            { value: 'Nurse', label: 'Nurse' },
            { value: 'Pharmacist', label: 'Pharmacist' },
            { value: 'LaboratoryTechnician', label: 'Laboratory Technician' },
            { value: 'Radiologist', label: 'Radiologist' },
          ]}
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as StaffRole | '');
            setPage(1);
          }}
          className="w-48"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-5">
          <SkeletonTable rows={6} />
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState
          icon={<TrendingUp size={28} />}
          title="No performance data available"
          description="Staff performance metrics will appear here once clinical activity is recorded."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-low border-b border-border-base">
              <tr>
                {[
                  'Name',
                  'Role',
                  'Patients Assigned',
                  'Visits Recorded',
                  'Avg Response Time',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {data.items.map((staff) => (
                <tr
                  key={staff.id}
                  className="hover:bg-surface-low/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/staff/performance/${staff.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-on-surface">{staff.name}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {staff.role ? (
                      <Badge variant="secondary">
                        {ROLE_LABELS[staff.role] ?? staff.role}
                      </Badge>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">
                    {staff.totalPatientsAssigned ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">
                    {staff.totalVisitsRecorded ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">
                    {formatResponseTime(staff.averageResponseTimeMinutes)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <ChevronRight size={16} className="text-outline-variant" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.total > limit && (
        <div className="px-5 py-4 border-t border-border-base">
          <Pagination
            page={page}
            total={data.total}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </Card>
  );
};