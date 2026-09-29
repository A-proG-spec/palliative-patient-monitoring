// src/routes/PhysicianOnlyRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

/**
 * Guards routes that only Physicians (and admins) should reach.
 *
 * Used for:
 *   - /patients/new
 *   - /patients/:id/discharge
 */
export default function PhysicianOnlyRoute() {
  const { user } = useAuthStore();

  // Not logged in → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admins bypass the role check
  if (user.type === 'admin') {
    return <Outlet />;
  }

  // Staff must have the exact Physician role
  if (user.type === 'staff' && user.role === 'Physician') {
    return <Outlet />;
  }

  // Anyone else → unauthorized
  return <Navigate to="/unauthorized" replace />;
}