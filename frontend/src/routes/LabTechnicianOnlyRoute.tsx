import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/common/LoadingSpinner';

/**
 * LabTechnicianOnlyRoute
 * Restricts access to users with `role === 'LaboratoryTechnician'`.
 *
 * ⚠️ The backend enum value is `LaboratoryTechnician` (long form),
 * not `LabTechnician`. Make sure your `User['role']` type and the
 * value returned by `/auth/me` both use the long form. If you've
 * been using the short form elsewhere, normalize it in the auth
 * store or fix the type — but do NOT change this string without
 * also changing the backend enum.
 */
const LabTechnicianOnlyRoute: React.FC = () => {
  const { isAuthenticated, user, isInitializing } = useAuthStore();

  if (isInitializing) return <PageLoader />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.type !== 'staff') return <Navigate to="/unauthorized" replace />;
  if (user.role !== 'LaboratoryTechnician') return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default LabTechnicianOnlyRoute;