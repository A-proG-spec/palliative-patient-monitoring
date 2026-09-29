// src/routes/RoleGuard.tsx
import { Outlet } from 'react-router-dom';

/**
 * RoleGuard — a pass-through layout route.
 *
 * Role enforcement is delegated to the specific route guards:
 *   - <PhysicianOnlyRoute />
 *   - <NurseOnlyRoute />
 *   - <PharmacistOnlyRoute />
 *   - <LabTechnicianOnlyRoute />
 *   - <RadiologistOnlyRoute />
 *
 * Each of those wraps only the routes it protects, so this guard
 * only needs to render its outlet. Previously this file enforced
 * a path allowlist, which blocked newly-added routes like
 * /patients/:id/discharge.
 */
export default function RoleGuard() {
  return <Outlet />;
}