// src/routes/index.tsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageLoader } from '@/components/common/LoadingSpinner';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import PermissionGate from './PermissionGate';
import PharmacistOnlyRoute from './PharmacistOnlyRoute';
import LabTechnicianOnlyRoute from './LabTechnicianOnlyRoute';
import RadiologistOnlyRoute from './RadiologistOnlyRoute';
import {
  PublicLayout, AuthLayout, DashboardLayout, PrintLayout,
} from '@/components/layouts';

// ── Public ──
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));

// ── Auth ──
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ResendVerificationPage = lazy(() => import('@/pages/auth/ResendVerificationPage'));

// ── Profile ──
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

// ── Admin ──
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminPatientListPage = lazy(() => import('@/pages/admin/AdminPatientListPage'));
const AdminPatientDetailPage = lazy(() => import('@/pages/admin/AdminPatientDetailPage'));
const DischargePatientPage = lazy(() => import('@/pages/admin/DischargePatientPage'));
const PhysicianDischargePatientPage = lazy(() => import('@/pages/clinical/DischargePatientPage'));
const StaffManagementPage = lazy(() => import('@/pages/admin/StaffManagementPage'));
const StaffPerformanceDetailPage = lazy(() => import('@/pages/admin/StaffPerformanceDetailPage'));
const ReferralManagementPage = lazy(() => import('@/pages/admin/ReferralManagementPage'));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

// ── Clinical ──
const DashboardPage = lazy(() => import('@/pages/clinical/DashboardPage'));
const PatientListPage = lazy(() => import('@/pages/clinical/PatientListPage'));
const PatientDetailPage = lazy(() => import('@/pages/clinical/PatientDetailPage'));
const PatientSummaryPage = lazy(() => import('@/pages/clinical/PatientSummaryPage'));
const PatientProgressPage = lazy(() => import('@/pages/clinical/PatientProgressPage'));
const RecordVisitPage = lazy(() => import('@/pages/clinical/RecordVisitPage'));
const VisitDetailPage = lazy(() => import('@/pages/clinical/VisitDetailPage'));
const OrderMedicationPage = lazy(() => import('@/pages/clinical/OrderMedicationPage'));
const MedicationDetailPage = lazy(() => import('@/pages/clinical/MedicationDetailPage'));
const OrderLabPage = lazy(() => import('@/pages/clinical/OrderLabPage'));
const LabDetailPage = lazy(() => import('@/pages/clinical/LabDetailPage'));
const OrderImagingPage = lazy(() => import('@/pages/clinical/OrderImagingPage'));
const ImagingDetailPage = lazy(() => import('@/pages/clinical/ImagingDetailPage'));
const RequestReferralPage = lazy(() => import('@/pages/clinical/RequestReferralPage'));
const ReferralDetailPage = lazy(() => import('@/pages/clinical/ReferralDetailPage'));
const RecordAdmissionPage = lazy(() => import('@/pages/clinical/RecordAdmissionPage'));
const AdmissionDetailPage = lazy(() => import('@/pages/clinical/AdmissionDetailPage'));
const RecordProgressNotePage = lazy(() => import('@/pages/clinical/RecordProgressNotePage'));
const HospiceNursingPage = lazy(() => import('@/pages/clinical/HospiceNursingPage'));
const HospiceNursingDetailPage = lazy(() => import('@/pages/clinical/HospiceNursingDetailPage'));

// ── Assessment pages ──
const PainAssessmentFormPage = lazy(() => import('@/pages/assessments/pain/PainAssessmentFormPage'));
const PainAssessmentListPage = lazy(() => import('@/pages/assessments/pain/PainAssessmentListPage'));
const PainAssessmentDetailPage = lazy(() => import('@/pages/assessments/pain/PainAssessmentDetailPage'));

const PharmacistAssessmentFormPage = lazy(() => import('@/pages/assessments/pharmacist/PharmacistAssessmentFormPage'));
const PharmacistAssessmentListPage = lazy(() => import('@/pages/assessments/pharmacist/PharmacistAssessmentListPage'));
const PharmacistAssessmentDetailPage = lazy(() => import('@/pages/assessments/pharmacist/PharmacistAssessmentDetailPage'));

