import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockSignaturesApi } from './mocks/signatures.mock';
import type {
  SignVisitRequest,
  SignVisitResponse,
  VisitSignaturesResponse,
} from '@/types/signature.types';

export const signatureApi = {
  /**
   * Sign a visit as Physician or Nurse.
   * Backend path: POST /patients/:patientId/visits/:visitId/sign
   * Body: { email, password, role }
   */
  signVisit: (
    patientId: string,
    visitId: string,
    data: SignVisitRequest,
  ): Promise<SignVisitResponse> => {
    if (USE_MOCK) return mockSignaturesApi.signVisit(visitId, data);
    return apiClient
      .post<SignVisitResponse>(
        `/patients/${patientId}/visits/${visitId}/sign`,
        data,
      )
      .then((r) => r.data);
  },

  /**
   * Read current signature status for a visit.
   * Backend path: GET /patients/:patientId/visits/:visitId/signatures
   */
  getVisitSignatures: (
    patientId: string,
    visitId: string,
  ): Promise<VisitSignaturesResponse> => {
    if (USE_MOCK) return mockSignaturesApi.getVisitSignatures(visitId);
    return apiClient
      .get<VisitSignaturesResponse>(
        `/patients/${patientId}/visits/${visitId}/signatures`,
      )
      .then((r) => r.data);
  },
};