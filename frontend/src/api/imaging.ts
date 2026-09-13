import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockImagingApi } from './mocks/imaging.mock';

export type ImagingModality =
  | 'XRay' | 'Ultrasound' | 'CT' | 'MRI'
  | 'Mammography' | 'Fluoroscopy' | 'Interventional' | 'NuclearMedicine' | 'Other';
export type ContrastDecision = 'No' | 'Yes' | 'ToBeDetermined' | 'NotApplicable';
export type PregnancyStatus = 'NotPregnant' | 'Pregnant' | 'PossiblyPregnant' | 'NotApplicable';
export type MetallicForeignBody = 'No' | 'Yes' | 'Unknown';
export type ImagingPriority = 'Routine' | 'Urgent' | 'Emergency';
export type Laterality = 'Right' | 'Left' | 'Bilateral' | 'NotApplicable';
export type ImageQuality = 'Diagnostic' | 'Limited' | 'NonDiagnostic' | 'RepeatRequired';
export type ImagingStatus = 'Ordered' | 'Completed' | 'Cancelled';

export interface ImagingOrderReport {
  reportNo?: string;
  findings: string;
  impression: string;
  recommendations?: string;
  reportingPhysician: string;
  signature?: string;
  reportDate?: string;
  hospitalDepartmentStamp?: string;
}

export interface ImagingOrder {
  id: string;
  patientId: string;
  patientName?: string;
  medicalRecordNo?: string;
  wardClinic?: string;
  contactNo?: string;

  // §2 Clinical
  provisionalDiagnosis?: string;
  presentingSymptoms?: string;
  medicalHistory?: string;
  previousImaging: boolean;
  previousImagingDetails?: string;

  // §3 Imaging examination
  modality: ImagingModality;
  modalityOtherText?: string;
  bodyRegion: string;
  bodyRegionOtherText?: string;
  laterality: Laterality;
  contrastRequested: ContrastDecision;

  // §4 Exam details
  specificSite?: string;
  protocolViews?: string;
  specialClinicalQuestion?: string;

  // §5 Contrast / medication
  previousContrastReaction: boolean;
  previousContrastReactionDetails?: string;
  knownAllergies?: string;
  creatinine?: string;
  egfr?: string;
  otherRelevantMedicationOrCondition?: string;

  // §6 Safety screening
  pregnancyStatus: PregnancyStatus;
  implantedMedicalDevice: boolean;
  deviceImplantDetails?: string;
  metallicForeignBody: MetallicForeignBody;
  otherSafetyConsiderations?: string;

  // §7 Preparation
  preparation: string[];
  preparationInstructions?: string;

  // §8 Priority
  priority: ImagingPriority;
  reasonForUrgency?: string;

  // §9 Referring clinician
  clinicianName?: string;
  clinicianDepartment?: string;
  clinicianLicenseNo?: string;
  clinicianContact?: string;
  clinicianSignature?: string;
  clinicianSignedAt?: string;

  // §10 Department use
  examinationPerformed?: boolean;
  performedModality?: string;
  performedProtocol?: string;
  performedContrast: 'None' | 'Administered' | 'NotAdministered';
  technologistName?: string;
  radiologistName?: string;
  performedAt?: string;
  imageQuality?: ImageQuality;

  // §11 Report
  report?: ImagingOrderReport;

