import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/common/LoadingSpinner';

/**
 * NurseOnlyRoute
 * Restricts access to users with `role === 'Nurse'`.
 * Mirrors PhysicianOnlyRoute for symmetry.
 */
const NurseOnlyRoute: React.FC = () => {
  const { isAuthenticated, user, isInitializing } = useAuthStore();

  if (isInitializing) return <PageLoader />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.type !== 'staff') return <Navigate to="/unauthorized" replace />;
  if (user.role !== 'Nurse') return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default NurseOnlyRoute;