const PhysiotherapyAssessmentFormPage = lazy(() => import('@/pages/assessments/physiotherapy/PhysiotherapyAssessmentFormPage'));
const PhysiotherapyAssessmentListPage = lazy(() => import('@/pages/assessments/physiotherapy/PhysiotherapyAssessmentListPage'));
const PhysiotherapyAssessmentDetailPage = lazy(() => import('@/pages/assessments/physiotherapy/PhysiotherapyAssessmentDetailPage'));

const FamilyAssessmentFormPage = lazy(() => import('@/pages/assessments/family/FamilyAssessmentFormPage'));
const FamilyAssessmentListPage = lazy(() => import('@/pages/assessments/family/FamilyAssessmentListPage'));
const FamilyAssessmentDetailPage = lazy(() => import('@/pages/assessments/family/FamilyAssessmentDetailPage'));

const NutritionalAssessmentFormPage = lazy(() => import('@/pages/assessments/nutritional/NutritionalAssessmentFormPage'));
const NutritionalAssessmentListPage = lazy(() => import('@/pages/assessments/nutritional/NutritionalAssessmentListPage'));
const NutritionalAssessmentDetailPage = lazy(() => import('@/pages/assessments/nutritional/NutritionalAssessmentDetailPage'));

const SocialAssessmentFormPage = lazy(() => import('@/pages/assessments/social/SocialAssessmentFormPage'));
const SocialAssessmentListPage = lazy(() => import('@/pages/assessments/social/SocialAssessmentListPage'));
const SocialAssessmentDetailPage = lazy(() => import('@/pages/assessments/social/SocialAssessmentDetailPage'));

const SpiritualAssessmentFormPage = lazy(() => import('@/pages/assessments/spiritual/SpiritualAssessmentFormPage'));
const SpiritualAssessmentListPage = lazy(() => import('@/pages/assessments/spiritual/SpiritualAssessmentListPage'));
const SpiritualAssessmentDetailPage = lazy(() => import('@/pages/assessments/spiritual/SpiritualAssessmentDetailPage'));

const PsychiatryAssessmentFormPage = lazy(() => import('@/pages/assessments/psychiatry/PsychiatryAssessmentFormPage'));
const PsychiatryAssessmentListPage = lazy(() => import('@/pages/assessments/psychiatry/PsychiatryAssessmentListPage'));
const PsychiatryAssessmentDetailPage = lazy(() => import('@/pages/assessments/psychiatry/PsychiatryAssessmentDetailPage'));

// ── Physician ──
const PatientRegistrationPage = lazy(() => import('@/pages/physician/PatientRegistrationPage'));

// ── Pharmacist queue ──
const MedicationOrdersPage = lazy(() => import('@/pages/pharmacist/MedicationOrdersPage'));
const MedicationOrderDetailPage = lazy(() => import('@/pages/pharmacist/MedicationOrderDetailPage'));

// ── Lab Technician queue ──
const LabRequestsPage = lazy(() => import('@/pages/lab-technician/LabRequestsPage'));
const LabRequestDetailPage = lazy(() => import('@/pages/lab-technician/LabRequestDetailPage'));

// ── Radiologist queue ──
const ImagingOrdersPage = lazy(() => import('@/pages/radiologist/ImagingOrdersPage'));
const ImagingOrderDetailPage = lazy(() => import('@/pages/radiologist/ImagingOrderDetailPage'));

// ── Print ──
const PatientPrintPage = lazy(() => import('@/pages/PatientPrintPage'));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// ═════════════════════════════════════════════════════════════
// Assessment route builder — every assessment gets its 4 routes:
//   list (open)   detail (open)   new (gated)   edit (gated)
// ═════════════════════════════════════════════════════════════

interface AssessmentRouteConfig {
  segment: string;
  ListPage: React.ComponentType;
  FormPage: React.ComponentType;
  DetailPage: React.ComponentType;
  writePermission: string;
}

