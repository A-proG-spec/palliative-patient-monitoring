import type { HospitalAdmission, AdmissionListResponse } from '@/types/admission.types';
import { delay } from '@/lib/utils';

export const MOCK_ADMISSIONS: HospitalAdmission[] = [
  {
    id: 'adm-001', patientId: 'pat-002', referralId: 'ref-001',
    admissionDate: '2026-08-24T00:00:00Z',
    bedNumber: 'PW-B-12', ward: 'Palliative Care Ward',
    admittingPhysician: 'Dr. Kebede Alemu', careTeam: 'Palliative Team A',
    primaryDiagnosis: 'Lung Cancer', secondaryDiagnoses: ['COPD'],
    diseaseStage: 'Terminal', comorbidities: ['COPD'],
    estimatedPrognosis: 'Weeks',
    ppsScore: 25, functionalStatus: 'FullyDependent',
    painScore: 7, painType: 'Chronic',
    symptomsPresent: ['Dyspnea', 'Fatigue', 'Anxiety'],
    emotionalStatus: 'Anxious', familySupport: 'Moderate',
    socialChallenges: 'Limited financial resources',
    spiritualConcerns: true, spiritualSupportPreferred: 'ReligiousLeader',
    painManagementPlan: 'Fentanyl patch 25mcg/h every 72h; PRN morphine 2.5mg SC for breakthrough pain',
    medicationPlan: 'Continue current medications; add Lorazepam 0.5mg PRN for anxiety',
    nursingCarePlan: 'Daily vitals, 2-hourly position changes, daily wound assessment',
    homeBasedCareRequired: false, psychosocialSupportPlan: 'Psychologist review twice weekly',
    physiotherapyRequired: false,
    status: 'Active',
    createdBy: 'staff-001', createdAt: '2026-08-24T10:00:00Z', updatedAt: '2026-08-24T10:00:00Z',
  },
  {
    id: 'adm-002', patientId: 'pat-012', referralId: 'ref-old-001',
    admissionDate: '2026-07-10T00:00:00Z', dischargeDate: '2026-08-05T00:00:00Z',
    bedNumber: 'PW-A-05', ward: 'Medical Ward',
    admittingPhysician: 'Dr. Tigist Alemu', careTeam: 'Palliative Team B',
    primaryDiagnosis: 'Bladder Cancer', secondaryDiagnoses: ['Haematuria'],
    diseaseStage: 'Advanced', comorbidities: ['Hypertension', 'Chronic kidney disease'],
    estimatedPrognosis: 'Months',
    ppsScore: 50, functionalStatus: 'PartiallyDependent',
    painScore: 5, painType: 'Mixed',
    symptomsPresent: ['Fatigue', 'Depression'],
    emotionalStatus: 'Depressed', familySupport: 'Strong',
    socialChallenges: undefined,
    spiritualConcerns: false,
    painManagementPlan: 'Morphine 10mg oral every 6 hours',
    medicationPlan: 'Continue antihypertensives; add antidepressant',
    nursingCarePlan: 'Daily monitoring; catheter care',
    homeBasedCareRequired: true,
    physiotherapyRequired: true,
    dischargeReason: 'Improved',
    status: 'Discharged',
    createdBy: 'staff-002', createdAt: '2026-07-10T10:00:00Z', updatedAt: '2026-08-05T10:00:00Z',
  },
];

export const mockAdmissionApi = {
  create: async (patientId: string, data: Record<string, unknown>): Promise<HospitalAdmission> => {
    await delay(800);
    const newAdm: HospitalAdmission = {
      id: 'adm-new-' + Date.now(),
      patientId,
      ...(data as Partial<HospitalAdmission>),
      status: 'Active',
      createdBy: 'staff-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as HospitalAdmission;
    MOCK_ADMISSIONS.push(newAdm);
    return newAdm;
  },

  getByPatient: async (patientId: string, params?: { status?: string; page?: number; limit?: number }): Promise<AdmissionListResponse> => {
    await delay(400);
    let filtered = MOCK_ADMISSIONS.filter((a) => a.patientId === patientId);
    if (params?.status) filtered = filtered.filter((a) => a.status === params.status);
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    return { items: filtered.slice(start, start + limit), page, limit, total: filtered.length };
  },

  getById: async (patientId: string, admissionId: string): Promise<HospitalAdmission> => {
    await delay(300);
    const adm = MOCK_ADMISSIONS.find((a) => a.patientId === patientId && a.id === admissionId);
    if (!adm) throw new Error('Admission not found');
    return adm;
  },

  update: async (patientId: string, admissionId: string, data: Record<string, unknown>): Promise<HospitalAdmission> => {
    await delay(500);
    const idx = MOCK_ADMISSIONS.findIndex((a) => a.patientId === patientId && a.id === admissionId);
    if (idx === -1) throw new Error('Admission not found');
    MOCK_ADMISSIONS[idx] = { ...MOCK_ADMISSIONS[idx], ...data, updatedAt: new Date().toISOString() };
    return MOCK_ADMISSIONS[idx];
  },
};
