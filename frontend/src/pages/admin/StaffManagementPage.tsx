import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, UserX, Trash2, UserPlus, Search, Filter, MoreVertical } from 'lucide-react';
import { usePendingStaff, useApproveStaff, useRejectStaff } from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants';
import { useToast } from '@/context/ToastContext';

// ── Mock data for active staff ──────────────────────────────────
// In a real app, this would come from an API endpoint
const MOCK_ACTIVE_STAFF = [
  { id: 'staff-001', name: 'John Doe', email: 'john@gmail.com', phone: '+251911234567', role: 'Physician' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-01-15T08:00:00Z' },
  { id: 'staff-002', name: 'Dr. Tigist Alemu', email: 'tigist@hospital.et', phone: '+251922345678', role: 'TeamLeader' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-01-20T08:00:00Z' },
  { id: 'staff-003', name: 'Nurse Selam Bekele', email: 'selam@hospital.et', phone: '+251933456789', role: 'Nurse' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-02-01T08:00:00Z' },
  { id: 'staff-004', name: 'Dr. Abebe Kebede', email: 'abebe@hospital.et', phone: '+251944567890', role: 'Physician' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-03-15T08:00:00Z' },
  { id: 'staff-005', name: 'Nurse Sara Tadesse', email: 'sara@hospital.et', phone: '+251955678901', role: 'Nurse' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-04-01T08:00:00Z' },
];

// ── Delete Confirmation Modal ────────────────────────────────────
interface DeleteModalProps {
  staff: typeof MOCK_ACTIVE_STAFF[0] | null;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ staff, onConfirm, onCancel, isPending }) => {
  if (!staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-bg text-error mb-4">
          <UserX size={24} />
        </div>
        <h2 className="text-lg font-semibold text-on-surface mb-2">Delete Staff Member</h2>
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to delete <strong>{staff.name}</strong>? 
          This action cannot be undone and will remove all their access to the system.
        </p>
        <div className="bg-surface-low p-3 rounded-lg text-sm space-y-1 mb-6">
          <div><span className="text-text-muted">Email:</span> <span className="text-on-surface">{staff.email}</span></div>
          <div><span className="text-text-muted">Role:</span> <span className="text-on-surface">{ROLE_LABELS[staff.role]}</span></div>
        </div>
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
            onClick={onConfirm}
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

const StaffManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const isAdmin = user?.type === 'admin';

  // ── Pending staff (existing functionality) ──
  const { data: pendingStaff, isLoading: pendingLoading, error: pendingError, refetch: refetchPending } = usePendingStaff();
  const approveStaffMutation = useApproveStaff();
  const rejectStaffMutation = useRejectStaff();

  // ── Active staff state ──
  const [activeStaff, setActiveStaff] = useState(MOCK_ACTIVE_STAFF);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // ── Delete modal state ──
  const [deleteTarget, setDeleteTarget] = useState<typeof MOCK_ACTIVE_STAFF[0] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [roleSelections, setRoleSelections] = useState<Record<string, string>>({});

  // ── Filter active staff ──
  const filteredActiveStaff = activeStaff.filter((staff) => {
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? staff.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // ── Handle delete ──
  const handleDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    
    // Simulate API call
    setTimeout(() => {
      setActiveStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success(`Staff member ${deleteTarget.name} deleted successfully.`);
      setDeleteTarget(null);
      setIsDeleting(false);
    }, 600);
  };

  // ── Handle role badge color ──
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'TeamLeader': return 'primary';
      case 'Physician': return 'success';
      case 'Nurse': return 'warning';
      default: return 'default';
    }
  };

  if (pendingLoading) return <PageLoader />;
  if (pendingError) return <ErrorState onRetry={refetchPending} />;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <BackButton to="/admin" label="Dashboard" />
          <h1 className="text-2xl font-bold text-on-surface">Staff Management</h1>
          <p className="text-sm text-text-secondary">Manage active staff and pending registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<UserPlus size={14} />}
            onClick={() => navigate('/register')}
          >
            Register New Staff
          </Button>
          {(pendingStaff?.length ?? 0) > 0 && (
            <Badge variant="warning">{pendingStaff?.length} pending</Badge>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-border-base">
        <div className="px-4 py-2.5 text-sm font-medium text-primary border-b-2 border-primary">
          Active Staff ({filteredActiveStaff.length})
        </div>
        <div className="px-4 py-2.5 text-sm font-medium text-text-secondary">
          Pending Approvals ({pendingStaff?.length || 0})
        </div>
      </div>

      {/* ── Active Staff Section ── */}
      <Card padding="none">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 border-b border-border-base">
          <Input
            placeholder="Search by name or email..."
            leftIcon={<Search size={15} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select
            options={[
              { value: '', label: 'All Roles' },
              { value: 'TeamLeader', label: 'Team Leader' },
              { value: 'Physician', label: 'Physician' },
              { value: 'Nurse', label: 'Nurse' },
            ]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-40"
          />
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-low border-b border-border-base">
              <tr>
                {['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {filteredActiveStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-muted">
                    No staff members found
                  </td>
                </tr>
              ) : (
                filteredActiveStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-on-surface">{staff.name}</p>
                        <p className="text-xs text-text-muted">{staff.id}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">{staff.email}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{staff.phone}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={getRoleBadgeVariant(staff.role)}>
                        {ROLE_LABELS[staff.role] || staff.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={staff.status} type="staff" />
                    </td>
                    <td className="px-5 py-3.5 text-text-muted text-xs">
                      {formatRelativeTime(staff.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => navigate(`/admin/staff/${staff.id}/edit`)}
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Pending Staff Section ── */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-border-base">
          <h3 className="text-sm font-semibold text-on-surface">
            Pending Approvals 
            {pendingStaff && pendingStaff.length > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-warning text-[10px] font-bold text-white px-1.5">
                {pendingStaff.length}
              </span>
            )}
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
                  {['Name', 'Email', 'Phone', 'Registered', 'Assign Role', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {pendingStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface-low/40 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-on-surface">{staff.name}</p>
                        <p className="text-xs text-text-muted">
                          {staff.isEmailVerified ? '✓ Email verified' : '⚠ Email not verified'}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">{staff.email}</td>
                    <td className="px-5 py-4 text-text-secondary">{staff.phone}</td>
                    <td className="px-5 py-4 text-text-muted text-xs">{formatRelativeTime(staff.createdAt)}</td>
                    <td className="px-5 py-4">
                      <Select
                        options={[
                          { value: 'TeamLeader', label: 'Team Leader' },
                          { value: 'Physician', label: 'Physician' },
                          { value: 'Nurse', label: 'Nurse' },
                        ]}
                        placeholder="Select role…"
                        value={roleSelections[staff.id] || ''}
                        onChange={(e) => setRoleSelections((prev) => ({ ...prev, [staff.id]: e.target.value }))}
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
                                data: { role: roleSelections[staff.id] as 'TeamLeader' | 'Physician' | 'Nurse' }
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

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <DeleteConfirmationModal
          staff={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </div>
  );
};

export default StaffManagementPage;