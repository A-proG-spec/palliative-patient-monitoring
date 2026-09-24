import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageLoader } from '@/components/common/LoadingSpinner';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import PhysicianOnlyRoute from './PhysicianOnlyRoute';
import NurseOnlyRoute from './NurseOnlyRoute';
import PharmacistOnlyRoute from './PharmacistOnlyRoute';
import LabTechnicianOnlyRoute from './LabTechnicianOnlyRoute';
import RadiologistOnlyRoute from './RadiologistOnlyRoute';
import {
  PublicLayout,
  AuthLayout,
  DashboardLayout,
  PrintLayout,
} from '@/components/layouts';

// ── Public ──
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));

// ── Auth ──
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ResendVerificationPage = lazy(
  () => import('@/pages/auth/ResendVerificationPage'),
);

// ── Profile ──
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

// ── Admin ──
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminPatientListPage = lazy(() => import('@/pages/admin/AdminPatientListPage'));
const AdminPatientDetailPage = lazy(
  () => import('@/pages/admin/AdminPatientDetailPage'),
);
const DischargePatientPage = lazy(
  () => import('@/pages/admin/DischargePatientPage'),
);
const StaffManagementPage = lazy(() => import('@/pages/admin/StaffManagementPage'));
const StaffPerformanceDetailPage = lazy(
  () => import('@/pages/admin/StaffPerformanceDetailPage'),
);
const ReferralManagementPage = lazy(
  () => import('@/pages/admin/ReferralManagementPage'),
);
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

// ── Clinical ──
const DashboardPage = lazy(() => import('@/pages/clinical/DashboardPage'));
const PatientListPage = lazy(() => import('@/pages/clinical/PatientListPage'));
const PatientDetailPage = lazy(() => import('@/pages/clinical/PatientDetailPage'));
const PatientSummaryPage = lazy(
  () => import('@/pages/clinical/PatientSummaryPage'),
);
const PatientProgressPage = lazy(
  () => import('@/pages/clinical/PatientProgressPage'),
);
const RecordVisitPage = lazy(() => import('@/pages/clinical/RecordVisitPage'));
const VisitsListPage = lazy(() => import('@/pages/clinical/VisitsListPage'));
const VisitDetailPage = lazy(() => import('@/pages/clinical/VisitDetailPage'));
const OrderMedicationPage = lazy(
  () => import('@/pages/clinical/OrderMedicationPage'),
);
const MedicationDetailPage = lazy(
  () => import('@/pages/clinical/MedicationDetailPage'),
);
const OrderLabPage = lazy(() => import('@/pages/clinical/OrderLabPage'));
const LabDetailPage = lazy(() => import('@/pages/clinical/LabDetailPage'));
const OrderImagingPage = lazy(() => import('@/pages/clinical/OrderImagingPage'));
const ImagingDetailPage = lazy(
  () => import('@/pages/clinical/ImagingDetailPage'),
);
const RequestReferralPage = lazy(
  () => import('@/pages/clinical/RequestReferralPage'),
);
const ReferralDetailPage = lazy(
  () => import('@/pages/clinical/ReferralDetailPage'),
);
const RecordAdmissionPage = lazy(
  () => import('@/pages/clinical/RecordAdmissionPage'),
);
const AdmissionDetailPage = lazy(
  () => import('@/pages/clinical/AdmissionDetailPage'),
);
const RecordProgressNotePage = lazy(
  () => import('@/pages/clinical/RecordProgressNotePage'),
);
const HospiceNursingPage = lazy(
  () => import('@/pages/clinical/HospiceNursingPage'),
);
const HospiceNursingDetailPage = lazy(
  () => import('@/pages/clinical/HospiceNursingDetailPage'),
);

// ═════════════════════════════════════════════════════════════
// NEW: Assessment pages (24 total — 3 per assessment)
// ═════════════════════════════════════════════════════════════

// Pain
const PainAssessmentFormPage   = lazy(() => import('@/pages/assessments/pain/PainAssessmentFormPage'));
const PainAssessmentListPage   = lazy(() => import('@/pages/assessments/pain/PainAssessmentListPage'));
const PainAssessmentDetailPage = lazy(() => import('@/pages/assessments/pain/PainAssessmentDetailPage'));

