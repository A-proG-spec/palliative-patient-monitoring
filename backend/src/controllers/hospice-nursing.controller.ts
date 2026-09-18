import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as hospiceService from '@services/hospice-nursing.service.js';

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createHospiceNursingAssessment = asyncHandler(
    async (req: Request, res: Response) => {
        const patientId = req.params.patientId as string;
        const result = await hospiceService.createHospiceNursingAssessment(
            patientId,
            req.body,
            req.user.id,
        );
        return SuccessResponse(201, 'Hospice nursing assessment saved', result);
    },
);

// ═════════════════════════════════════════════════════════════
// LIST (per patient, paginated)
// ═════════════════════════════════════════════════════════════
export const getHospiceNursingAssessments = asyncHandler(
    async (req: Request, res: Response) => {
        const patientId = req.params.patientId as string;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

        const result = await hospiceService.getHospiceNursingAssessments(
            patientId,
            page,
            limit,
        );
        return SuccessResponse(200, 'OK', result);
    },
);

// ═════════════════════════════════════════════════════════════
// GET ONE
// ═════════════════════════════════════════════════════════════
export const getHospiceNursingAssessmentById = asyncHandler(
    async (req: Request, res: Response) => {
        const patientId = req.params.patientId as string;
        const assessmentId = req.params.assessmentId as string;

        const result = await hospiceService.getHospiceNursingAssessmentById(
            patientId,
            assessmentId,
        );
        return SuccessResponse(200, 'OK', result);
    },
);

// ═════════════════════════════════════════════════════════════
// UPDATE — admin only (whitelisted fields)
// ═════════════════════════════════════════════════════════════
export const updateHospiceNursingAssessment = asyncHandler(
    async (req: Request, res: Response) => {
        const patientId = req.params.patientId as string;
        const assessmentId = req.params.assessmentId as string;

        const result = await hospiceService.updateHospiceNursingAssessment(
            patientId,
            assessmentId,
            req.body,
            req.user.id,
        );
        return SuccessResponse(200, 'Hospice nursing assessment updated', result);
    },
);

// ═════════════════════════════════════════════════════════════
// SOFT DELETE — admin only
// ═════════════════════════════════════════════════════════════
export const deleteHospiceNursingAssessment = asyncHandler(
    async (req: Request, res: Response) => {
        const patientId = req.params.patientId as string;
        const assessmentId = req.params.assessmentId as string;
        const { reason } = req.body ?? {};

        const result = await hospiceService.deleteHospiceNursingAssessment(
            patientId,
            assessmentId,
            req.user.id,
            reason,
        );
        return SuccessResponse(200, 'Hospice nursing assessment deleted', result);
    },
);

// ═════════════════════════════════════════════════════════════
// RESTORE — admin only
// ═════════════════════════════════════════════════════════════
export const restoreHospiceNursingAssessment = asyncHandler(
    async (req: Request, res: Response) => {
        const patientId = req.params.patientId as string;
        const assessmentId = req.params.assessmentId as string;

        const result = await hospiceService.restoreHospiceNursingAssessment(
            patientId,
            assessmentId,
            req.user.id,
        );
        return SuccessResponse(200, 'Hospice nursing assessment restored', result);
    },
);

// ═════════════════════════════════════════════════════════════
// LIST DELETED — admin only, global (not per-patient)
// ═════════════════════════════════════════════════════════════
export const getDeletedHospiceNursingAssessments = asyncHandler(
    async (req: Request, res: Response) => {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

        const result = await hospiceService.getDeletedHospiceNursingAssessments(
            page,
            limit,
        );
        return SuccessResponse(200, 'OK', result);
    },
);

export default {
    createHospiceNursingAssessment,
    getHospiceNursingAssessments,
    getHospiceNursingAssessmentById,
    updateHospiceNursingAssessment,
    deleteHospiceNursingAssessment,
    restoreHospiceNursingAssessment,
    getDeletedHospiceNursingAssessments,
};