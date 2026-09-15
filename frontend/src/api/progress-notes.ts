import apiClient from './client';
import type {
  ProgressNote,
  ProgressNoteListItem,
  ProgressNoteSignature,
} from '@/hooks/useProgressNotes';

// ─────────────────────────────────────────────────────────────
// Request / response types
// ─────────────────────────────────────────────────────────────

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
  signedBy: {
    staffId: string;
    name: string;
    role: string;
    signedAt: string;
  };
  signatures: ProgressNoteSignature[];
  allSigned: boolean;
}

export interface ProgressNoteSignaturesResponse {
  noteId: string;
  createdAt: string;
  responsibleClinician: {
    staffId: string;
    name: string;
    role: string;
  } | null;
  signatures: ProgressNoteSignature[];
  allSigned: boolean;
  totalSignatures: number;
}

// ─────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────

export const progressNotesApi = {
  create: (
    patientId: string,
    data: Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>,
  ): Promise<ProgressNote> => {
    return apiClient
      .post<ProgressNote>(`/patients/${patientId}/progress-notes`, data)
      .then((r) => r.data);
  },

  getByPatient: (
    patientId: string,
    params?: { admissionId?: string; page?: number; limit?: number },
  ): Promise<{ items: ProgressNoteListItem[]; total: number }> => {
    return apiClient
      .get<{ items: ProgressNoteListItem[]; total: number }>(
        `/patients/${patientId}/progress-notes`,
        { params },
      )
      .then((r) => r.data);
  },

  getById: (patientId: string, noteId: string): Promise<ProgressNote> => {
    return apiClient
      .get<ProgressNote>(`/patients/${patientId}/progress-notes/${noteId}`)
      .then((r) => r.data);
  },

  update: (
    patientId: string,
    noteId: string,
    data: Partial<Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>>,
  ): Promise<ProgressNote> => {
    return apiClient
      .put<ProgressNote>(`/patients/${patientId}/progress-notes/${noteId}`, data)
      .then((r) => r.data);
  },

  delete: (
    patientId: string,
    noteId: string,
    reason?: string,
  ): Promise<{ id: string; success: boolean }> => {
    return apiClient
      .delete<{ id: string; success: boolean }>(
        `/patients/${patientId}/progress-notes/${noteId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  sign: (
    patientId: string,
    noteId: string,
    data: SignProgressNoteRequest,
  ): Promise<SignProgressNoteResponse> => {
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
    return apiClient
      .get<ProgressNoteSignaturesResponse>(
        `/patients/${patientId}/progress-notes/${noteId}/signatures`,
      )
      .then((r) => r.data);
  },
};