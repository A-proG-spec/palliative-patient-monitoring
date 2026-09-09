import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockImagingApi } from './mocks/imaging.mock';

export interface ImagingOrder {
  id: string;
  patientId: string;
  modality: 'XRay' | 'Ultrasound' | 'CT' | 'MRI' | 'Mammography' | 'Fluoroscopy' | 'Interventional' | 'NuclearMedicine' | 'Other';
  bodyRegion: string;
  specificSite?: string;
  laterality: 'Right' | 'Left' | 'Bilateral' | 'NotApplicable';
  protocol?: string;
  clinicalQuestion?: string;
  contrast: 'No' | 'Yes' | 'ToBeDetermined';
  priority: 'Routine' | 'Urgent' | 'Emergency';
  reasonForUrgency?: string;
  pregnancyStatus: 'NotPregnant' | 'Pregnant' | 'PossiblyPregnant' | 'NotApplicable';
  implantedDevice: boolean;
  deviceDetails?: string;
  metallicForeignBody: 'No' | 'Yes' | 'Unknown';
  allergies?: string;
  renalFunction?: string;
  creatinine?: string;
  egfr?: string;
  preparation: string[];
  preparationInstructions?: string;
  clinicianName?: string;
  clinicianDepartment?: string;
  clinicianContact?: string;
  // Report fields
  reportDate?: string;
  findings?: string;
  impression?: string;
  recommendations?: string;
  reportingPhysician?: string;
  imageQuality?: 'Diagnostic' | 'Limited' | 'NonDiagnostic' | 'RepeatRequired';
  notes?: string;
  status: 'Ordered' | 'Completed';
  orderedBy: string;
  dateOrdered: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateImagingRequest {
  modality: ImagingOrder['modality'];
  bodyRegion: string;
  specificSite?: string;
  laterality: ImagingOrder['laterality'];
  protocol?: string;
  clinicalQuestion?: string;
  contrast: ImagingOrder['contrast'];
  priority: ImagingOrder['priority'];
  reasonForUrgency?: string;
  pregnancyStatus: ImagingOrder['pregnancyStatus'];
  implantedDevice: boolean;
  deviceDetails?: string;
  metallicForeignBody: ImagingOrder['metallicForeignBody'];
  allergies?: string;
  renalFunction?: string;
  creatinine?: string;
  egfr?: string;
  preparation: string[];
  preparationInstructions?: string;
  clinicianName?: string;
  clinicianDepartment?: string;
  clinicianContact?: string;
}

export interface UpdateImagingReportRequest {
  reportDate: string;
  findings: string;
  impression: string;
  recommendations?: string;
  reportingPhysician: string;
  imageQuality: ImagingOrder['imageQuality'];
  notes?: string;
}

export const imagingApi = {
  create: (patientId: string, data: CreateImagingRequest): Promise<ImagingOrder> => {
    if (USE_MOCK) return mockImagingApi.create(patientId, data);
    return apiClient.post<ImagingOrder>(`/patients/${patientId}/imaging`, data).then((r) => r.data);
  },

  getByPatient: (patientId: string, params?: { status?: 'Ordered' | 'Completed'; page?: number; limit?: number }): Promise<{ items: ImagingOrder[]; total: number }> => {
    if (USE_MOCK) return mockImagingApi.getByPatient(patientId, params);
    return apiClient.get<{ items: ImagingOrder[]; total: number }>(`/patients/${patientId}/imaging`, { params }).then((r) => r.data);
  },

  getById: (patientId: string, imagingId: string): Promise<ImagingOrder> => {
    if (USE_MOCK) return mockImagingApi.getById(patientId, imagingId);
    return apiClient.get<ImagingOrder>(`/patients/${patientId}/imaging/${imagingId}`).then((r) => r.data);
  },

  updateReport: (patientId: string, imagingId: string, data: UpdateImagingReportRequest): Promise<ImagingOrder> => {
    if (USE_MOCK) return mockImagingApi.updateReport(patientId, imagingId, data);
    return apiClient.put<ImagingOrder>(`/patients/${patientId}/imaging/${imagingId}/report`, data).then((r) => r.data);
  },

  updateStatus: (patientId: string, imagingId: string, status: 'Ordered' | 'Completed'): Promise<ImagingOrder> => {
    if (USE_MOCK) return mockImagingApi.updateStatus(patientId, imagingId, status);
    return apiClient.put<ImagingOrder>(`/patients/${patientId}/imaging/${imagingId}/status`, { status }).then((r) => r.data);
  },

  delete: (patientId: string, imagingId: string): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return mockImagingApi.delete(patientId, imagingId);
    return apiClient.delete<{ id: string; success: boolean }>(`/patients/${patientId}/imaging/${imagingId}`).then((r) => r.data);
  },
};