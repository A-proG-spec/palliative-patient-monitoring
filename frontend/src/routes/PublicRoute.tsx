import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import type { StaffRole } from '@/types/auth.types';

/**
 * Redirects already-authenticated users to their role-appropriate home page.
 *
 * Admin                → /admin
 * Pharmacist           → /medication-orders  (queue)
 * LaboratoryTechnician → /lab-requests       (queue)
 * Radiologist          → /imaging-orders     (queue)
 * Physician / Nurse / TeamLeader → /dashboard
 *
 * NOTE: the backend enum is `LaboratoryTechnician` (long form). The
 * short form `LabTechnician` would silently fall through to the
 * default case and send lab techs to /dashboard.
 */
function getDefaultRoute(user: { type: string; role?: StaffRole | null }): string {
  if (user.type === 'admin') return '/admin';

  switch (user.role) {
    case 'Pharmacist':
      return '/medication-orders';
    case 'LaboratoryTechnician':
      return '/lab-requests';
    case 'Radiologist':
      return '/imaging-orders';
    case 'Physician':
    case 'Nurse':
    case 'TeamLeader':
    default:
      return '/dashboard';
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