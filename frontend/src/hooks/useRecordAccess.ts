import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission } from '@/config/permissions';
import { RECORD_ROLES, type RecordRoleKey } from '@/config/recordRoles';

export interface UseRecordAccessResult {
  /** true if the current user can write this record type. */
  allowed: boolean;
  /** Human-readable reason when `allowed` is false. */
  reason: string | null;
  /** Eligible roles for tooltips / banners. */
  eligibleRoles: string[];
  isAdmin: boolean;
  role: string | null;
}

/**
 * useRecordAccess
 * ───────────────
 * Answers "can the currently logged-in user author this record type?".
 *
 *   allowed   → admin bypass OR role ∈ RECORD_ROLES[key]
 *   reason    → why not (for tooltip / banner text)
 */
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

    if (isAdmin) {
      return { allowed: true, reason: null, eligibleRoles, isAdmin: true, role: null };
    }

    if (!role) {
      return {
        allowed: false,
        reason: 'Your account has no assigned role. Ask an administrator to assign one.',
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

/** Variant for arbitrary permission keys. */
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