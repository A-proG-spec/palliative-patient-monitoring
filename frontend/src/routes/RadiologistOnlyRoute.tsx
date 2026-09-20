import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/common/LoadingSpinner';

/**
 * RadiologistOnlyRoute
 * Restricts access to users with `role === 'Radiologist'`.
 */
const RadiologistOnlyRoute: React.FC = () => {
  const { isAuthenticated, user, isInitializing } = useAuthStore();

  if (isInitializing) return <PageLoader />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.type !== 'staff') return <Navigate to="/unauthorized" replace />;
  if (user.role !== 'Radiologist') return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default RadiologistOnlyRoute;