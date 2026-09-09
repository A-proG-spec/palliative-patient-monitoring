import type { ImagingOrder, CreateImagingRequest, UpdateImagingReportRequest } from '@/api/imaging';
import { delay } from '@/lib/utils';

// ── In-memory store ──────────────────────────────────────────────
const MOCK_IMAGING_ORDERS: ImagingOrder[] = [];

export const mockImagingApi = {
  create: async (patientId: string, data: CreateImagingRequest): Promise<ImagingOrder> => {
    await delay(600);
    const newOrder: ImagingOrder = {
      id: `img-${Date.now()}`,
      patientId,
      ...data,
      status: 'Ordered',
      orderedBy: 'staff-001',
      dateOrdered: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    } as ImagingOrder;
    MOCK_IMAGING_ORDERS.push(newOrder);
    return newOrder;
  },

  getByPatient: async (patientId: string, params?: { status?: 'Ordered' | 'Completed'; page?: number; limit?: number }): Promise<{ items: ImagingOrder[]; total: number }> => {
    await delay(400);
    let filtered = MOCK_IMAGING_ORDERS.filter((i) => i.patientId === patientId);
    if (params?.status) filtered = filtered.filter((i) => i.status === params.status);
    // Sort by date descending (newest first)
    filtered = filtered.sort((a, b) => new Date(b.dateOrdered).getTime() - new Date(a.dateOrdered).getTime());
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
    };
  },

  getById: async (patientId: string, imagingId: string): Promise<ImagingOrder> => {
    await delay(300);
    const order = MOCK_IMAGING_ORDERS.find((i) => i.id === imagingId && i.patientId === patientId);
    if (!order) throw new Error('Imaging order not found');
    return order;
  },

  updateReport: async (patientId: string, imagingId: string, data: UpdateImagingReportRequest): Promise<ImagingOrder> => {
    await delay(500);
    const idx = MOCK_IMAGING_ORDERS.findIndex((i) => i.id === imagingId && i.patientId === patientId);
    if (idx === -1) throw new Error('Imaging order not found');
    MOCK_IMAGING_ORDERS[idx] = {
      ...MOCK_IMAGING_ORDERS[idx],
      ...data,
      status: 'Completed',
      updatedAt: new Date().toISOString(),
    };
    return MOCK_IMAGING_ORDERS[idx];
  },

  updateStatus: async (patientId: string, imagingId: string, status: 'Ordered' | 'Completed'): Promise<ImagingOrder> => {
    await delay(400);
    const idx = MOCK_IMAGING_ORDERS.findIndex((i) => i.id === imagingId && i.patientId === patientId);
    if (idx === -1) throw new Error('Imaging order not found');
    MOCK_IMAGING_ORDERS[idx] = {
      ...MOCK_IMAGING_ORDERS[idx],
      status,
      updatedAt: new Date().toISOString(),
    };
    return MOCK_IMAGING_ORDERS[idx];
  },

  delete: async (patientId: string, imagingId: string): Promise<{ id: string; success: boolean }> => {
    await delay(400);
    const idx = MOCK_IMAGING_ORDERS.findIndex((i) => i.id === imagingId && i.patientId === patientId);
    if (idx === -1) throw new Error('Imaging order not found');
    MOCK_IMAGING_ORDERS.splice(idx, 1);
    return { id: imagingId, success: true };
  },
};