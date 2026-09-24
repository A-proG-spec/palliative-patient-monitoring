import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as progressNoteService from '@services/progress-note.service.js';

export const createProgressNote = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const result = await progressNoteService.createProgressNote(patientId, req.body, req.user.id);
  return SuccessResponse(201, 'Progress note saved successfully', result);
});

export const getProgressNotes = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const filters = { admissionId: req.query.admissionId as string | undefined };
  const result = await progressNoteService.getProgressNotes(patientId, filters, page, limit);
  return SuccessResponse(200, 'OK', result);
});

export const getAllProgressNotes = asyncHandler(
  async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const filters = {
      admissionId: req.query.admissionId as string | undefined,
      includeDeleted: req.query.includeDeleted === 'true',
    };

    const result = await progressNoteService.getAllProgressNotes(
      patientId,
      filters,
      page,
      limit,
    );
    return SuccessResponse(200, 'OK', result);
  },
);

export const getProgressNoteById = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const noteId = req.params.noteId as string;
  const result = await progressNoteService.getProgressNoteById(patientId, noteId);
  return SuccessResponse(200, 'OK', result);
});

export const signProgressNote = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const noteId = req.params.noteId as string;
  const result = await progressNoteService.signProgressNote(patientId, noteId, req.body);
  return SuccessResponse(200, 'Progress note signed successfully', result);
});

export const getProgressNoteSignatures = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const noteId = req.params.noteId as string;
  const result = await progressNoteService.getProgressNoteSignatures(patientId, noteId);
  return SuccessResponse(200, 'OK', result);
});

export const updateProgressNote = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const noteId = req.params.noteId as string;
  const result = await progressNoteService.updateProgressNote(
    patientId,
    noteId,
    req.body,
    req.user.id,
  );
  return SuccessResponse(200, 'Progress note updated successfully', result);
});

// ── Soft delete (admin only) ──
export const deleteProgressNote = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const noteId = req.params.noteId as string;
  const { reason } = req.body;
  const result = await progressNoteService.deleteProgressNote(
    patientId,
    noteId,
    req.user.id,
    reason,
  );
  return SuccessResponse(200, 'Progress note deleted', result);
});

// ── Restore (admin only) ──
export const restoreProgressNote = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const noteId = req.params.noteId as string;
  const result = await progressNoteService.restoreProgressNote(
    patientId,
    noteId,
    req.user.id,
  );
  return SuccessResponse(200, 'Progress note restored', result);
});

export default {
  getAllProgressNotes,
  createProgressNote,
  getProgressNotes,
  getProgressNoteById,
  signProgressNote,
  getProgressNoteSignatures,
  updateProgressNote,
  deleteProgressNote,
  restoreProgressNote,
};