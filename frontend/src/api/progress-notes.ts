import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockProgressNotesApi } from './mocks/progress-notes.mock';
import type { ProgressNote } from '@/hooks/useProgressNotes';

export interface CreateProgressNoteRequest {
  patientId: string;
  data: Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>;
}

export interface UpdateProgressNoteRequest {
  patientId: string;
  noteId: string;
  data: Partial<Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>>;
}

export interface SignProgressNoteRequest {
  email: string;
  password: string;
  role: 'Physician' | 'Nurse' | 'Reviewer';
}

export interface SignProgressNoteResponse {
  id: string;
  signedBy: { staffId: string; name: string; role: string; signedAt: string };
  signatures: Array<{ staffId: string; name: string; role: string; signedAt: string }>;
  allSigned: boolean;
}

export interface ProgressNoteSignaturesResponse {
  noteId: string;
  createdAt: string;
  responsibleClinician: { staffId: string; name: string; role: string } | null;
  signatures: Array<{ staffId: string; name: string; role: string; signedAt: string }>;
  allSigned: boolean;
  totalSignatures: number;
}

export const progressNotesApi = {
  create: (
    patientId: string,
    data: Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>,
  ): Promise<ProgressNote> => {
    if (USE_MOCK) return mockProgressNotesApi.create(patientId, data);
    return apiClient
      .post<ProgressNote>(`/patients/${patientId}/progress-notes`, data)
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { admissionId?: string; page?: number; limit?: number },
  ): Promise<{ items: ProgressNote[]; total: number }> => {
    if (USE_MOCK) return mockProgressNotesApi.getByPatient(patientId, params);
    return apiClient
      .get<{ items: ProgressNote[]; total: number }>(
        `/patients/${patientId}/progress-notes`,
        { params },
      )
      .then((r) => r.data);
  },

  getById: (patientId: string, noteId: string): Promise<ProgressNote> => {
    if (USE_MOCK) return mockProgressNotesApi.getById(patientId, noteId);
    return apiClient
      .get<ProgressNote>(`/patients/${patientId}/progress-notes/${noteId}`)
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    noteId: string,
    data: Partial<Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>>,
  ): Promise<ProgressNote> => {
    if (USE_MOCK) return mockProgressNotesApi.update(patientId, noteId, data);
    return apiClient
      .put<ProgressNote>(`/patients/${patientId}/progress-notes/${noteId}`, data)
      .then((r) => r.data);
  },

  delete: (patientId: string, noteId: string, reason?: string): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return mockProgressNotesApi.delete(patientId, noteId);
    return apiClient
      .delete<{ id: string; success: boolean }>(
        `/patients/${patientId}/progress-notes/${noteId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restore: (patientId: string, noteId: string): Promise<{ id: string; restored: boolean }> => {
    if (USE_MOCK) return Promise.resolve({ id: noteId, restored: true });
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/patients/${patientId}/progress-notes/${noteId}/restore`,
      )
      .then((r) => r.data);
  },

  sign: (
    patientId: string,
    noteId: string,
    data: SignProgressNoteRequest,
  ): Promise<SignProgressNoteResponse> => {
    if (USE_MOCK) {
      return Promise.resolve({
        id: noteId,
        signedBy: {
          staffId: 'mock-staff',
          name: 'Mock Staff',
          role: data.role,
          signedAt: new Date().toISOString(),
        },
        signatures: [],
        allSigned: false,
      });
    }
    return apiClient
      .post<SignProgressNoteResponse>(
        `/patients/${patientId}/progress-notes/${noteId}/sign`,
        data,
      )
      .then((r) => r.data);
  },

  getSignatures: (
    patientId: string,
    noteId: string,
  ): Promise<ProgressNoteSignaturesResponse> => {
    if (USE_MOCK) {
      return Promise.resolve({
        noteId,
        createdAt: new Date().toISOString(),
        responsibleClinician: null,
        signatures: [],
        allSigned: false,
        totalSignatures: 0,
      });
    }
    return apiClient
      .get<ProgressNoteSignaturesResponse>(
        `/patients/${patientId}/progress-notes/${noteId}/signatures`,
      )
      .then((r) => r.data);
  },
};