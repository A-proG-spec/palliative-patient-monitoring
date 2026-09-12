import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockAdminApi } from './mocks/admin.mock';
import type { DischargeSummary } from '@/components/admin/DischargePatientModal';

export interface CreateDischargeSummaryResponse {
  id: string;
  patientId: string;
  admissionId?: string;
  dateOfDischarge: string;
  dischargeType: string;
  status: 'Draft' | 'Final';
  createdAt: string;
}

export const dischargeApi = {
  /**
   * Create a discharge summary. This is the real discharge flow —
   * it also flips the linked HospitalAdmission to `Discharged`
   * and the Patient to `Discharged`.
   */
  create: (
    patientId: string,
    data: DischargeSummary,
  ): Promise<CreateDischargeSummaryResponse> => {
    if (USE_MOCK) return mockAdminApi.dischargePatient(patientId, data) as any;
    return apiClient
      .post<CreateDischargeSummaryResponse>(
        `/patients/${patientId}/discharge-summary`,
        data,
      )
      .then((r) => r.data);
  },

  /**
   * Read the latest discharge summary for a patient.
   * Backend returns 404 if none exists yet.
   */
  getByPatient: (patientId: string): Promise<DischargeSummary> => {
    if (USE_MOCK) return mockAdminApi.getDischargeSummary(patientId);
    return apiClient
      .get<DischargeSummary>(`/patients/${patientId}/discharge-summary`)
      .then((r) => r.data);
  },

  /**
   * Finalize a Draft discharge summary → Final.
   */
  finalize: (
    patientId: string,
    summaryId: string,
  ): Promise<{ id: string; status: 'Final' }> => {
    if (USE_MOCK) return Promise.resolve({ id: summaryId, status: 'Final' as const });
    return apiClient
      .put<{ id: string; status: 'Final' }>(
        `/patients/${patientId}/discharge-summary/${summaryId}/finalize`,
      )
      .then((r) => r.data);
  },
};