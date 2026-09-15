import apiClient from './client';
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
   * The backend verifies email + password (bcrypt) and checks that the
   * staff member's registered role matches the requested role.
   */
  signVisit: (
    patientId: string,
    visitId: string,
    data: SignVisitRequest,
  ): Promise<SignVisitResponse> => {
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
    return apiClient
      .get<VisitSignaturesResponse>(
        `/patients/${patientId}/visits/${visitId}/signatures`,
      )
      .then((r) => r.data);
  },
};