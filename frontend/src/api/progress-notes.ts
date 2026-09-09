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

export const progressNotesApi = {
  create: (patientId: string, data: Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>): Promise<ProgressNote> => {
    if (USE_MOCK) return mockProgressNotesApi.create(patientId, data);
    return apiClient.post<ProgressNote>(`/patients/${patientId}/progress-notes`, data).then((r) => r.data);
  },

  getByPatient: (patientId: string, params?: { page?: number; limit?: number }): Promise<{ items: ProgressNote[]; total: number }> => {
    if (USE_MOCK) return mockProgressNotesApi.getByPatient(patientId, params);
    return apiClient.get<{ items: ProgressNote[]; total: number }>(`/patients/${patientId}/progress-notes`, { params }).then((r) => r.data);
  },

  getById: (patientId: string, noteId: string): Promise<ProgressNote> => {
    if (USE_MOCK) return mockProgressNotesApi.getById(patientId, noteId);
    return apiClient.get<ProgressNote>(`/patients/${patientId}/progress-notes/${noteId}`).then((r) => r.data);
  },

  update: (patientId: string, noteId: string, data: Partial<Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>>): Promise<ProgressNote> => {
    if (USE_MOCK) return mockProgressNotesApi.update(patientId, noteId, data);
    return apiClient.put<ProgressNote>(`/patients/${patientId}/progress-notes/${noteId}`, data).then((r) => r.data);
  },

  delete: (patientId: string, noteId: string): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return mockProgressNotesApi.delete(patientId, noteId);
    return apiClient.delete<{ id: string; success: boolean }>(`/patients/${patientId}/progress-notes/${noteId}`).then((r) => r.data);
  },
};