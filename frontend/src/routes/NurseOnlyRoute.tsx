// src/routes/NurseOnlyRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { hasPermission } from '@/config/permissions';

/**
 * NurseOnlyRoute
 * ──────────────
 * Guards hospice-nursing routes.
 *
 * Driven by `PERMISSIONS.canRecordHospiceNursing` in
 * `permissions.ts`. Today that array contains only 'Nurse', so this
 * guard behaves exactly like before — but if you ever widen the
 * permission, this guard picks it up automatically.
 *
 * Admins bypass every check.
 */
const NurseOnlyRoute: React.FC = () => {
  const { isAuthenticated, user, isInitializing } = useAuthStore();

  if (isInitializing) return <PageLoader />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  // Admins bypass
  if (user.type === 'admin') return <Outlet />;

  if (
    user.type === 'staff' &&
    hasPermission(user.role, 'canRecordHospiceNursing')
  ) {
    return <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default NurseOnlyRoute;