import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import { mockImagingApi } from './mocks/imaging.mock';

// ═══════════════════════════════════════════════════════════════
// Re-export canonical types from @/types/imaging.types
//
// This file previously declared its own duplicate copies of these
// types, which drifted from the canonical definitions (most
// notably `preparation: string[]` here vs `ImagingPreparation[]`
// in the canonical file) and caused TS2345 errors when imaging
// records were passed to printPatientReport.
//
// By re-exporting, all consumers of `@/api/imaging` — including
// existing imports across the codebase — continue to work
// unchanged, but they now resolve to the single canonical set.
// ═══════════════════════════════════════════════════════════════
export type {
  ImagingModality,
  ImagingContrastDecision,
  ImagingPregnancyStatus,
  ImagingMetallicForeignBody,
  ImagingPriority,
  ImagingLaterality,
  ImagingImageQuality,
  ImagingPreparation,
  ImagingPerformedContrast,
  ImagingStatus,
  ImagingOrderReport,
  ImagingOrder,
  ImagingOrderListItem,
  CreateImagingRequest,
  UpdateImagingReportRequest,
  RecordImagingPerformedRequest,
  UpdateImagingStatusRequest,
  ImagingListResponse,
} from '@/types/imaging.types';

// ═══════════════════════════════════════════════════════════════
// Re-export queue-specific types from @/api/imaging-queue
//
// These types are NOT part of the patient-scoped imaging resource
// — they describe the flat, cross-patient radiologist queue
// returned by `/imaging/pending-orders` and
// `/imaging/completed-orders`. They live in their own module.
// ═══════════════════════════════════════════════════════════════
export type {
  PendingImagingOrder,
  ImagingOrderDetail,
  ImagingQueueListResponse,
  SubmitImagingReportRequest,
  SubmitImagingReportResponse,
} from '@/api/imaging-queue';

// ═══════════════════════════════════════════════════════════════
// Local imports of the types used in the API object signatures
// below. We re-import them so TypeScript can resolve them by
// name inside this file — `export type { ... } from '...'` only
// re-exports, it does not bring the names into local scope.
// ═══════════════════════════════════════════════════════════════
import type {
  ImagingModality,
  ImagingPriority,
  ImagingStatus,
  ImagingOrder,
  CreateImagingRequest,
  UpdateImagingReportRequest,
  RecordImagingPerformedRequest,
  ImagingListResponse,
} from '@/types/imaging.types';

// ═══════════════════════════════════════════════════════════════
// API object
// ═══════════════════════════════════════════════════════════════
export const imagingApi = {
  create: (
    patientId: string,
    data: CreateImagingRequest,
  ): Promise<ImagingOrder> => {
    if (USE_MOCK) return mockImagingApi.create(patientId, data as any);
    return apiClient
      .post<ImagingOrder>(`/patients/${patientId}/imaging`, data)
      .then((r) => r.data);
  },

  /**
   * Active-only list.
   */
  getByPatient: (
    patientId: string,
    params?: {
      status?: ImagingStatus;
      modality?: ImagingModality;
      priority?: ImagingPriority;
      page?: number;
      limit?: number;
    },
  ): Promise<ImagingListResponse> => {
    if (USE_MOCK)
      return mockImagingApi.getByPatient(patientId, params as any) as any;
    return apiClient
      .get<ImagingListResponse>(`/patients/${patientId}/imaging`, { params })
      .then((r) => r.data);
  },

  /**
   * Active + deleted list. Hits `/patients/:id/imaging/all`.
   */
  getAllForPatient: (
    patientId: string,
    params?: {
      status?: ImagingStatus;
      modality?: ImagingModality;
      priority?: ImagingPriority;
      includeDeleted?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<ImagingListResponse> => {
    const { includeDeleted, ...rest } = params ?? {};
    return apiClient
      .get<ImagingListResponse>(`/patients/${patientId}/imaging/all`, {
        params: {
          ...rest,
          ...(includeDeleted ? { includeDeleted: 'true' } : {}),
        },
      })
      .then((r) => r.data);
  },

  getById: (
    patientId: string,
    imagingId: string,
  ): Promise<ImagingOrder> => {
    if (USE_MOCK)
      return mockImagingApi.getById(patientId, imagingId) as any;
    return apiClient
      .get<ImagingOrder>(`/patients/${patientId}/imaging/${imagingId}`)
      .then((r) => r.data);
  },

  updateReport: (
    patientId: string,
    imagingId: string,
    data: UpdateImagingReportRequest,
  ): Promise<ImagingOrder> => {
    if (USE_MOCK)
      return mockImagingApi.updateReport(
        patientId,
        imagingId,
        data as any,
      ) as any;
    return apiClient
      .put<ImagingOrder>(
        `/patients/${patientId}/imaging/${imagingId}/report`,
        data,
      )
      .then((r) => r.data);
  },

  recordPerformed: (
    patientId: string,
    imagingId: string,
    data: RecordImagingPerformedRequest,
  ): Promise<ImagingOrder> => {
    if (USE_MOCK)
      return mockImagingApi.getById(patientId, imagingId) as any;
    return apiClient
      .put<ImagingOrder>(
        `/patients/${patientId}/imaging/${imagingId}/performed`,
        data,
      )
      .then((r) => r.data);
  },

  updateStatus: (
    patientId: string,
    imagingId: string,
    status: ImagingStatus,
  ): Promise<ImagingOrder> => {
    if (USE_MOCK)
      return mockImagingApi.updateStatus(
        patientId,
        imagingId,
        status,
      ) as any;
    return apiClient
      .put<ImagingOrder>(
        `/patients/${patientId}/imaging/${imagingId}/status`,
        { status },
      )
      .then((r) => r.data);
  },

  delete: (
    patientId: string,
    imagingId: string,
    reason?: string,
  ): Promise<{ id: string; success: boolean }> => {
    if (USE_MOCK) return mockImagingApi.delete(patientId, imagingId);
    return apiClient
      .delete<{ id: string; success: boolean }>(
        `/patients/${patientId}/imaging/${imagingId}`,
        { data: { reason } },
      )
      .then((r) => r.data);
  },

  restore: (
    patientId: string,
    imagingId: string,
  ): Promise<{ id: string; restored: boolean }> => {
    if (USE_MOCK)
      return Promise.resolve({ id: imagingId, restored: true });
    return apiClient
      .post<{ id: string; restored: boolean }>(
        `/patients/${patientId}/imaging/${imagingId}/restore`,
      )
      .then((r) => r.data);
  },
};