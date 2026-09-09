import type { HomeVisit, VisitListResponse } from '@/types/visit.types';
import { delay } from '@/lib/utils';

const makeVisit = (id: string, patientId: string, date: string, outcome: HomeVisit['outcome'], redFlags: string[] = ['None'], ppsScore = 50, kpsScore = 55): HomeVisit => ({
  id,
  patientId,
  visitDate: date,
  timeStarted: '09:00',
  timeEnded: '10:30',
  visitType: 'Routine',
  teamMembers: [
    { role: 'Physician', name: 'John Doe' },
    { role: 'Nurse', name: 'Selam Bekele' },
  ],
  overallStatus: outcome === 'Stable' || outcome === 'SymptomsImproved' ? 'Stable' : 'Deteriorating',
  mobility: 'RequiresAssistance',
  vitals: { temperature: 36.8, pulse: 88, bp: '120/80', respiration: 18, spo2: 96 },
  painScore: 4,
  painLocation: ['Abdomen', 'Back'],
  painCharacteristics: ['Dull', 'Intermittent'],
  painMedicationEffective: true,
  symptoms: ['Fatigue', 'PoorAppetite'],
  adl: { feeding: 'NeedsAssistance', bathing: 'NeedsAssistance', dressing: 'NeedsAssistance', toileting: 'NeedsAssistance', mobility: 'NeedsAssistance' },
  ppsScore,
  kpsScore,
  appetite: 'Poor',
  oralIntake: 'Reduced',
  hydrationStatus: 'Adequate',
  emotionalStatus: 'Anxious',
  familySupport: 'Good',
  financialDifficulty: false,
  spiritualNeeds: false,
  religiousSupportRequested: false,
  medicationAvailable: true,
  medicationCorrectlyTaken: true,
  medicationSideEffects: false,
  medicationRefillNeeded: false,
  morphineAvailable: true,
  adherenceLevel: 'Good',
  currentMedications: [{ name: 'Morphine', dosage: '10mg', frequency: 'Every 6h', route: 'Oral' }],
  caregiverBurden: 'Moderate',
  caregiverUnderstanding: 'Good',
  caregivingCapacity: 'Moderate',
  familyEmotionalStatus: 'Stressed',
  educationProvided: ['PainManagement', 'MedicationAdministration'],
  homeCondition: 'Clean',
  homeObservations: ['AdequateLighting', 'CleanWater'],
  nursingCareGiven: ['Hygiene', 'MedicationAdmin'],
  redFlags,
  redFlagActions: redFlags.includes('None') ? undefined : 'Contacted physician; patient stabilized.',
  referralsMade: [],
  outcome,
  nextVisitDate: '2026-09-05',
  teamLeaderId: 'staff-002',
  physicianId: 'staff-001',
  nurseId: 'staff-003',
  createdAt: date + 'T11:00:00Z',
});

export const MOCK_VISITS: HomeVisit[] = [
  makeVisit('v-001', 'pat-001', '2026-08-25', 'Stable', ['None'], 40, 42),
  makeVisit('v-002', 'pat-001', '2026-08-18', 'SymptomsImproved', ['None'], 44, 46),
  makeVisit('v-003', 'pat-001', '2026-08-10', 'SymptomsUnchanged', ['None'], 48, 50),
  makeVisit('v-004', 'pat-002', '2026-08-20', 'SymptomsWorsened', ['SevereUncontrolledPain'], 25, 28),
  makeVisit('v-005', 'pat-002', '2026-08-12', 'Stable', ['None'], 30, 35),
  makeVisit('v-006', 'pat-003', '2026-08-22', 'Stable', ['None'], 52, 55),
  makeVisit('v-007', 'pat-003', '2026-08-14', 'SymptomsImproved', ['None'], 56, 60),
  makeVisit('v-008', 'pat-004', '2026-08-24', 'SymptomsWorsened', ['SevereUncontrolledPain', 'AlteredMentalStatus'], 15, 18),
  makeVisit('v-009', 'pat-005', '2026-08-23', 'Stable', ['None'], 58, 62),
  makeVisit('v-010', 'pat-007', '2026-08-21', 'SymptomsUnchanged', ['None'], 45, 48),
  makeVisit('v-011', 'pat-008', '2026-08-29', 'SymptomsWorsened', ['SevereDehydration'], 12, 14),
  makeVisit('v-012', 'pat-009', '2026-08-26', 'Stable', ['None'], 60, 65),
];

export const mockVisitApi = {
  create: async (patientId: string, data: Record<string, unknown>): Promise<HomeVisit> => {
    await delay(800);
    const newVisit: HomeVisit = {
      ...(data as unknown as HomeVisit),
      id: 'v-new-' + Date.now(),
      patientId,
      createdAt: new Date().toISOString(),
    };
    MOCK_VISITS.push(newVisit);
    return newVisit;
  },

  getByPatient: async (patientId: string, params?: { page?: number; limit?: number }): Promise<VisitListResponse> => {
    await delay(400);
    const filtered = MOCK_VISITS.filter((v) => v.patientId === patientId);
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      page,
      limit,
      total: filtered.length,
    };
  },

  getById: async (patientId: string, visitId: string): Promise<HomeVisit> => {
    await delay(300);
    const visit = MOCK_VISITS.find((v) => v.patientId === patientId && v.id === visitId);
    if (!visit) throw new Error('Visit not found');
    return visit;
  },
};
