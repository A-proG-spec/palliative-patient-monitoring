import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission } from '@/config/permissions';
import { RECORD_ROLES, type RecordRoleKey } from '@/config/recordRoles';

export interface UseRecordAccessResult {
  allowed: boolean;
  reason: string | null;
  eligibleRoles: string[];
  isAdmin: boolean;
  role: string | null;
}

export function useRecordAccess(recordKey: RecordRoleKey): UseRecordAccessResult {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    const isAdmin = user?.type === 'admin';
    const role = user?.type === 'staff' ? user.role ?? null : null;
    const eligibleRoles = RECORD_ROLES[recordKey] ?? [];

    if (!user) {
      return {
        allowed: false,
        reason: 'You must be signed in to write this record.',
        eligibleRoles,
        isAdmin: false,
        role: null,
      };
    }

    // ── Admin bypasses the record-role check entirely ──
    if (isAdmin) {
      return { allowed: true, reason: null, eligibleRoles, isAdmin: true, role: null };
    }

    if (!role) {
      return {
        allowed: false,
        reason:
          'Your account has no assigned role. Ask an administrator to assign one.',
        eligibleRoles,
        isAdmin: false,
        role: null,
      };
    }

    const allowed = eligibleRoles.includes(role);
    return {
      allowed,
      reason: allowed
        ? null
        : `Your role (${role}) is not permitted to write this record.`,
      eligibleRoles,
      isAdmin: false,
      role,
    };
  }, [user, recordKey]);
}

export function usePermissionAccess(permission: string): {
  allowed: boolean;
  isAdmin: boolean;
  role: string | null;
} {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => {
    const isAdmin = user?.type === 'admin';
    const role = user?.type === 'staff' ? user.role ?? null : null;
    return {
      allowed: isAdmin || hasPermission(role, permission),
      isAdmin,
      role,
    };
  }, [user, permission]);
}