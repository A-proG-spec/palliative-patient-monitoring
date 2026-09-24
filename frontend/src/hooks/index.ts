export {
  useRegister,
  useVerifyEmail,
  useResendVerification,
  useLogin,
  useLogout,
  useCurrentUser,
  useUpdateStaffProfile,
} from './useAuth';

export { useStaffProfile } from './useStaff';
export { usePatients, usePatient, usePatientSummary, useRegisterPatient } from './usePatients';
export { usePatientProgress } from './usePatientProgress';
export { usePatientVisits, useVisitDetail, useRecordVisit } from './useVisits';
export {
  usePatientMedications,
  useMedicationDetail,
  useOrderMedication,
  useUpdateMedicationStatus,
} from './useMedications';
export { usePatientLabs, useLabDetail, useOrderLab, useUpdateLabResult } from './useLabs';
export { usePatientReferrals, useReferralDetail, useRequestReferral } from './useReferrals';
export {
  usePatientAdmissions,
  useAdmissionDetail,
  useRecordAdmission,
  useUpdateAdmission,
} from './useAdmissions';
export {
  useDashboardStats,
  useNotifications,
  useMarkNotificationRead,
  useAdminPatients,
  useAdminPatientDetail,
  useCloseCase,
  usePendingStaff,
  useApproveStaff,
  useRejectStaff,
  usePendingReferrals,
  useApproveReferral,
  useDeclineReferral,
  useReports,
} from './useAdmin';
export { useStaffDashboardStats } from './useStaff';
export {
  useDischargeSummary,
  useDischargePatient,
  useFinalizeDischargeSummary,
} from './useDischarge';
export { useProfile, useUpdateProfile, useChangePassword, useActivityStats } from './useProfile';
export {
  usePatientImaging,
  useImagingDetail,
  useOrderImaging,
  useUpdateImagingReport,
  useUpdateImagingStatus,
  useDeleteImaging,
} from './useImaging';
export {
  useProgressNotes,
  useProgressNote,
  useProgressNoteSignatures,
  useCreateProgressNote,
  useUpdateProgressNote,
  useDeleteProgressNote,
  useSignProgressNote,
  buildBlankProgressNote,
} from './useProgressNotes';

// ── Role-specific queues ──
export {
  useMedicationQueue,
  useMedicationOrderDetail,
  useMarkMedicationGiven,
} from './useMedicationQueue';

export {
  useLabQueue,
  useLabRequestDetail,
  useEnterLabResult,
} from './useLabQueue';

export {
  useImagingQueue,
  useImagingOrderDetail,
  useSubmitImagingReport,
} from './useImagingQueue';

export {
  usePatientPharmacistAssessments,
  usePharmacistAssessment,
  useCreatePharmacistAssessment,
  useUpdatePharmacistAssessment,
  useDeletePharmacistAssessment,
  useRestorePharmacistAssessment,
} from './usePharmacistAssessments';

export {
  usePatientPhysiotherapyAssessments,
  usePhysiotherapyAssessment,
  useCreatePhysiotherapyAssessment,
  useUpdatePhysiotherapyAssessment,
  useDeletePhysiotherapyAssessment,
  useRestorePhysiotherapyAssessment,
} from './usePhysiotherapyAssessments';

export {
  usePatientFamilyAssessments,
  useFamilyAssessment,
  useCreateFamilyAssessment,
  useUpdateFamilyAssessment,
  useDeleteFamilyAssessment,
  useRestoreFamilyAssessment,
} from './useFamilyAssessments';

export {
  usePatientNutritionalAssessments,
  useNutritionalAssessment,
  useCreateNutritionalAssessment,
  useUpdateNutritionalAssessment,
  useDeleteNutritionalAssessment,
  useRestoreNutritionalAssessment,
} from './useNutritionalAssessments';

export {
  usePatientPainAssessments,
  usePainAssessment,
  useCreatePainAssessment,
  useUpdatePainAssessment,
  useDeletePainAssessment,
  useRestorePainAssessment,
} from './usePainAssessments';

export {
  usePatientSocialAssessments,
  useSocialAssessment,
  useCreateSocialAssessment,
  useUpdateSocialAssessment,
  useDeleteSocialAssessment,
  useRestoreSocialAssessment,
} from './useSocialAssessments';

export {
  usePatientSpiritualAssessments,
  useSpiritualAssessment,
  useCreateSpiritualAssessment,
  useUpdateSpiritualAssessment,
  useDeleteSpiritualAssessment,
  useRestoreSpiritualAssessment,
} from './useSpiritualAssessments';

export {
  usePatientPsychiatryAssessments,
  usePsychiatryAssessment,
  useCreatePsychiatryAssessment,
  useUpdatePsychiatryAssessment,
  useDeletePsychiatryAssessment,
  useRestorePsychiatryAssessment,
} from './usePsychiatryAssessments';
