export { authApi } from './auth';
export { patientApi } from './patients';
export { visitApi } from './visits';
export { medicationApi } from './medications';
export { labApi } from './labs';
export { referralApi } from './referrals';
export { admissionApi } from './admissions';
export { adminApi } from './admin';
export { staffApi } from './staff';

export { dischargeApi } from './discharge';
export { medicationQueueApi } from './medication-queue';
export type {
  PendingMedicationOrder,
  MedicationQueueListResponse,
} from './medication-queue';

export { labQueueApi } from './lab-queue';
export type {
  PendingLabRequest,
  LabRequestDetail,
  LabQueueListResponse,
  EnterLabResultRequest,
} from './lab-queue';

export { imagingQueueApi } from './imaging-queue';
export type {
  PendingImagingOrder,
  ImagingOrderDetail,
  ImagingQueueListResponse,
  SubmitImagingReportRequest,
} from './imaging-queue';