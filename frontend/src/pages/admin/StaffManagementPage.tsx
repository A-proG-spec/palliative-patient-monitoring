import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  UserX,
  Trash2,
  RotateCcw,
  UserPlus,
  Search,
  Pencil,
} from 'lucide-react';
import {
  usePendingStaff,
  useApproveStaff,
  useRejectStaff,
  useStaffList,
  useDeleteStaff,
  useRestoreStaff,
} from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader, SkeletonTable } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { formatRelativeTime } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants';
import StaffEditModal from '@/components/admin/StaffEditModal';
import type {
  StaffListItem,
  StaffListFilterStatus,
  StaffRole,
} from '@/types/admin.types';

// ─────────────────────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────────────────────
type Tab = 'active' | 'pending';

// ─────────────────────────────────────────────────────────────
// Delete confirmation modal
// ─────────────────────────────────────────────────────────────
interface DeleteModalProps {
  staff: StaffListItem | null;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
  staff,
  onConfirm,
  onCancel,
  isPending,
}) => {
  const [reason, setReason] = useState('');

  if (!staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-bg text-error mb-4">
          <UserX size={24} />
        </div>
        <h2 className="text-lg font-semibold text-on-surface mb-2">
          Delete Staff Member
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Are you sure you want to delete{' '}
          <strong>{staff.name}</strong>? The account will be
          hidden from the list but their clinical records remain intact.
          You can restore them later from the Deleted filter.
        </p>

        <div className="bg-surface-low p-3 rounded-lg text-sm space-y-1 mb-4">
          <div>
            <span className="text-text-muted">Email:</span>{' '}
            <span className="text-on-surface">{staff.email}</span>
          </div>
          <div>
            <span className="text-text-muted">Role:</span>{' '}
            <span className="text-on-surface">
              {staff.role ? ROLE_LABELS[staff.role] ?? staff.role : '—'}
            </span>
          </div>
        </div>

        <label className="block text-sm font-medium text-on-surface mb-1">
          Reason (optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Left the organization, reason recorded for audit trail…"
          rows={3}
          maxLength={500}
          className="block w-full rounded-lg border border-border-base bg-surface-lowest px-3 py-2 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary mb-5 resize-y"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-xl border border-border-base bg-surface-lowest px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-low transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim() || undefined)}
            disabled={isPending}
            className="flex-1 rounded-xl bg-error px-4 py-2.5 text-sm font-medium text-white hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete Staff
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
const StaffManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [tab, setTab] = useState<Tab>('active');

  // ── Pending staff ──
  const {
    data: pendingStaff,
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = usePendingStaff();
  const approveStaffMutation = useApproveStaff();
  const rejectStaffMutation = useRejectStaff();
  const [roleSelections, setRoleSelections] = useState<Record<string, string>>({});

  // ── Active staff ──
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<StaffListFilterStatus>('Active');
  const [page, setPage] = useState(1);
  const limit = 15;

  const {
    data: staffListData,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useStaffList({
    page,
    limit,
    status: statusFilter,
    role: roleFilter || undefined,
    search: searchTerm.trim() || undefined,
  });

  // ── Modals ──
  const [editTarget, setEditTarget] = useState<StaffListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffListItem | null>(null);

  const deleteMutation = useDeleteStaff();
  const restoreMutation = useRestoreStaff();

  const handleDeleteConfirm = (reason?: string) => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { staffId: deleteTarget.id, reason },
      { onSettled: () => setDeleteTarget(null) },
    );
  };

  const handleRestore = (staffId: string) => {
    restoreMutation.mutate(staffId);
  };

  // ── Derived: counts for tab labels ──
  const pendingCount = pendingStaff?.length ?? 0;
  const activeCount = staffListData?.total ?? 0;

  // ── Role badge variant ──
  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'TeamLeader':
        return 'primary';
      case 'Physician':
        return 'success';
      case 'Nurse':
        return 'warning';
      default:
        return 'default';
    }
  };

  // ── Reset page when filters change ──
  const handleFilterChange = (
    setter: (v: any) => void,
    value: any,
  ) => {
    setter(value);
    setPage(1);
  };

  // ── Tab label component ──
  const TabButton: React.FC<{
    id: Tab;
    label: string;
    count: number;
  }> = ({ id, label, count }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={
        'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ' +
        (tab === id
          ? 'text-primary border-primary'
          : 'text-text-secondary border-transparent hover:text-on-surface')
      }
    >
      {label}
      {count > 0 && (
        <span
          className={
            'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ' +
            (id === 'pending'
              ? 'bg-warning text-white'
              : 'bg-surface-container text-text-secondary')
          }
        >
          {count}
        </span>
      )}
    </button>
  );

  // ─────────────────────────────────────────────────────────
  // Loading / error at the page level — only block on the
  // tab that's actually shown.
  // ─────────────────────────────────────────────────────────
  if (tab === 'pending' && pendingLoading) return <PageLoader />;
  if (tab === 'pending' && pendingError)
    return <ErrorState onRetry={refetchPending} />;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <BackButton to="/admin" label="Dashboard" />
          <h1 className="text-2xl font-bold text-on-surface">Staff Management</h1>
          <p className="text-sm text-text-secondary">
            Manage active staff and pending registrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="warning">{pendingCount} pending</Badge>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-border-base">
        <TabButton id="active" label="Active Staff" count={activeCount} />
        <TabButton id="pending" label="Pending Approvals" count={pendingCount} />
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* Active Staff tab                                      */}
      {/* ══════════════════════════════════════════════════════ */}
      {tab === 'active' && (
        <Card padding="none">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 p-4 border-b border-border-base">
            <Input
              placeholder="Search by name, email, or phone…"
              leftIcon={<Search size={15} />}
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              className="w-72"
            />
            <Select
              options={[
                { value: '', label: 'All Roles' },
                { value: 'TeamLeader', label: 'Team Leader' },
                { value: 'Physician', label: 'Physician' },
                { value: 'Nurse', label: 'Nurse' },
              ]}
              value={roleFilter}
              onChange={(e) =>
                handleFilterChange(setRoleFilter, e.target.value as StaffRole | '')
              }
              className="w-40"
            />
            <Select
              options={[
                
                { value: 'Active', label: 'Active' },
                { value: 'All', label: 'All statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Rejected', label: 'Rejected' },
                { value: 'Deleted', label: 'Deleted' },
              ]}
              value={statusFilter}
              onChange={(e) =>
                handleFilterChange(
                  setStatusFilter,
                  e.target.value as StaffListFilterStatus,
                )
              }
              className="w-40"
            />
          </div>

          {/* Table */}
          {listLoading ? (
            <div className="p-5">
              <SkeletonTable rows={6} />
            </div>
          ) : listError ? (
            <ErrorState onRetry={refetchList} />
          ) : !staffListData?.items.length ? (
            <EmptyState
              title={
                statusFilter === 'Deleted'
                  ? 'No deleted staff'
                  : 'No staff members found'
              }
              description={
                statusFilter === 'Deleted'
                  ? 'Deleted staff members will appear here so you can restore them.'
                  : 'Try adjusting your filters, or approve pending registrations.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-low border-b border-border-base">
                  <tr>
                    {[
                      'Name',
                      'Email',
                      'Phone',
                      'Role',
                      'Status',
                      'Joined',
                      'Actions',
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
                  {staffListData.items.map((staff) => {
                    const isDeleted = !!staff.deletedAt;
                    return (
                      <tr
                        key={staff.id}
                        className={
                          'transition-colors ' +
                          (isDeleted
                            ? 'bg-error-bg/20 hover:bg-error-bg/30'
                            : 'hover:bg-surface-low/50')
                        }
                      >
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-on-surface">
                              {staff.name}
                            </p>
                            <p className="text-xs text-text-muted font-mono">
                              {staff.id.slice(-8)}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-text-secondary">
                          {staff.email}
                        </td>
                        <td className="px-5 py-3.5 text-text-secondary">
                          {staff.phone}
                        </td>
                        <td className="px-5 py-3.5">
                          {staff.role ? (
                            <Badge variant={getRoleBadgeVariant(staff.role)}>
                              {ROLE_LABELS[staff.role] ?? staff.role}
                            </Badge>
                          ) : (
                            <span className="text-text-muted text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {isDeleted ? (
                            <Badge variant="error">Deleted</Badge>
                          ) : (
                            <StatusBadge status={staff.status} type="staff" />
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-text-muted text-xs">
                          {formatRelativeTime(staff.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {isDeleted ? (
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<RotateCcw size={12} />}
                                loading={
                                  restoreMutation.isPending &&
                                  restoreMutation.variables === staff.id
                                }
                                onClick={() => handleRestore(staff.id)}
                                className="text-xs"
                              >
                                Restore
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<Pencil size={12} />}
                                  className="text-xs"
                                  onClick={() => setEditTarget(staff)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="text-xs"
                                  leftIcon={<Trash2 size={12} />}
                                  onClick={() => setDeleteTarget(staff)}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {staffListData && staffListData.total > limit && (
            <div className="px-5 py-4 border-t border-border-base">
              <Pagination
                page={page}
                total={staffListData.total}
                limit={limit}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* Pending Approvals tab                                 */}
      {/* ══════════════════════════════════════════════════════ */}
      {tab === 'pending' && (
        <Card padding="none">
          <div className="px-5 py-4 border-b border-border-base">
            <h3 className="text-sm font-semibold text-on-surface">
              Pending Approvals
            </h3>
          </div>

          {!pendingStaff?.length ? (
            <div className="p-5 text-sm text-text-muted text-center">
              No pending staff registrations
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-low border-b border-border-base">
                  <tr>
                    {[
                      'Name',
                      'Email',
                      'Phone',
                      'Registered',
                      'Assign Role',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {pendingStaff.map((staff) => (
                    <tr
                      key={staff.id}
                      className="hover:bg-surface-low/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-on-surface">
                            {staff.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {staff.isEmailVerified
                              ? 'Email verified'
                              : 'Email not verified'}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {staff.email}
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {staff.phone}
                      </td>
                      <td className="px-5 py-4 text-text-muted text-xs">
                        {formatRelativeTime(staff.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <Select
                          options={[
                            { value: 'TeamLeader', label: 'Team Leader' },
                            { value: 'Physician', label: 'Physician' },
                            { value: 'Nurse', label: 'Nurse' },
                          ]}
                          placeholder="Select role…"
                          value={roleSelections[staff.id] || ''}
                          onChange={(e) =>
                            setRoleSelections((prev) => ({
                              ...prev,
                              [staff.id]: e.target.value,
                            }))
                          }
                          className="w-36 text-xs"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            leftIcon={<UserCheck size={13} />}
                            disabled={!roleSelections[staff.id]}
                            loading={approveStaffMutation.isPending}
                            onClick={() => {
                              if (roleSelections[staff.id]) {
                                approveStaffMutation.mutate({
                                  staffId: staff.id,
                                  data: {
                                    role: roleSelections[
                                      staff.id
                                    ] as 'TeamLeader' | 'Physician' | 'Nurse',
                                  },
                                });
                              }
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            leftIcon={<UserX size={13} />}
                            loading={rejectStaffMutation.isPending}
                            onClick={() => rejectStaffMutation.mutate(staff.id)}
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
        </Card>
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <StaffEditModal
          staff={{
            id: editTarget.id,
            name: editTarget.name,
            email: editTarget.email,
            phone: editTarget.phone,
            role: editTarget.role,
            status: editTarget.status,
            isEmailVerified: editTarget.isEmailVerified,
            deletedAt: editTarget.deletedAt,
            createdAt: editTarget.createdAt,
            updatedAt: editTarget.updatedAt,
          }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <DeleteConfirmationModal
          staff={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default StaffManagementPage;