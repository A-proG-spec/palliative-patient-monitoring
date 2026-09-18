import type { Referral, ReferralListResponse } from '@/types/referral.types';
import { delay } from '@/lib/utils';

export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'ref-001', patientId: 'pat-002',
    referralType: 'Outgoing', referralDate: '2026-08-22T00:00:00Z',
    primaryDiagnosis: 'Lung Cancer', diseaseStage: 'EndStage',
    ppsScore: 30, kpsScore: 35,
    currentSymptoms: { pain: 7, dyspnea: 8, fatigue: 9, anxiety: 5, depression: 4 },
    reasons: ['InpatientAdmission', 'PainManagement', 'SymptomControl'],
    referringFacility: 'Y12HMC Home Care Unit',
    receivingFacility: 'Yekatit 12 Hospital Medical College',
    contactPerson: 'Dr. Kebede Alemu', contactNumber: '+251111234567',
    status: 'Accepted', actionTaken: 'PatientAdmitted',
    outcome: 'Patient admitted to palliative ward', followUpDate: '2026-09-01',
    followUpStatus: 'Pending',
    requestedBy: { id: 'staff-001', name: 'Staff Member' },
    approvedBy: { id: 'admin-001', name: 'Admin User' },
    createdAt: '2026-08-22T10:00:00Z', updatedAt: '2026-08-23T08:00:00Z',
  },
  {
    id: 'ref-002', patientId: 'pat-004',
    referralType: 'Outgoing', referralDate: '2026-08-26T00:00:00Z',
    primaryDiagnosis: 'Colorectal Cancer', diseaseStage: 'EndStage',
    ppsScore: 15, kpsScore: 18,
    currentSymptoms: { pain: 9, dyspnea: 6, fatigue: 10, anxiety: 7, depression: 6 },
    reasons: ['PainManagement', 'EmergencyCare'],
    referringFacility: 'Y12HMC Home Care Unit',
    receivingFacility: 'Tikur Anbessa Specialized Hospital',
    contactPerson: 'Dr. Mulugeta Tadesse', contactNumber: '+251111345678',
    status: 'Pending', actionTaken: null,
    outcome: '', followUpDate: null, followUpStatus: null,
    requestedBy: { id: 'staff-001', name: 'Staff Member' },
    createdAt: '2026-08-26T14:00:00Z', updatedAt: '2026-08-26T14:00:00Z',
  },
  {
    id: 'ref-003', patientId: 'pat-007',
    referralType: 'Outgoing', referralDate: '2026-08-20T00:00:00Z',
    primaryDiagnosis: 'Gastric Cancer', diseaseStage: 'Advanced',
    ppsScore: 45, kpsScore: 48,
    currentSymptoms: { pain: 5, dyspnea: 3, fatigue: 7, anxiety: 4, depression: 5 },
    reasons: ['SymptomControl', 'PsychologicalSupport'],
    referringFacility: 'Y12HMC Home Care Unit',
    receivingFacility: 'St. Paul Hospital Millennium Medical College',
    contactPerson: 'Dr. Hiwot Assefa', contactNumber: '+251111456789',
    status: 'Declined', actionTaken: 'ReferralDeclined',
    outcome: 'No inpatient bed available at this time.',
    followUpDate: null, followUpStatus: null,
    requestedBy: { id: 'staff-001', name: 'Staff Member' },
    approvedBy: { id: 'admin-001', name: 'Admin User' },
    createdAt: '2026-08-20T10:00:00Z', updatedAt: '2026-08-21T08:00:00Z',
  },
  {
    id: 'ref-004', patientId: 'pat-009',
    referralType: 'Outgoing', referralDate: '2026-08-28T00:00:00Z',
    primaryDiagnosis: 'Glioblastoma', diseaseStage: 'Advanced',
    ppsScore: 60, kpsScore: 65,
    currentSymptoms: { pain: 3, dyspnea: 1, fatigue: 5, anxiety: 6, depression: 5 },
    reasons: ['DiagnosticEvaluation', 'PsychologicalSupport'],
    referringFacility: 'Y12HMC Home Care Unit',
    receivingFacility: 'Tikur Anbessa Specialized Hospital - Neurology',
    contactPerson: 'Dr. Selamawit Bekele', contactNumber: '+251111567890',
    status: 'InfoRequested', actionTaken: 'AdditionalInfoRequested',
    outcome: 'Please provide latest MRI report and neurosurgeon assessment.',
    followUpDate: null, followUpStatus: null,
    requestedBy: { id: 'staff-001', name: 'Staff Member' },
    approvedBy: { id: 'admin-001', name: 'Admin User' },
    createdAt: '2026-08-28T10:00:00Z', updatedAt: '2026-08-28T16:00:00Z',
  },
  {
    id: 'ref-005', patientId: 'pat-001',
    referralType: 'Outgoing', referralDate: '2026-08-29T00:00:00Z',
    primaryDiagnosis: 'Stage IV Breast Cancer', diseaseStage: 'Advanced',
    ppsScore: 40, kpsScore: 42,
    currentSymptoms: { pain: 6, dyspnea: 2, fatigue: 8, anxiety: 4, depression: 3 },
    reasons: ['PainManagement', 'HomeHospiceCare'],
    referringFacility: 'Y12HMC Home Care Unit',
    receivingFacility: 'Yekatit 12 Hospital Medical College',
    contactPerson: 'Dr. Kebede Alemu', contactNumber: '+251111234567',
    status: 'Pending', actionTaken: null,
    outcome: '', followUpDate: null, followUpStatus: null,
    requestedBy: { id: 'staff-001', name: 'Staff Member' },
    createdAt: '2026-08-29T09:00:00Z', updatedAt: '2026-08-29T09:00:00Z',
  },
];

export const mockReferralApi = {
  create: async (patientId: string, data: Record<string, unknown>): Promise<Referral> => {
    await delay(700);
    const newRef: Referral = {
      id: 'ref-new-' + Date.now(),
      patientId,
      ...(data as Partial<Referral>),
      status: 'Pending',
      actionTaken: null,
      outcome: '',
      requestedBy: { id: 'staff-001', name: 'Staff Member' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Referral;
    MOCK_REFERRALS.push(newRef);
    return newRef;
  },

  getByPatient: async (patientId: string, params?: { status?: string; page?: number; limit?: number }): Promise<ReferralListResponse> => {
    await delay(350);
    let filtered = MOCK_REFERRALS.filter((r) => r.patientId === patientId);
    if (params?.status) filtered = filtered.filter((r) => r.status === params.status);
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    return { items: filtered.slice(start, start + limit), page, limit, total: filtered.length };
  },

  getById: async (patientId: string, referralId: string): Promise<Referral> => {
    await delay(300);
    const ref = MOCK_REFERRALS.find((r) => r.patientId === patientId && r.id === referralId);
    if (!ref) throw new Error('Referral not found');
    return ref;
  },
};
