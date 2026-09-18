import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatResponseTime } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants';
import type { StaffRole } from '@/types/admin.types';

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

export interface StaffPerformanceItem {
  id: string;
  name: string;
  role: StaffRole | null;
  totalPatientsAssigned: number;
  totalVisitsRecorded: number;
  averageResponseTimeMinutes: number | null;
}

interface StaffPerformanceListResponse {
  items: StaffPerformanceItem[];
  total: number;
  page: number;
  limit: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// API Functions (TODO: Backend endpoints)
// ══════════════════════════════════════════════════════════════════════════════

// TODO: Backend endpoint GET /api/admin/staff/performance
// Expected query params: { page?: number, limit?: number, search?: string, role?: StaffRole }
// Expected response: StaffPerformanceListResponse
async function fetchStaffPerformanceList(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: StaffRole;
}): Promise<StaffPerformanceListResponse> {
  // TODO: Replace with real API call when backend endpoint is ready
  throw new Error('Backend endpoint GET /api/admin/staff/performance not implemented yet');
}

// ══════════════════════════════════════════════════════════════════════════════
// Custom Hook
// ══════════════════════════════════════════════════════════════════════════════

function useStaffPerformanceList(params: {
  page: number;
  limit: number;
  search?: string;
  role?: StaffRole;
}) {
  const [data, setData] = useState<StaffPerformanceListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    fetchStaffPerformanceList(params)
      .then((response) => {
        if (!cancelled) {
          setData(response);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params.page, params.limit, params.search, params.role]);

  const refetch = () => {
    setIsLoading(true);
    setError(null);
    fetchStaffPerformanceList(params)
      .then((response) => {
        setData(response);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  };

  return { data, isLoading, error, refetch };
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export const StaffPerformanceTab: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | ''>('');
  const [page] = useState(1);
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
        <Input
          placeholder="Search by name…"
          leftIcon={<Search size={15} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-72"
        />
        <Select
          options={[
            { value: '', label: 'All Roles' },
            { value: 'TeamLeader', label: 'Team Leader' },
            { value: 'Physician', label: 'Physician' },
            { value: 'Nurse', label: 'Nurse' },
            { value: 'Pharmacist', label: 'Pharmacist' },
            { value: 'LabTechnician', label: 'Laboratory Technician' },
            { value: 'Radiologist', label: 'Radiologist' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as StaffRole | '')}
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
    </Card>
  );
};