// Pharmacist
const PharmacistAssessmentFormPage   = lazy(() => import('@/pages/assessments/pharmacist/PharmacistAssessmentFormPage'));
const PharmacistAssessmentListPage   = lazy(() => import('@/pages/assessments/pharmacist/PharmacistAssessmentListPage'));
const PharmacistAssessmentDetailPage = lazy(() => import('@/pages/assessments/pharmacist/PharmacistAssessmentDetailPage'));

// Physiotherapy
const PhysiotherapyAssessmentFormPage   = lazy(() => import('@/pages/assessments/physiotherapy/PhysiotherapyAssessmentFormPage'));
const PhysiotherapyAssessmentListPage   = lazy(() => import('@/pages/assessments/physiotherapy/PhysiotherapyAssessmentListPage'));
const PhysiotherapyAssessmentDetailPage = lazy(() => import('@/pages/assessments/physiotherapy/PhysiotherapyAssessmentDetailPage'));

// Family
const FamilyAssessmentFormPage   = lazy(() => import('@/pages/assessments/family/FamilyAssessmentFormPage'));
const FamilyAssessmentListPage   = lazy(() => import('@/pages/assessments/family/FamilyAssessmentListPage'));
const FamilyAssessmentDetailPage = lazy(() => import('@/pages/assessments/family/FamilyAssessmentDetailPage'));

// Nutritional
const NutritionalAssessmentFormPage   = lazy(() => import('@/pages/assessments/nutritional/NutritionalAssessmentFormPage'));
const NutritionalAssessmentListPage   = lazy(() => import('@/pages/assessments/nutritional/NutritionalAssessmentListPage'));
const NutritionalAssessmentDetailPage = lazy(() => import('@/pages/assessments/nutritional/NutritionalAssessmentDetailPage'));

// Social
const SocialAssessmentFormPage   = lazy(() => import('@/pages/assessments/social/SocialAssessmentFormPage'));
const SocialAssessmentListPage   = lazy(() => import('@/pages/assessments/social/SocialAssessmentListPage'));
const SocialAssessmentDetailPage = lazy(() => import('@/pages/assessments/social/SocialAssessmentDetailPage'));

// Spiritual
const SpiritualAssessmentFormPage   = lazy(() => import('@/pages/assessments/spiritual/SpiritualAssessmentFormPage'));
const SpiritualAssessmentListPage   = lazy(() => import('@/pages/assessments/spiritual/SpiritualAssessmentListPage'));
const SpiritualAssessmentDetailPage = lazy(() => import('@/pages/assessments/spiritual/SpiritualAssessmentDetailPage'));

// Psychiatry
const PsychiatryAssessmentFormPage   = lazy(() => import('@/pages/assessments/psychiatry/PsychiatryAssessmentFormPage'));
const PsychiatryAssessmentListPage   = lazy(() => import('@/pages/assessments/psychiatry/PsychiatryAssessmentListPage'));
const PsychiatryAssessmentDetailPage = lazy(() => import('@/pages/assessments/psychiatry/PsychiatryAssessmentDetailPage'));

// ── Physician-only ──
const PatientRegistrationPage = lazy(
  () => import('@/pages/physician/PatientRegistrationPage'),
);

// ── Pharmacist queue ──
const MedicationOrdersPage = lazy(
  () => import('@/pages/pharmacist/MedicationOrdersPage'),
);
const MedicationOrderDetailPage = lazy(
  () => import('@/pages/pharmacist/MedicationOrderDetailPage'),
);

// ── Lab Technician queue ──
const LabRequestsPage = lazy(
  () => import('@/pages/lab-technician/LabRequestsPage'),
);
const LabRequestDetailPage = lazy(
  () => import('@/pages/lab-technician/LabRequestDetailPage'),
);

// ── Radiologist queue ──
const ImagingOrdersPage = lazy(
  () => import('@/pages/radiologist/ImagingOrdersPage'),
);
const ImagingOrderDetailPage = lazy(
  () => import('@/pages/radiologist/ImagingOrderDetailPage'),
);

// ── Print ──
const PatientPrintPage = lazy(() => import('@/pages/PatientPrintPage'));

// ── Suspense wrapper ─────────────────────────────────────────
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// ═════════════════════════════════════════════════════════════
// Shared assessment route block
//
// Registered inside the DashboardLayout so every assessment
// page renders with the sidebar. Mounted under /patients/:id.
// ═════════════════════════════════════════════════════════════

