import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/common/LoadingSpinner';

/**
 * RoleGuard: Wraps all staff routes.
 * - Redirects Pending / Rejected staff to /unauthorized.
 * - Handles isInitializing to prevent redirect flash on hard refresh.
 * - Does NOT restrict by specific role — each page/component handles
 *   fine-grained role logic (sidebar, buttons, etc.) via permissions.ts.
 */
const RoleGuard: React.FC = () => {
  const { isAuthenticated, user, isInitializing } = useAuthStore();
  const location = useLocation();

  // While auth is resolving show a loader (prevents flash)
  if (isInitializing) return <PageLoader />;

  // Not authenticated – send to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Must be a staff user
  if (user.type !== 'staff') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Staff whose account hasn't been approved yet
  if (user.status === 'Pending' || user.status === 'Rejected') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
