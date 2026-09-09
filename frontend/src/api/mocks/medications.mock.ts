import type { Medication, MedicationListResponse } from '@/types/medication.types';
import { delay } from '@/lib/utils';

export const MOCK_MEDICATIONS: Medication[] = [
  { id: 'med-001', patientId: 'pat-001', name: 'Morphine', dosage: '10mg', frequency: 'Every 6 hours', route: 'Oral', prescribedBy: 'staff-001', administeredAt: 'Home', status: 'Ordered', createdAt: '2026-08-25T08:00:00Z' },
  { id: 'med-002', patientId: 'pat-001', name: 'Paracetamol', dosage: '500mg', frequency: 'Every 8 hours', route: 'Oral', prescribedBy: 'staff-001', administeredAt: 'Home', status: 'Given', createdAt: '2026-08-20T08:00:00Z' },
  { id: 'med-003', patientId: 'pat-001', name: 'Ondansetron', dosage: '4mg', frequency: 'Twice daily', route: 'Oral', prescribedBy: 'staff-001', administeredAt: 'Home', status: 'Ordered', createdAt: '2026-08-22T08:00:00Z' },
  { id: 'med-004', patientId: 'pat-002', name: 'Fentanyl patch', dosage: '25mcg/h', frequency: 'Every 72 hours', route: 'Transdermal', prescribedBy: 'staff-001', administeredAt: 'Hospital', status: 'Ordered', createdAt: '2026-08-18T08:00:00Z' },
  { id: 'med-005', patientId: 'pat-002', name: 'Dexamethasone', dosage: '4mg', frequency: 'Twice daily', route: 'Oral', prescribedBy: 'staff-001', administeredAt: 'Hospital', status: 'Given', createdAt: '2026-08-10T08:00:00Z' },
  { id: 'med-006', patientId: 'pat-003', name: 'Tramadol', dosage: '50mg', frequency: 'Every 6 hours', route: 'Oral', prescribedBy: 'staff-002', administeredAt: 'Home', status: 'Ordered', createdAt: '2026-08-20T08:00:00Z' },
  { id: 'med-007', patientId: 'pat-004', name: 'Morphine IV', dosage: '5mg', frequency: 'Every 4 hours', route: 'IV', prescribedBy: 'staff-001', administeredAt: 'Home', status: 'Ordered', createdAt: '2026-08-24T08:00:00Z' },
  { id: 'med-008', patientId: 'pat-005', name: 'Ibuprofen', dosage: '400mg', frequency: 'Three times daily', route: 'Oral', prescribedBy: 'staff-003', administeredAt: 'Home', status: 'Given', createdAt: '2026-08-22T08:00:00Z' },
  { id: 'med-009', patientId: 'pat-007', name: 'Metoclopramide', dosage: '10mg', frequency: 'Before meals', route: 'Oral', prescribedBy: 'staff-001', administeredAt: 'Home', status: 'Ordered', createdAt: '2026-08-21T08:00:00Z' },
  { id: 'med-010', patientId: 'pat-008', name: 'Morphine', dosage: '15mg', frequency: 'Every 4 hours', route: 'Subcutaneous', prescribedBy: 'staff-003', administeredAt: 'Home', status: 'Ordered', createdAt: '2026-08-29T08:00:00Z' },
];

export const mockMedicationApi = {
  create: async (patientId: string, data: Record<string, unknown>): Promise<Medication> => {
    await delay(600);
    const newMed: Medication = {
      id: 'med-new-' + Date.now(),
      patientId,
      name: data.name as string,
      dosage: data.dosage as string,
      frequency: data.frequency as string,
      route: data.route as string,
      prescribedBy: 'staff-001',
      administeredAt: data.administeredAt as 'Home' | 'Hospital',
      status: 'Ordered',
      createdAt: new Date().toISOString(),
    };
    MOCK_MEDICATIONS.push(newMed);
    return newMed;
  },

  getByPatient: async (patientId: string, params?: { status?: string; page?: number; limit?: number }): Promise<MedicationListResponse> => {
    await delay(350);
    let filtered = MOCK_MEDICATIONS.filter((m) => m.patientId === patientId);
    if (params?.status) filtered = filtered.filter((m) => m.status === params.status);
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    return { items: filtered.slice(start, start + limit), page, limit, total: filtered.length };
  },

  getById: async (patientId: string, medicationId: string): Promise<Medication> => {
    await delay(300);
    const med = MOCK_MEDICATIONS.find((m) => m.patientId === patientId && m.id === medicationId);
    if (!med) throw new Error('Medication not found');
    return med;
  },

  updateStatus: async (patientId: string, medicationId: string, data: { status: 'Ordered' | 'Given' }): Promise<Medication> => {
    await delay(400);
    const idx = MOCK_MEDICATIONS.findIndex((m) => m.patientId === patientId && m.id === medicationId);
    if (idx === -1) throw new Error('Medication not found');
    MOCK_MEDICATIONS[idx] = { ...MOCK_MEDICATIONS[idx], status: data.status, updatedAt: new Date().toISOString() };
    return MOCK_MEDICATIONS[idx];
  },
};