const AssessmentRoutes: React.FC = () => (
  <>
    {/* ── Pain ── */}
    <Route
      path="/patients/:id/pain"
      element={<S><PainAssessmentListPage /></S>}
    />
    <Route
      path="/patients/:id/pain/new"
      element={<S><PainAssessmentFormPage /></S>}
    />
    <Route
      path="/patients/:id/pain/:assessmentId"
      element={<S><PainAssessmentDetailPage /></S>}
    />
    <Route
      path="/patients/:id/pain/:assessmentId/edit"
      element={<S><PainAssessmentFormPage /></S>}
    />

    {/* ── Pharmacist ── */}
    <Route
      path="/patients/:id/pharmacist-assessment"
      element={<S><PharmacistAssessmentListPage /></S>}
    />
    <Route
      path="/patients/:id/pharmacist-assessment/new"
      element={<S><PharmacistAssessmentFormPage /></S>}
    />
    <Route
      path="/patients/:id/pharmacist-assessment/:assessmentId"
      element={<S><PharmacistAssessmentDetailPage /></S>}
    />
    <Route
      path="/patients/:id/pharmacist-assessment/:assessmentId/edit"
      element={<S><PharmacistAssessmentFormPage /></S>}
    />

    {/* ── Physiotherapy ── */}
    <Route
      path="/patients/:id/physiotherapy-assessment"
      element={<S><PhysiotherapyAssessmentListPage /></S>}
    />
    <Route
      path="/patients/:id/physiotherapy-assessment/new"
      element={<S><PhysiotherapyAssessmentFormPage /></S>}
    />
    <Route
      path="/patients/:id/physiotherapy-assessment/:assessmentId"
      element={<S><PhysiotherapyAssessmentDetailPage /></S>}
    />
    <Route
      path="/patients/:id/physiotherapy-assessment/:assessmentId/edit"
      element={<S><PhysiotherapyAssessmentFormPage /></S>}
    />

    {/* ── Family ── */}
    <Route
      path="/patients/:id/family-assessment"
      element={<S><FamilyAssessmentListPage /></S>}
    />
    <Route
      path="/patients/:id/family-assessment/new"
      element={<S><FamilyAssessmentFormPage /></S>}
    />
    <Route
      path="/patients/:id/family-assessment/:assessmentId"
      element={<S><FamilyAssessmentDetailPage /></S>}
    />
    <Route
      path="/patients/:id/family-assessment/:assessmentId/edit"
      element={<S><FamilyAssessmentFormPage /></S>}
    />

    {/* ── Nutritional ── */}
    <Route
      path="/patients/:id/nutritional-assessment"
      element={<S><NutritionalAssessmentListPage /></S>}
    />
    <Route
      path="/patients/:id/nutritional-assessment/new"
      element={<S><NutritionalAssessmentFormPage /></S>}
    />
    <Route
      path="/patients/:id/nutritional-assessment/:assessmentId"
      element={<S><NutritionalAssessmentDetailPage /></S>}
    />
    <Route
      path="/patients/:id/nutritional-assessment/:assessmentId/edit"
      element={<S><NutritionalAssessmentFormPage /></S>}
    />

    {/* ── Social ── */}
    <Route
      path="/patients/:id/social-assessment"
      element={<S><SocialAssessmentListPage /></S>}
    />
    <Route
      path="/patients/:id/social-assessment/new"
      element={<S><SocialAssessmentFormPage /></S>}
    />
    <Route
      path="/patients/:id/social-assessment/:assessmentId"
      element={<S><SocialAssessmentDetailPage /></S>}
    />
    <Route
      path="/patients/:id/social-assessment/:assessmentId/edit"
      element={<S><SocialAssessmentFormPage /></S>}
    />

    {/* ── Spiritual ── */}
    <Route
      path="/patients/:id/spiritual-assessment"
      element={<S><SpiritualAssessmentListPage /></S>}
    />
    <Route
      path="/patients/:id/spiritual-assessment/new"
      element={<S><SpiritualAssessmentFormPage /></S>}
    />
    <Route
      path="/patients/:id/spiritual-assessment/:assessmentId"
      element={<S><SpiritualAssessmentDetailPage /></S>}
    />
    <Route
      path="/patients/:id/spiritual-assessment/:assessmentId/edit"
      element={<S><SpiritualAssessmentFormPage /></S>}
    />

    {/* ── Psychiatry ── */}
    <Route
      path="/patients/:id/psychiatry-assessment"
      element={<S><PsychiatryAssessmentListPage /></S>}
    />
    <Route
      path="/patients/:id/psychiatry-assessment/new"
      element={<S><PsychiatryAssessmentFormPage /></S>}
    />
    <Route
      path="/patients/:id/psychiatry-assessment/:assessmentId"
      element={<S><PsychiatryAssessmentDetailPage /></S>}
    />
    <Route
      path="/patients/:id/psychiatry-assessment/:assessmentId/edit"
      element={<S><PsychiatryAssessmentFormPage /></S>}
    />
  </>
);

