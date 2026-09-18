import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageLoader } from '@/components/common/LoadingSpinner';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import { PublicLayout, AuthLayout, DashboardLayout, PrintLayout } from '@/components/layouts';

// ── Lazy-load every page ─────────────────────────────────────────

// Public
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ResendVerificationPage = lazy(() => import('@/pages/auth/ResendVerificationPage'));

// Profile
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

// Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminPatientListPage = lazy(() => import('@/pages/admin/AdminPatientListPage'));
const AdminPatientDetailPage = lazy(() => import('@/pages/admin/AdminPatientDetailPage'));
const DischargePatientPage = lazy(() => import('@/pages/admin/DischargePatientPage'));
const StaffManagementPage = lazy(() => import('@/pages/admin/StaffManagementPage'));
const StaffPerformanceDetailPage = lazy(() => import('@/pages/admin/StaffPerformanceDetailPage'));
const ReferralManagementPage = lazy(() => import('@/pages/admin/ReferralManagementPage'));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

// Staff
const DashboardPage = lazy(() => import('@/pages/staff/DashboardPage'));
// VisitsListPage removed - no longer imported
const PatientListPage = lazy(() => import('@/pages/staff/PatientListPage'));
const PatientRegistrationPage = lazy(() => import('@/pages/staff/PatientRegistrationPage'));
const PatientDetailPage = lazy(() => import('@/pages/staff/PatientDetailPage'));
const PatientSummaryPage = lazy(() => import('@/pages/staff/PatientSummaryPage'));
const PatientProgressPage = lazy(() => import('@/pages/staff/PatientProgressPage'));
const RecordVisitPage = lazy(() => import('@/pages/staff/RecordVisitPage'));
const VisitDetailPage = lazy(() => import('@/pages/staff/VisitDetailPage'));
const OrderMedicationPage = lazy(() => import('@/pages/staff/OrderMedicationPage'));
const MedicationDetailPage = lazy(() => import('@/pages/staff/MedicationDetailPage'));
const OrderLabPage = lazy(() => import('@/pages/staff/OrderLabPage'));
const LabDetailPage = lazy(() => import('@/pages/staff/LabDetailPage'));
const RequestReferralPage = lazy(() => import('@/pages/staff/RequestReferralPage'));
const ReferralDetailPage = lazy(() => import('@/pages/staff/ReferralDetailPage'));
const RecordAdmissionPage = lazy(() => import('@/pages/staff/RecordAdmissionPage'));
const AdmissionDetailPage = lazy(() => import('@/pages/staff/AdmissionDetailPage'));
const OrderImagingPage = lazy(() => import('@/pages/staff/OrderImagingPage'));
const ImagingDetailPage = lazy(() => import('@/pages/staff/ImagingDetailPage'));
const RecordProgressNotePage = lazy(() => import('@/pages/staff/RecordProgressNotePage'));

// Role-specific queues
const MedicationOrdersPage = lazy(() => import('@/pages/staff/MedicationOrdersPage'));
const MedicationOrderDetailPage = lazy(() => import('@/pages/staff/MedicationOrderDetailPage'));
const LabRequestsPage = lazy(() => import('@/pages/staff/LabRequestsPage'));
const LabRequestDetailPage = lazy(() => import('@/pages/staff/LabRequestDetailPage'));
const ImagingOrdersPage = lazy(() => import('@/pages/staff/ImagingOrdersPage'));
const ImagingOrderDetailPage = lazy(() => import('@/pages/staff/ImagingOrderDetailPage'));

// Print
const PatientPrintPage = lazy(() => import('@/pages/PatientPrintPage'));

