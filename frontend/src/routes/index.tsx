// src/routes/index.tsx
// Complete router configuration — every route from folder-structure/frontend-structure.md §8

import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { NotFoundPage } from '@/pages/NotFoundPage';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────

// Public
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);

// Auth
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const VerifyEmailPage = lazy(() =>
  import('@/pages/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage }))
);
const ResendVerificationPage = lazy(() =>
  import('@/pages/auth/ResendVerificationPage').then((m) => ({
    default: m.ResendVerificationPage,
  }))
);

// Admin
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  }))
);
const AdminPatientListPage = lazy(() =>
  import('@/pages/admin/AdminPatientListPage').then((m) => ({
    default: m.AdminPatientListPage,
  }))
);
const AdminPatientDetailPage = lazy(() =>
  import('@/pages/admin/AdminPatientDetailPage').then((m) => ({
    default: m.AdminPatientDetailPage,
  }))
);
const StaffManagementPage = lazy(() =>
  import('@/pages/admin/StaffManagementPage').then((m) => ({
    default: m.StaffManagementPage,
  }))
);
const ReferralManagementPage = lazy(() =>
  import('@/pages/admin/ReferralManagementPage').then((m) => ({
    default: m.ReferralManagementPage,
  }))
);
const ReportsPage = lazy(() =>
  import('@/pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const SettingsPage = lazy(() =>
  import('@/pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

// Staff
const DashboardPage = lazy(() =>
  import('@/pages/staff/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const PatientListPage = lazy(() =>
  import('@/pages/staff/PatientListPage').then((m) => ({
    default: m.PatientListPage,
  }))
);
const PatientRegistrationPage = lazy(() =>
  import('@/pages/staff/PatientRegistrationPage').then((m) => ({
    default: m.PatientRegistrationPage,
  }))
);
const PatientDetailPage = lazy(() =>
  import('@/pages/staff/PatientDetailPage').then((m) => ({
    default: m.PatientDetailPage,
  }))
);
const PatientSummaryPage = lazy(() =>
  import('@/pages/staff/PatientSummaryPage').then((m) => ({
    default: m.PatientSummaryPage,
  }))
);
const RecordVisitPage = lazy(() =>
  import('@/pages/staff/RecordVisitPage').then((m) => ({
    default: m.RecordVisitPage,
  }))
);
const OrderMedicationPage = lazy(() =>
  import('@/pages/staff/OrderMedicationPage').then((m) => ({
    default: m.OrderMedicationPage,
  }))
);
const OrderLabPage = lazy(() =>
  import('@/pages/staff/OrderLabPage').then((m) => ({ default: m.OrderLabPage }))
);
const RequestReferralPage = lazy(() =>
  import('@/pages/staff/RequestReferralPage').then((m) => ({
    default: m.RequestReferralPage,
  }))
);
const RecordAdmissionPage = lazy(() =>
  import('@/pages/staff/RecordAdmissionPage').then((m) => ({
    default: m.RecordAdmissionPage,
  }))
);

// ─── Suspense wrapper ─────────────────────────────────────────────────────────

const S = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// ─── Router ───────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  // ── Landing (public, no redirect) ─────────────────────────────────────────
  {
    path: '/',
    element: S(LandingPage),
  },

  // ── Auth pages (redirect away if already logged in) ────────────────────────
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login',    element: S(LoginPage) },
          { path: '/register', element: S(RegisterPage) },
        ],
      },
    ],
  },

  // ── Email-verification pages (fully public — no redirect) ──────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/verify-email',       element: S(VerifyEmailPage) },
      { path: '/resend-verification', element: S(ResendVerificationPage) },
    ],
  },

  // ── Authenticated — DashboardLayout wrapper ────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [

          // ── Admin routes ─────────────────────────────────────────────────
          { path: '/admin',                          element: S(AdminDashboardPage) },
          { path: '/admin/patients',                 element: S(AdminPatientListPage) },
          { path: '/admin/patients/:patientId',      element: S(AdminPatientDetailPage) },
          { path: '/admin/staff',                    element: S(StaffManagementPage) },
          { path: '/admin/referrals',                element: S(ReferralManagementPage) },
          { path: '/admin/reports',                  element: S(ReportsPage) },
          { path: '/admin/settings',                 element: S(SettingsPage) },

          // ── Staff routes ──────────────────────────────────────────────────
          { path: '/dashboard',                             element: S(DashboardPage) },
          { path: '/patients',                              element: S(PatientListPage) },
          { path: '/patients/new',                          element: S(PatientRegistrationPage) },
          { path: '/patients/:patientId',                   element: S(PatientDetailPage) },
          { path: '/patients/:patientId/summary',           element: S(PatientSummaryPage) },
          { path: '/patients/:patientId/visits',            element: S(RecordVisitPage) },
          { path: '/patients/:patientId/medications',       element: S(OrderMedicationPage) },
          { path: '/patients/:patientId/labs',              element: S(OrderLabPage) },
          { path: '/patients/:patientId/referrals',         element: S(RequestReferralPage) },
          { path: '/patients/:patientId/admissions',        element: S(RecordAdmissionPage) },
        ],
      },
    ],
  },

  // ── 404 ───────────────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
]);

// ─── Provider export ──────────────────────────────────────────────────────────

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
