export { useRegister, useVerifyEmail, useResendVerification, useLogin, useLogout, useCurrentUser, useUpdateStaffProfile } from './useAuth';
// useStaffProfile is exported from both useAuth and useStaff — use useStaff's version for dashboard context
export { useStaffProfile } from './useStaff';
export { usePatients, usePatient, usePatientSummary, useRegisterPatient } from './usePatients';
export { usePatientProgress } from './usePatientProgress';
export { usePatientVisits, useVisitDetail, useRecordVisit } from './useVisits';
export { usePatientMedications, useMedicationDetail, useOrderMedication, useUpdateMedicationStatus } from './useMedications';
export { usePatientLabs, useLabDetail, useOrderLab, useUpdateLabResult } from './useLabs';
export { usePatientReferrals, useReferralDetail, useRequestReferral } from './useReferrals';
export { usePatientAdmissions, useAdmissionDetail, useRecordAdmission, useUpdateAdmission } from './useAdmissions';
export { useDashboardStats, useNotifications, useMarkNotificationRead, useAdminPatients, useAdminPatientDetail, useCloseCase, usePendingStaff, useApproveStaff, useRejectStaff, usePendingReferrals, useApproveReferral, useDeclineReferral, useReports, useExportReport } from './useAdmin';
export { useStaffDashboardStats } from './useStaff';
