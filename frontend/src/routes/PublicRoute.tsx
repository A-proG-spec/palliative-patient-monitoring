import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

/**
 * Redirects already-authenticated users to their role-appropriate home page.
 *
 * Admin            → /admin
 * Pharmacist       → /medication-orders  (queue)
 * LabTechnician    → /lab-requests       (queue)
 * Radiologist      → /imaging-orders     (queue)
 * Physician / Nurse / TeamLeader → /dashboard
 */
function getDefaultRoute(user: { type: string; role?: string | null }): string {
  if (user.type === 'admin') return '/admin';

  switch (user.role) {
    case 'Pharmacist':   return '/medication-orders';
    case 'LabTechnician': return '/lab-requests';
    case 'Radiologist':  return '/imaging-orders';
    default:             return '/dashboard';
  }
}

const PublicRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRoute(user)} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