const ASSESSMENT_ROUTES: AssessmentRouteConfig[] = [
  { segment: 'pain',                     ListPage: PainAssessmentListPage,          FormPage: PainAssessmentFormPage,          DetailPage: PainAssessmentDetailPage,          writePermission: 'canWritePainAssessment' },
  { segment: 'pharmacist-assessment',    ListPage: PharmacistAssessmentListPage,    FormPage: PharmacistAssessmentFormPage,    DetailPage: PharmacistAssessmentDetailPage,    writePermission: 'canWritePharmacistAssessment' },
  { segment: 'physiotherapy-assessment', ListPage: PhysiotherapyAssessmentListPage, FormPage: PhysiotherapyAssessmentFormPage, DetailPage: PhysiotherapyAssessmentDetailPage, writePermission: 'canWritePhysiotherapyAssessment' },
  { segment: 'family-assessment',        ListPage: FamilyAssessmentListPage,        FormPage: FamilyAssessmentFormPage,        DetailPage: FamilyAssessmentDetailPage,        writePermission: 'canWriteFamilyAssessment' },
  { segment: 'nutritional-assessment',   ListPage: NutritionalAssessmentListPage,   FormPage: NutritionalAssessmentFormPage,   DetailPage: NutritionalAssessmentDetailPage,   writePermission: 'canWriteNutritionalAssessment' },
  { segment: 'social-assessment',        ListPage: SocialAssessmentListPage,        FormPage: SocialAssessmentFormPage,        DetailPage: SocialAssessmentDetailPage,        writePermission: 'canWriteSocialAssessment' },
  { segment: 'spiritual-assessment',     ListPage: SpiritualAssessmentListPage,     FormPage: SpiritualAssessmentFormPage,     DetailPage: SpiritualAssessmentDetailPage,     writePermission: 'canWriteSpiritualAssessment' },
  { segment: 'psychiatry-assessment',    ListPage: PsychiatryAssessmentListPage,    FormPage: PsychiatryAssessmentFormPage,    DetailPage: PsychiatryAssessmentDetailPage,    writePermission: 'canWritePsychiatryAssessment' },
];

const buildAssessmentRoutes = (prefix: string) => (
  <>
    {ASSESSMENT_ROUTES.map((cfg) => {
      const { segment, ListPage, FormPage, DetailPage, writePermission } = cfg;
      return (
        <React.Fragment key={segment}>
          <Route path={`${prefix}/:id/${segment}`} element={<S><ListPage /></S>} />

          <Route element={<PermissionGate permission={writePermission} />}>
            <Route path={`${prefix}/:id/${segment}/new`} element={<S><FormPage /></S>} />
            <Route path={`${prefix}/:id/${segment}/:assessmentId/edit`} element={<S><FormPage /></S>} />
          </Route>

          <Route path={`${prefix}/:id/${segment}/:assessmentId`} element={<S><DetailPage /></S>} />
        </React.Fragment>
      );
    })}
  </>
);

