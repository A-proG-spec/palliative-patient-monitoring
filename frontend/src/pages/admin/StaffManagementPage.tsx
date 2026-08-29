// src/pages/admin/StaffManagementPage.tsx
// Route: /admin/staff  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (admin)

import React, { useState } from 'react';
import { usePendingStaff, useApproveStaff, useRejectStaff } from '@/hooks/useAdmin';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { STAFF_ROLE_OPTIONS } from '@/constants';

export const StaffManagementPage: React.FC = () => {
  const { data: pendingStaff, isLoading, error, refetch } = usePendingStaff();
  const approveStaffMutation = useApproveStaff();
  const rejectStaffMutation = useRejectStaff();
  const [roleSelections, setRoleSelections] = useState<Record<string, string>>({});

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-1 text-on-surface">Staff Management</h1>
        {(pendingStaff?.length ?? 0) > 0 && (
          <Badge variant="warning">{pendingStaff!.length} pending</Badge>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Pending Staff Registrations</CardTitle></CardHeader>
        <CardContent>
          {!pendingStaff?.length ? (
            <EmptyState
              title="No pending staff registrations"
              description="All staff registrations have been processed."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <thead className="bg-surface-container-low border-b border-border-base">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Registered', 'Assign Role', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-on-surface-variant font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {pendingStaff.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-semibold text-on-surface">{s.name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{s.email}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{s.phone}</td>
                      <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{formatDate(s.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Select
                          options={STAFF_ROLE_OPTIONS}
                          placeholder="Select role"
                          value={roleSelections[s.id] ?? ''}
                          onChange={(e) =>
                            setRoleSelections((prev) => ({ ...prev, [s.id]: e.target.value }))
                          }
                          className="w-36"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!roleSelections[s.id] || approveStaffMutation.isPending}
                            loading={approveStaffMutation.isPending}
                            onClick={() => {
                              if (roleSelections[s.id]) {
                                approveStaffMutation.mutate({
                                  staffId: s.id,
                                  data: {
                                    role: roleSelections[s.id] as 'TeamLeader' | 'Physician' | 'Nurse',
                                  },
                                });
                              }
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={rejectStaffMutation.isPending}
                            loading={rejectStaffMutation.isPending}
                            onClick={() => rejectStaffMutation.mutate(s.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
