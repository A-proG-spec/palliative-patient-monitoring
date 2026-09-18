import type { ProgressNote } from '@/hooks/useProgressNotes';
import { delay } from '@/lib/utils';

// ── In-memory store ──────────────────────────────────────────────
const MOCK_PROGRESS_NOTES: ProgressNote[] = [];

export const mockProgressNotesApi = {
  create: async (patientId: string, data: Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>): Promise<ProgressNote> => {
    await delay(600);
    const newNote: ProgressNote = {
      id: `pn-${Date.now()}`,
      patientId,
      createdAt: new Date().toISOString(),
      ...data,
    } as ProgressNote;
    MOCK_PROGRESS_NOTES.push(newNote);
    return newNote;
  },

  getByPatient: async (patientId: string, params?: { page?: number; limit?: number }): Promise<{ items: ProgressNote[]; total: number }> => {
    await delay(400);
    let filtered = MOCK_PROGRESS_NOTES.filter((n) => n.patientId === patientId);
    // Sort by date descending (newest first)
    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
    };
  },

  getById: async (patientId: string, noteId: string): Promise<ProgressNote> => {
    await delay(300);
    const note = MOCK_PROGRESS_NOTES.find((n) => n.id === noteId && n.patientId === patientId);
    if (!note) throw new Error('Progress note not found');
    return note;
  },

  update: async (patientId: string, noteId: string, data: Partial<Omit<ProgressNote, 'id' | 'patientId' | 'createdAt'>>): Promise<ProgressNote> => {
    await delay(500);
    const idx = MOCK_PROGRESS_NOTES.findIndex((n) => n.id === noteId && n.patientId === patientId);
    if (idx === -1) throw new Error('Progress note not found');
    MOCK_PROGRESS_NOTES[idx] = { ...MOCK_PROGRESS_NOTES[idx], ...data };
    return MOCK_PROGRESS_NOTES[idx];
  },

  delete: async (patientId: string, noteId: string): Promise<{ id: string; success: boolean }> => {
    await delay(400);
    const idx = MOCK_PROGRESS_NOTES.findIndex((n) => n.id === noteId && n.patientId === patientId);
    if (idx === -1) throw new Error('Progress note not found');
    MOCK_PROGRESS_NOTES.splice(idx, 1);
    return { id: noteId, success: true };
  },
};