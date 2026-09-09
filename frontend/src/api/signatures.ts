import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockSignaturesApi } from './mocks/signatures.mock';
import type {
  SignVisitRequest,
  SignVisitResponse,
  VisitSignaturesResponse
} from '@/types/signature.types';

export const signatureApi = {
  signVisit: (visitId: string, data: SignVisitRequest): Promise<SignVisitResponse> => {
    if (USE_MOCK) return mockSignaturesApi.signVisit(visitId, data);
    return apiClient.post<SignVisitResponse>(`/visits/${visitId}/sign`, data).then((r) => r.data);
  },

  getVisitSignatures: (visitId: string): Promise<VisitSignaturesResponse> => {
    if (USE_MOCK) return mockSignaturesApi.getVisitSignatures(visitId);
    return apiClient.get<VisitSignaturesResponse>(`/visits/${visitId}/signatures`).then((r) => r.data);
  },
};