// ═════════════════════════════════════════════════════════════
// App Routes
// ═════════════════════════════════════════════════════════════

const AppRoutes: React.FC = () => (
  <Routes>
    {/* ── Public Landing ── */}
    <Route
      path="/"
      element={
        <S>
          <LandingPage />
        </S>
      }
    />

    {/* ── Auth Pages ── */}
    <Route element={<PublicRoute />}>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<S><LoginPage /></S>} />
        <Route path="/register" element={<S><RegisterPage /></S>} />
      </Route>
      <Route path="/verify-email" element={<S><VerifyEmailPage /></S>} />
      <Route
        path="/resend-verification"
        element={<S><ResendVerificationPage /></S>}
      />
    </Route>

    {/* ── Unauthorized ── */}
    <Route path="/unauthorized" element={<S><UnauthorizedPage /></S>} />

    {/* ═══════════════════════════════════════════════════════════
        Admin Routes
    ═══════════════════════════════════════════════════════════ */}
    <Route element={<ProtectedRoute role="admin" />}>
      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<S><AdminDashboardPage /></S>} />
        <Route
          path="/admin/patients"
          element={<S><AdminPatientListPage /></S>}
        />
        <Route
          path="/admin/patients/:patientId"
          element={<S><AdminPatientDetailPage /></S>}
        />
        <Route
          path="/admin/patients/:patientId/discharge"
          element={<S><DischargePatientPage /></S>}
        />

        {/* Admin sub-record detail routes */}
        <Route
          path="/admin/patients/:id/visits/:visitId"
          element={<S><VisitDetailPage /></S>}
        />
        <Route
          path="/admin/patients/:id/medications/:medicationId"
          element={<S><MedicationDetailPage /></S>}
        />
        <Route
          path="/admin/patients/:id/labs/:labId"
          element={<S><LabDetailPage /></S>}
        />
        <Route
          path="/admin/patients/:id/imaging/:imagingId"
          element={<S><ImagingDetailPage /></S>}
        />
        <Route
          path="/admin/patients/:id/referrals/:referralId"
          element={<S><ReferralDetailPage /></S>}
        />
        <Route
          path="/admin/patients/:id/admissions/:admissionId"
          element={<S><AdmissionDetailPage /></S>}
        />

        <Route path="/admin/staff" element={<S><StaffManagementPage /></S>} />
        <Route
          path="/admin/staff/performance/:staffId"
          element={<S><StaffPerformanceDetailPage /></S>}
        />
        <Route
          path="/admin/referrals"
          element={<S><ReferralManagementPage /></S>}
        />
        <Route path="/admin/reports" element={<S><ReportsPage /></S>} />
        <Route path="/admin/settings" element={<S><SettingsPage /></S>} />
      </Route>
    </Route>

    {/* ═══════════════════════════════════════════════════════════
        Staff Routes
    ═══════════════════════════════════════════════════════════ */}
    <Route element={<ProtectedRoute role="staff" />}>
      <Route element={<RoleGuard />}>
        <Route element={<DashboardLayout />}>

          {/* Clinical — shared by Physician & Nurse */}
          <Route path="/dashboard" element={<S><DashboardPage /></S>} />
          <Route path="/patients" element={<S><PatientListPage /></S>} />
          <Route path="/patients/:id" element={<S><PatientDetailPage /></S>} />
          <Route
            path="/patients/:id/summary"
            element={<S><PatientSummaryPage /></S>}
          />
          <Route
            path="/patients/:id/progress"
            element={<S><PatientProgressPage /></S>}
          />

          {/* Visits */}
          <Route
            path="/patients/:id/visits"
            element={<S><RecordVisitPage /></S>}
          />
          <Route
            path="/patients/:id/visits/:visitId"
            element={<S><VisitDetailPage /></S>}
          />

          {/* Medications */}
          <Route
            path="/patients/:id/medications"
            element={<S><OrderMedicationPage /></S>}
          />
          <Route
            path="/patients/:id/medications/:medicationId"
            element={<S><MedicationDetailPage /></S>}
          />

          {/* Labs */}
          <Route
            path="/patients/:id/labs"
            element={<S><OrderLabPage /></S>}
          />
          <Route
            path="/patients/:id/labs/:labId"
            element={<S><LabDetailPage /></S>}
          />

          {/* Imaging */}
          <Route
            path="/patients/:id/imaging"
            element={<S><OrderImagingPage /></S>}
          />
          <Route
            path="/patients/:id/imaging/:imagingId"
            element={<S><ImagingDetailPage /></S>}
          />

          {/* Referrals */}
          <Route
            path="/patients/:id/referrals"
            element={<S><RequestReferralPage /></S>}
          />
          <Route
            path="/patients/:id/referrals/:referralId"
            element={<S><ReferralDetailPage /></S>}
          />

          {/* Admissions */}
          <Route
            path="/patients/:id/admissions"
            element={<S><RecordAdmissionPage /></S>}
          />
          <Route
            path="/patients/:id/admissions/:admissionId"
            element={<S><AdmissionDetailPage /></S>}
          />

          {/* Progress Notes */}
          <Route
            path="/patients/:id/progress-note/new"
            element={<S><RecordProgressNotePage /></S>}
          />
          <Route
            path="/patients/:id/progress-note/:noteId/edit"
            element={<S><RecordProgressNotePage /></S>}
          />

          {/* ═══════════════════════════════════════════════════
              NEW: All 8 assessment routes
              (form + list + detail + edit per assessment)
          ═══════════════════════════════════════════════════ */}
          <AssessmentRoutes />

          {/* ── Physician-only ── */}
          <Route element={<PhysicianOnlyRoute />}>
            <Route
              path="/patients/new"
              element={<S><PatientRegistrationPage /></S>}
            />
          </Route>

          {/* ── Nurse-only ── */}
          <Route element={<NurseOnlyRoute />}>
            <Route
              path="/patients/:id/hospice-nursing"
              element={<S><HospiceNursingPage /></S>}
            />
            <Route
              path="/patients/:id/hospice-nursing/:assessmentId"
              element={<S><HospiceNursingDetailPage /></S>}
            />
          </Route>

          {/* ── Pharmacist queue ── */}
          <Route element={<PharmacistOnlyRoute />}>
            <Route
              path="/medication-orders"
              element={<S><MedicationOrdersPage /></S>}
            />
            <Route
              path="/medication-orders/:id"
              element={<S><MedicationOrderDetailPage /></S>}
            />
          </Route>

          {/* ── Lab Technician queue ── */}
          <Route element={<LabTechnicianOnlyRoute />}>
            <Route
              path="/lab-requests"
              element={<S><LabRequestsPage /></S>}
            />
            <Route
              path="/lab-requests/:id"
              element={<S><LabRequestDetailPage /></S>}
            />
          </Route>

          {/* ── Radiologist queue ── */}
          <Route element={<RadiologistOnlyRoute />}>
            <Route
              path="/imaging-orders"
              element={<S><ImagingOrdersPage /></S>}
            />
            <Route
              path="/imaging-orders/:id"
              element={<S><ImagingOrderDetailPage /></S>}
            />
          </Route>

        </Route>
      </Route>
    </Route>

    {/* ── Profile (admin + staff) ── */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/profile" element={<S><ProfilePage /></S>} />
      </Route>
    </Route>

    {/* ── Print Routes ── */}
    <Route element={<ProtectedRoute />}>
      <Route element={<PrintLayout />}>
        <Route
          path="/patients/:id/print"
          element={<S><PatientPrintPage /></S>}
        />
        <Route
          path="/admin/patients/:id/print"
          element={<S><PatientPrintPage /></S>}
        />
      </Route>
    </Route>

    {/* ── 404 ── */}
    <Route path="*" element={<S><NotFoundPage /></S>} />
  </Routes>
);

export default AppRoutes;