// ═════════════════════════════════════════════════════════════
// App Routes
// ═════════════════════════════════════════════════════════════

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public Landing */}
    <Route path="/" element={<S><LandingPage /></S>} />

    {/* Auth */}
    <Route element={<PublicRoute />}>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<S><LoginPage /></S>} />
        <Route path="/register" element={<S><RegisterPage /></S>} />
      </Route>
      <Route path="/verify-email" element={<S><VerifyEmailPage /></S>} />
      <Route path="/resend-verification" element={<S><ResendVerificationPage /></S>} />
    </Route>

    <Route path="/unauthorized" element={<S><UnauthorizedPage /></S>} />

    {/* ═══════════════ Admin Routes ═══════════════ */}
    <Route element={<ProtectedRoute role="admin" />}>
      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<S><AdminDashboardPage /></S>} />

        <Route path="/admin/patients" element={<S><AdminPatientListPage /></S>} />
        <Route path="/admin/patients/new" element={<S><PatientRegistrationPage /></S>} />
        <Route path="/admin/patients/:patientId/discharge" element={<S><DischargePatientPage /></S>} />

        {/* Admin clinical write routes — admin always allowed */}
        <Route path="/admin/patients/:id/visits" element={<S><RecordVisitPage /></S>} />
        <Route path="/admin/patients/:id/medications" element={<S><OrderMedicationPage /></S>} />
        <Route path="/admin/patients/:id/labs" element={<S><OrderLabPage /></S>} />
        <Route path="/admin/patients/:id/imaging" element={<S><OrderImagingPage /></S>} />
        <Route path="/admin/patients/:id/referrals" element={<S><RequestReferralPage /></S>} />
        <Route path="/admin/patients/:id/admissions" element={<S><RecordAdmissionPage /></S>} />
        <Route path="/admin/patients/:id/progress-note/new" element={<S><RecordProgressNotePage /></S>} />
        <Route path="/admin/patients/:id/progress-note/:noteId/edit" element={<S><RecordProgressNotePage /></S>} />
        <Route path="/admin/patients/:id/hospice-nursing" element={<S><HospiceNursingPage /></S>} />

        {/* Admin sub-record detail routes */}
        <Route path="/admin/patients/:id/visits/:visitId" element={<S><VisitDetailPage /></S>} />
        <Route path="/admin/patients/:id/progress-note/:noteId" element={<S><RecordProgressNotePage /></S>} />
        <Route path="/admin/patients/:id/hospice-nursing/:assessmentId" element={<S><HospiceNursingDetailPage /></S>} />
        <Route path="/admin/patients/:id/medications/:medicationId" element={<S><MedicationDetailPage /></S>} />
        <Route path="/admin/patients/:id/labs/:labId" element={<S><LabDetailPage /></S>} />
        <Route path="/admin/patients/:id/imaging/:imagingId" element={<S><ImagingDetailPage /></S>} />
        <Route path="/admin/patients/:id/referrals/:referralId" element={<S><ReferralDetailPage /></S>} />
        <Route path="/admin/patients/:id/admissions/:admissionId" element={<S><AdmissionDetailPage /></S>} />

        {buildAssessmentRoutes('/admin/patients')}

        <Route path="/admin/patients/:patientId" element={<S><AdminPatientDetailPage /></S>} />

        <Route path="/admin/staff" element={<S><StaffManagementPage /></S>} />
        <Route path="/admin/staff/performance/:staffId" element={<S><StaffPerformanceDetailPage /></S>} />
        <Route path="/admin/referrals" element={<S><ReferralManagementPage /></S>} />
        <Route path="/admin/reports" element={<S><ReportsPage /></S>} />
        <Route path="/admin/settings" element={<S><SettingsPage /></S>} />
      </Route>
    </Route>

    {/* ═══════════════ Staff Routes ═══════════════ */}
    <Route element={<ProtectedRoute role="staff" />}>
      <Route element={<RoleGuard />}>
        <Route element={<DashboardLayout />}>
          {/* Top-level */}
          <Route path="/dashboard" element={<S><DashboardPage /></S>} />
          <Route path="/patients" element={<S><PatientListPage /></S>} />

          {/* Register patient — Physician only */}
          <Route element={<PermissionGate permission="canRegisterPatient" />}>
            <Route path="/patients/new" element={<S><PatientRegistrationPage /></S>} />
          </Route>

          {/* Discharge — Physician only */}
          <Route element={<PermissionGate permission="canDischargePatient" />}>
            <Route path="/patients/:id/discharge" element={<S><PhysicianDischargePatientPage /></S>} />
          </Route>

          {/* ── Visits ── */}
          <Route element={<PermissionGate permission="canRecordVisit" />}>
            <Route path="/patients/:id/visits" element={<S><RecordVisitPage /></S>} />
          </Route>
          <Route path="/patients/:id/visits/:visitId" element={<S><VisitDetailPage /></S>} />

          {/* ── Progress Notes ── */}
          <Route element={<PermissionGate permission="canCreateProgressNote" />}>
            <Route path="/patients/:id/progress-note/new" element={<S><RecordProgressNotePage /></S>} />
            <Route path="/patients/:id/progress-note/:noteId/edit" element={<S><RecordProgressNotePage /></S>} />
          </Route>
          <Route path="/patients/:id/progress-note/:noteId" element={<S><RecordProgressNotePage /></S>} />

          {/* ── Hospice Nursing ── */}
          <Route element={<PermissionGate permission="canRecordHospiceNursing" />}>
            <Route path="/patients/:id/hospice-nursing" element={<S><HospiceNursingPage /></S>} />
          </Route>
          <Route element={<PermissionGate permission="canViewHospiceNursing" />}>
            <Route path="/patients/:id/hospice-nursing/:assessmentId" element={<S><HospiceNursingDetailPage /></S>} />
          </Route>

          {/* ── Medications ── */}
          <Route element={<PermissionGate permission="canOrderMedication" />}>
            <Route path="/patients/:id/medications" element={<S><OrderMedicationPage /></S>} />
          </Route>
          <Route element={<PermissionGate permission="canViewMedications" />}>
            <Route path="/patients/:id/medications/:medicationId" element={<S><MedicationDetailPage /></S>} />
          </Route>

          {/* ── Labs ── */}
          <Route element={<PermissionGate permission="canOrderLab" />}>
            <Route path="/patients/:id/labs" element={<S><OrderLabPage /></S>} />
          </Route>
          <Route element={<PermissionGate permission="canViewLabs" />}>
            <Route path="/patients/:id/labs/:labId" element={<S><LabDetailPage /></S>} />
          </Route>

          {/* ── Imaging ── */}
          <Route element={<PermissionGate permission="canOrderImaging" />}>
            <Route path="/patients/:id/imaging" element={<S><OrderImagingPage /></S>} />
          </Route>
          <Route element={<PermissionGate permission="canViewImaging" />}>
            <Route path="/patients/:id/imaging/:imagingId" element={<S><ImagingDetailPage /></S>} />
          </Route>

          {/* ── Referrals ── */}
          <Route element={<PermissionGate permission="canCreateReferral" />}>
            <Route path="/patients/:id/referrals" element={<S><RequestReferralPage /></S>} />
          </Route>
          <Route element={<PermissionGate permission="canViewReferrals" />}>
            <Route path="/patients/:id/referrals/:referralId" element={<S><ReferralDetailPage /></S>} />
          </Route>

          {/* ── Admissions ── */}
          <Route element={<PermissionGate permission="canRecordAdmission" />}>
            <Route path="/patients/:id/admissions" element={<S><RecordAdmissionPage /></S>} />
          </Route>
          <Route element={<PermissionGate permission="canViewAdmissions" />}>
            <Route path="/patients/:id/admissions/:admissionId" element={<S><AdmissionDetailPage /></S>} />
          </Route>

          {/* ── Summary / Progress — always readable ── */}
          <Route path="/patients/:id/summary" element={<S><PatientSummaryPage /></S>} />
          <Route path="/patients/:id/progress" element={<S><PatientProgressPage /></S>} />

          {/* ── Assessment route blocks ── */}
          {buildAssessmentRoutes('/patients')}

          {/* Generic patient detail — LAST */}
          <Route path="/patients/:id" element={<S><PatientDetailPage /></S>} />

          {/* ── Pharmacist queue ── */}
          <Route element={<PharmacistOnlyRoute />}>
            <Route path="/medication-orders" element={<S><MedicationOrdersPage /></S>} />
            <Route path="/medication-orders/:id" element={<S><MedicationOrderDetailPage /></S>} />
          </Route>

          {/* ── Lab Technician queue ── */}
          <Route element={<LabTechnicianOnlyRoute />}>
            <Route path="/lab-requests" element={<S><LabRequestsPage /></S>} />
            <Route path="/lab-requests/:id" element={<S><LabRequestDetailPage /></S>} />
          </Route>

          {/* ── Radiologist queue ── */}
          <Route element={<RadiologistOnlyRoute />}>
            <Route path="/imaging-orders" element={<S><ImagingOrdersPage /></S>} />
            <Route path="/imaging-orders/:id" element={<S><ImagingOrderDetailPage /></S>} />
          </Route>
        </Route>
      </Route>
    </Route>

    {/* Profile */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/profile" element={<S><ProfilePage /></S>} />
      </Route>
    </Route>

    {/* Print */}
    <Route element={<ProtectedRoute />}>
      <Route element={<PrintLayout />}>
        <Route path="/patients/:id/print" element={<S><PatientPrintPage /></S>} />
        <Route path="/admin/patients/:id/print" element={<S><PatientPrintPage /></S>} />
      </Route>
    </Route>

    <Route path="*" element={<S><NotFoundPage /></S>} />
  </Routes>
);

export default AppRoutes;