  status: ImagingStatus;
  orderedBy?: { id: string; name: string; role?: string };
  dateOrdered?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateImagingRequest {
  // §2
  provisionalDiagnosis?: string;
  presentingSymptoms?: string;
  medicalHistory?: string;
  previousImaging?: boolean;
  previousImagingDetails?: string;

  // §3
  modality: ImagingModality;
  modalityOtherText?: string;
  bodyRegion: string;
  bodyRegionOtherText?: string;
  laterality: Laterality;
  contrastRequested: ContrastDecision;

  // §4
  specificSite?: string;
  protocolViews?: string;
  specialClinicalQuestion?: string;

  // §5
  previousContrastReaction?: boolean;
  previousContrastReactionDetails?: string;
  knownAllergies?: string;
  creatinine?: string;
  egfr?: string;
  otherRelevantMedicationOrCondition?: string;

  // §6
  pregnancyStatus: PregnancyStatus;
  implantedMedicalDevice?: boolean;
  deviceImplantDetails?: string;
  metallicForeignBody: MetallicForeignBody;
  otherSafetyConsiderations?: string;

  // §7
  preparation?: string[];
  preparationInstructions?: string;

  // §8
  priority: ImagingPriority;
  reasonForUrgency?: string;

  // §9
  clinicianName?: string;
  clinicianDepartment?: string;
  clinicianLicenseNo?: string;
  clinicianContact?: string;
  clinicianSignature?: string;
}

export interface UpdateImagingReportRequest {
  reportNo?: string;
  findings: string;
  impression: string;
  recommendations?: string;
  reportingPhysician: string;
  signature?: string;
  reportDate?: string;
  hospitalDepartmentStamp?: string;
}

export interface RecordImagingPerformedRequest {
  performedModality?: string;
  performedProtocol?: string;
  performedContrast?: 'None' | 'Administered' | 'NotAdministered';
  technologistName?: string;
  radiologistName?: string;
  performedAt?: string;
  imageQuality?: ImageQuality;
}

export interface ImagingListResponse {
  items: ImagingOrder[];
  page: number;
  limit: number;
  total: number;
}

export const imagingApi = {
  create: (patientId: string, data: CreateImagingRequest): Promise<ImagingOrder> => {
    if (USE_MOCK) return mockImagingApi.create(patientId, data as any);
    return apiClient.post<ImagingOrder>(`/patients/${patientId}/imaging`, data).then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { status?: ImagingStatus; modality?: ImagingModality; priority?: ImagingPriority; page?: number; limit?: number },
  ): Promise<ImagingListResponse> => {
    if (USE_MOCK) return mockImagingApi.getByPatient(patientId, params as any) as any;
    return apiClient
      .get<ImagingListResponse>(`/patients/${patientId}/imaging`, { params })
      .then((r) => r.data);
  },

  getById: (patientId: string, imagingId: string): Promise<ImagingOrder> => {
    if (USE_MOCK) return mockImagingApi.getById(patientId, imagingId) as any;
    return apiClient.get<ImagingOrder>(`/patients/${patientId}/imaging/${imagingId}`).then((r) => r.data);
  },

  updateReport: (
    patientId: string,
    imagingId: string,
    data: UpdateImagingReportRequest,
  ): Promise<ImagingOrder> => {
    if (USE_MOCK) return mockImagingApi.updateReport(patientId, imagingId, data as any) as any;
    return apiClient
      .put<ImagingOrder>(`/patients/${patientId}/imaging/${imagingId}/report`, data)
      .then((r) => r.data);
  },

  recordPerformed: (
    patientId: string,
    imagingId: string,
    data: RecordImagingPerformedRequest,
  ): Promise<ImagingOrder> => {
    if (USE_MOCK) return mockImagingApi.getById(patientId, imagingId) as any;
    return apiClient
      .put<ImagingOrder>(`/patients/${patientId}/imaging/${imagingId}/performed`, data)
      .then((r) => r.data);
  },

  updateStatus: (
    patientId: string,
    imagingId: string,
    status: ImagingStatus,
  ): Promise<ImagingOrder> => {
    if (USE_MOCK) return mockImagingApi.updateStatus(patientId, imagingId, status) as any;
    return apiClient
      .put<ImagingOrder>(`/patients/${patientId}/imaging/${imagingId}/status`, { status })
      .then((r) => r.data);
  },

  /**
   * Admin-only soft delete.
   */
  delete: (patientId: string, imagingId: string, reason?: string): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return mockImagingApi.delete(patientId, imagingId);
    return apiClient
      .delete<{ id: string; success: boolean }>(`/patients/${patientId}/imaging/${imagingId}`, {
        data: { reason },
      })
      .then((r) => r.data);
  },

  /**
   * Admin-only restore.
   */
  restore: (patientId: string, imagingId: string): Promise<{ id: string; restored: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: imagingId, restored: true });
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/patients/${patientId}/imaging/${imagingId}/restore`,
      )
      .then((r) => r.data);
  },
};