// ── Suspense wrapper ─────────────────────────────────────────────
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// ── Routes ────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => (
  <Routes>
    {/* ── Public Landing ── */}
    <Route path="/" element={<S><LandingPage /></S>} />

    {/* ── Auth Pages (redirect if already logged in) ── */}
    <Route element={<PublicRoute />}>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<S><LoginPage /></S>} />
        <Route path="/register" element={<S><RegisterPage /></S>} />
      </Route>
      <Route path="/verify-email" element={<S><VerifyEmailPage /></S>} />
      <Route path="/resend-verification" element={<S><ResendVerificationPage /></S>} />
    </Route>

    {/* ── Unauthorized (public) ── */}
    <Route path="/unauthorized" element={<S><UnauthorizedPage /></S>} />

    {/* ── Admin Routes ── */}
    <Route element={<ProtectedRoute role="admin" />}>
      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<S><AdminDashboardPage /></S>} />
        <Route path="/admin/patients" element={<S><AdminPatientListPage /></S>} />
        <Route path="/admin/patients/:patientId" element={<S><AdminPatientDetailPage /></S>} />
        <Route path="/admin/patients/:patientId/discharge" element={<S><DischargePatientPage /></S>} />
        
        {/* Admin sub-record detail routes (reuse staff pages) */}
        <Route path="/admin/patients/:id/visits/:visitId" element={<S><VisitDetailPage /></S>} />
        <Route path="/admin/patients/:id/medications/:medicationId" element={<S><MedicationDetailPage /></S>} />
        <Route path="/admin/patients/:id/labs/:labId" element={<S><LabDetailPage /></S>} />
        <Route path="/admin/patients/:id/imaging/:imagingId" element={<S><ImagingDetailPage /></S>} />
        <Route path="/admin/patients/:id/referrals/:referralId" element={<S><ReferralDetailPage /></S>} />
        <Route path="/admin/patients/:id/admissions/:admissionId" element={<S><AdmissionDetailPage /></S>} />
        
        <Route path="/admin/staff" element={<S><StaffManagementPage /></S>} />
        <Route path="/admin/staff/performance/:staffId" element={<S><StaffPerformanceDetailPage /></S>} />
        <Route path="/admin/referrals" element={<S><ReferralManagementPage /></S>} />
        <Route path="/admin/reports" element={<S><ReportsPage /></S>} />
        <Route path="/admin/settings" element={<S><SettingsPage /></S>} />
      </Route>
    </Route>

    {/* ── Staff Routes ── */}
    <Route element={<ProtectedRoute role="staff" />}>
      <Route element={<RoleGuard />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<S><DashboardPage /></S>} />
          
          {/* Patient management */}
          <Route path="/patients" element={<S><PatientListPage /></S>} />
          <Route path="/patients/new" element={<S><PatientRegistrationPage /></S>} />
          <Route path="/patients/:id" element={<S><PatientDetailPage /></S>} />
          <Route path="/patients/:id/summary" element={<S><PatientSummaryPage /></S>} />
          <Route path="/patients/:id/progress" element={<S><PatientProgressPage /></S>} />
          
          {/* Visits - /visits route removed, only patient-specific visit routes remain */}
          <Route path="/patients/:id/visits" element={<S><RecordVisitPage /></S>} />
          <Route path="/patients/:id/visits/:visitId" element={<S><VisitDetailPage /></S>} />
          
          {/* Medications */}
          <Route path="/patients/:id/medications" element={<S><OrderMedicationPage /></S>} />
          <Route path="/patients/:id/medications/:medicationId" element={<S><MedicationDetailPage /></S>} />
          
          {/* Labs */}
          <Route path="/patients/:id/labs" element={<S><OrderLabPage /></S>} />
          <Route path="/patients/:id/labs/:labId" element={<S><LabDetailPage /></S>} />
          
          {/* Imaging */}
          <Route path="/patients/:id/imaging" element={<S><OrderImagingPage /></S>} />
          <Route path="/patients/:id/imaging/:imagingId" element={<S><ImagingDetailPage /></S>} />
          
          {/* Referrals */}
          <Route path="/patients/:id/referrals" element={<S><RequestReferralPage /></S>} />
          <Route path="/patients/:id/referrals/:referralId" element={<S><ReferralDetailPage /></S>} />
          
          {/* Admissions */}
          <Route path="/patients/:id/admissions" element={<S><RecordAdmissionPage /></S>} />
          <Route path="/patients/:id/admissions/:admissionId" element={<S><AdmissionDetailPage /></S>} />

          {/* Progress Notes */}
          <Route path="/patients/:id/progress-note/new" element={<S><RecordProgressNotePage /></S>} />
          <Route path="/patients/:id/progress-note/:noteId/edit" element={<S><RecordProgressNotePage /></S>} />

          {/* Role-specific queues */}
          <Route path="/medication-orders" element={<S><MedicationOrdersPage /></S>} />
          <Route path="/medication-orders/:id" element={<S><MedicationOrderDetailPage /></S>} />
          <Route path="/lab-requests" element={<S><LabRequestsPage /></S>} />
          <Route path="/lab-requests/:id" element={<S><LabRequestDetailPage /></S>} />
          <Route path="/imaging-orders" element={<S><ImagingOrdersPage /></S>} />
          <Route path="/imaging-orders/:id" element={<S><ImagingOrderDetailPage /></S>} />
        </Route>
      </Route>
    </Route>

    {/* ── Profile Route (accessible by both admin AND staff) ── */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/profile" element={<S><ProfilePage /></S>} />
      </Route>
    </Route>

    {/* ── Print Routes (minimal layout) ── */}
    <Route element={<ProtectedRoute />}>
      <Route element={<PrintLayout />}>
        <Route path="/patients/:id/print" element={<S><PatientPrintPage /></S>} />
        <Route path="/admin/patients/:id/print" element={<S><PatientPrintPage /></S>} />
      </Route>
    </Route>

    {/* ── 404 Not Found ── */}
    <Route path="*" element={<S><NotFoundPage /></S>} />
  </Routes>
);

export default AppRoutes;