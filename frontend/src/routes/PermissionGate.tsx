// src/routes/PermissionGate.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission } from '@/config/permissions';
import { PageLoader } from '@/components/common/LoadingSpinner';

interface PermissionGateProps {
  /**
   * One permission key (must exist in `PERMISSIONS` in permissions.ts)
   * OR an array of keys. If an array, the user passes if they have
   * ANY of them (OR logic).
   */
  permission: string | string[];

  /**
   * Where to redirect when the user is signed in but lacks the
   * permission. Defaults to `/unauthorized`. Pass `-1` to use a
   * history back() semantics-like fallback via the location state
   * (we just use React Router's `<Navigate to="/patients">` when
   * you set `fallbackTo`).
   */
  fallbackTo?: string;
}

/**
 * PermissionGate
 * ──────────────
 * A route-level guard that reads from `permissions.ts`.
 *
 * Usage in routes/index.tsx:
 *
 *   <Route element={<PermissionGate permission="canRecordVisit" />}>
 *     <Route path="/patients/:id/visits" element={<RecordVisitPage />} />
 *   </Route>
 *
 * Admins bypass the check.
 * Unauthenticated users are sent to /login.
 * Authenticated users without the permission go to `fallbackTo`
 * (default `/unauthorized`).
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  fallbackTo = '/unauthorized',
}) => {
  const { isAuthenticated, user, isInitializing } = useAuthStore();
  const location = useLocation();

  if (isInitializing) return <PageLoader />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin bypass
  if (user.type === 'admin') return <Outlet />;

  // Staff: pass if they have any of the listed permissions
  if (user.type === 'staff') {
    const keys = Array.isArray(permission) ? permission : [permission];
    const allowed = keys.some((key) =>
      hasPermission(user.role, key),
    );
    if (allowed) return <Outlet />;
  }

  return <Navigate to={fallbackTo} replace />;
};

export default PermissionGate;