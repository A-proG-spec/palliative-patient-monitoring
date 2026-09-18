import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { hasRole } from '@/lib/utils';
import { PageLoader } from '@/components/common/LoadingSpinner';

/**
 * Route guard that restricts access to Physician role only.
 * Used for patient registration and editing routes.
 * 
 * Handles auth loading state to prevent redirect flash on hard refresh.
 */
const PhysicianOnlyRoute: React.FC = () => {
  const { isAuthenticated, user, isInitializing } = useAuthStore();

  // While auth is loading, show loading state (prevents flash of Unauthorized)
  if (isInitializing) {
    return <PageLoader />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Not staff - redirect to unauthorized
  if (user.type !== 'staff') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Not a Physician - redirect to unauthorized
  if (!hasRole(user, 'Physician')) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Physician - allow access
  return <Outlet />;
};

export default PhysicianOnlyRoute;
