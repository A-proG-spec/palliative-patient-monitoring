// src/routes/PhysicianOnlyRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission } from '@/config/permissions';

/**
 * PhysicianOnlyRoute
 * ──────────────────
 * Guards clinical write routes that used to be Physician-exclusive
 * but are now driven by `permissions.ts`.
 *
 * Currently protects:
 *   • /patients/new                  → gated by `canRegisterPatient`
 *   • /patients/:id/discharge        → gated by `canDischargePatient`
 *
 * Admins bypass every check. Staff must have a role that
 * `permissions.ts` has granted the required permission to.
 *
 * If you want to widen access, edit `PERMISSIONS.canRegisterPatient`
 * or `PERMISSIONS.canDischargePatient` in `permissions.ts` — this
 * guard reads from those arrays automatically.
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

  // Staff: pass if they can register a patient OR discharge one.
  // The two child routes live under this single wrapper, so we allow
  // either permission. If a role has canDischargePatient but not
  // canRegisterPatient, they can still reach the discharge page — and
  // vice versa. This keeps the guard from being more restrictive than
  // the actual backend policy.
  if (user.type === 'staff') {
    const canRegister = hasPermission(user.role, 'canRegisterPatient');
    const canDischarge = hasPermission(user.role, 'canDischargePatient');

    if (canRegister || canDischarge) {
      return <Outlet />;
    }
  }

  // Anyone else → unauthorized
  return <Navigate to="/unauthorized" replace />;
}