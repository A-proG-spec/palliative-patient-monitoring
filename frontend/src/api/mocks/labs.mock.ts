import type { LaboratoryTest, LabListResponse } from '@/types/lab.types';
import { delay } from '@/lib/utils';

export const MOCK_LABS: LaboratoryTest[] = [
  { id: 'lab-001', patientId: 'pat-001', testName: 'Complete Blood Count', orderedBy: 'staff-001', dateOrdered: '2026-08-20T00:00:00Z', datePerformed: '2026-08-21T00:00:00Z', result: 'Hb: 9.5 g/dL, WBC: 6.2×10³/μL, Plt: 180×10³/μL', location: 'Home', status: 'Completed', createdAt: '2026-08-20T08:00:00Z' },
  { id: 'lab-002', patientId: 'pat-001', testName: 'Serum Creatinine', orderedBy: 'staff-001', dateOrdered: '2026-08-25T00:00:00Z', location: 'Home', status: 'Ordered', createdAt: '2026-08-25T08:00:00Z' },
  { id: 'lab-003', patientId: 'pat-002', testName: 'Arterial Blood Gas', orderedBy: 'staff-001', dateOrdered: '2026-08-18T00:00:00Z', datePerformed: '2026-08-18T00:00:00Z', result: 'pH 7.36, PO2 68 mmHg, PCO2 42 mmHg', location: 'Hospital', status: 'Completed', createdAt: '2026-08-18T08:00:00Z' },
  { id: 'lab-004', patientId: 'pat-002', testName: 'Chest X-Ray', orderedBy: 'staff-001', dateOrdered: '2026-08-20T00:00:00Z', location: 'Hospital', status: 'Ordered', createdAt: '2026-08-20T08:00:00Z' },
  { id: 'lab-005', patientId: 'pat-003', testName: 'Pap Smear', orderedBy: 'staff-002', dateOrdered: '2026-08-15T00:00:00Z', datePerformed: '2026-08-16T00:00:00Z', result: 'Atypical cells present', location: 'Home', status: 'Completed', createdAt: '2026-08-15T08:00:00Z' },
  { id: 'lab-006', patientId: 'pat-004', testName: 'LFT (Liver Function Tests)', orderedBy: 'staff-001', dateOrdered: '2026-08-24T00:00:00Z', location: 'Home', status: 'Ordered', createdAt: '2026-08-24T08:00:00Z' },
  { id: 'lab-007', patientId: 'pat-005', testName: 'CA-125 Tumour Marker', orderedBy: 'staff-003', dateOrdered: '2026-08-22T00:00:00Z', datePerformed: '2026-08-23T00:00:00Z', result: 'CA-125: 850 U/mL (elevated)', location: 'Home', status: 'Completed', createdAt: '2026-08-22T08:00:00Z' },
  { id: 'lab-008', patientId: 'pat-008', testName: 'Urinalysis', orderedBy: 'staff-003', dateOrdered: '2026-08-29T00:00:00Z', location: 'Home', status: 'Ordered', createdAt: '2026-08-29T08:00:00Z' },
  { id: 'lab-009', patientId: 'pat-009', testName: 'MRI Brain', orderedBy: 'staff-001', dateOrdered: '2026-08-10T00:00:00Z', datePerformed: '2026-08-12T00:00:00Z', result: 'Tumour progression noted in left temporal lobe', location: 'Hospital', status: 'Completed', createdAt: '2026-08-10T08:00:00Z' },
  { id: 'lab-010', patientId: 'pat-010', testName: 'Barium Swallow', orderedBy: 'staff-002', dateOrdered: '2026-08-14T00:00:00Z', location: 'Hospital', status: 'Ordered', createdAt: '2026-08-14T08:00:00Z' },
];

export const mockLabApi = {
  create: async (patientId: string, data: Record<string, unknown>): Promise<LaboratoryTest> => {
    await delay(600);
    const newLab: LaboratoryTest = {
      id: 'lab-new-' + Date.now(),
      patientId,
      testName: data.testName as string,
      orderedBy: 'staff-001',
      dateOrdered: data.dateOrdered as string,
      location: data.location as 'Home' | 'Hospital',
      status: 'Ordered',
      createdAt: new Date().toISOString(),
    };
    MOCK_LABS.push(newLab);
    return newLab;
  },

  getByPatient: async (patientId: string, params?: { status?: string; page?: number; limit?: number }): Promise<LabListResponse> => {
    await delay(350);
    let filtered = MOCK_LABS.filter((l) => l.patientId === patientId);
    if (params?.status) filtered = filtered.filter((l) => l.status === params.status);
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    return { items: filtered.slice(start, start + limit), page, limit, total: filtered.length };
  },

  getById: async (patientId: string, labId: string): Promise<LaboratoryTest> => {
    await delay(300);
    const lab = MOCK_LABS.find((l) => l.patientId === patientId && l.id === labId);
    if (!lab) throw new Error('Lab test not found');
    return lab;
  },

  updateResult: async (patientId: string, labId: string, data: { datePerformed: string; result: string }): Promise<LaboratoryTest> => {
    await delay(400);
    const idx = MOCK_LABS.findIndex((l) => l.patientId === patientId && l.id === labId);
    if (idx === -1) throw new Error('Lab test not found');
    MOCK_LABS[idx] = { ...MOCK_LABS[idx], ...data, status: 'Completed', updatedAt: new Date().toISOString() };
    return MOCK_LABS[idx];
  },
};
