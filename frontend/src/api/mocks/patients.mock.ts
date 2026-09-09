import type { Patient, PatientListResponse, PatientSummaryResponse, PatientProgressData } from '@/types/patient.types';
import { delay } from '@/lib/utils';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'pat-001', patientDisplayId: 'PAT-001',
    firstName: 'Sarah', lastName: 'Johnson',
    age: 65, sex: 'Female', dateOfBirth: '1961-03-15',
    address: 'Bole Sub-city, Kebele 05', phone: '+251911001001',
    emergencyContactName: 'Michael Johnson', emergencyContactPhone: '+251911002002',
    caregiverName: 'Emily Johnson', caregiverPhone: '+251911003003',
    primaryDiagnosis: 'Stage IV Breast Cancer', secondaryDiagnoses: ['Metastatic to bone', 'Anaemia'],
    diseaseStage: 'Advanced', comorbidities: ['Hypertension', 'Diabetes'],
    estimatedPrognosis: 'Months', status: 'Active', currentLocation: 'ReferredHospital',
    registeredBy: 'staff-001', createdAt: '2026-07-10T08:00:00Z',
  },
  {
    id: 'pat-002', patientDisplayId: 'PAT-002',
    firstName: 'Michael', lastName: 'Brown',
    age: 72, sex: 'Male', dateOfBirth: '1954-06-20',
    address: 'Yeka Sub-city, Kebele 12', phone: '+251922001001',
    emergencyContactName: 'Linda Brown', emergencyContactPhone: '+251922002002',
    caregiverName: 'Robert Brown', caregiverPhone: '+251922003003',
    primaryDiagnosis: 'Lung Cancer', secondaryDiagnoses: ['COPD'],
    diseaseStage: 'EndStage', comorbidities: ['COPD'],
    estimatedPrognosis: 'Weeks', status: 'Active', currentLocation: 'ReferredHospital',
    registeredBy: 'staff-001', createdAt: '2026-06-25T08:00:00Z',
  },
  {
    id: 'pat-003', patientDisplayId: 'PAT-003',
    firstName: 'Almaz', lastName: 'Tesfaye',
    age: 58, sex: 'Female', dateOfBirth: '1968-11-08',
    address: 'Kirkos Sub-city, Kebele 08', phone: '+251933001001',
    emergencyContactName: 'Tadesse Tesfaye', emergencyContactPhone: '+251933002002',
    caregiverName: 'Hiwot Tesfaye', caregiverPhone: '+251933003003',
    primaryDiagnosis: 'Cervical Cancer', secondaryDiagnoses: [],
    diseaseStage: 'Advanced', comorbidities: ['Anaemia'],
    estimatedPrognosis: 'Months', status: 'Active', currentLocation: 'Home',
    registeredBy: 'staff-002', createdAt: '2026-07-01T08:00:00Z',
  },
  {
    id: 'pat-004', patientDisplayId: 'PAT-004',
    firstName: 'Bekele', lastName: 'Haile',
    age: 80, sex: 'Male', dateOfBirth: '1946-02-14',
    address: 'Arada Sub-city, Kebele 03', phone: '+251944001001',
    emergencyContactName: 'Abebe Haile', emergencyContactPhone: '+251944002002',
    caregiverName: 'Tigist Haile', caregiverPhone: '+251944003003',
    primaryDiagnosis: 'Colorectal Cancer', secondaryDiagnoses: ['Liver metastasis'],
    diseaseStage: 'EndStage', comorbidities: ['Heart failure', 'Diabetes'],
    estimatedPrognosis: 'Days', status: 'Active', currentLocation: 'Home',
    registeredBy: 'staff-001', createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'pat-005', patientDisplayId: 'PAT-005',
    firstName: 'Mekdes', lastName: 'Girma',
    age: 45, sex: 'Female', dateOfBirth: '1981-09-22',
    address: 'Nifas Silk Sub-city, Kebele 01', phone: '+251955001001',
    emergencyContactName: 'Girma Kebede', emergencyContactPhone: '+251955002002',
    caregiverName: 'Selamawit Girma', caregiverPhone: '+251955003003',
    primaryDiagnosis: 'Ovarian Cancer', secondaryDiagnoses: ['Ascites'],
    diseaseStage: 'Advanced', comorbidities: [],
    estimatedPrognosis: 'Months', status: 'Active', currentLocation: 'Home',
    registeredBy: 'staff-003', createdAt: '2026-07-20T08:00:00Z',
  },
  {
    id: 'pat-006', patientDisplayId: 'PAT-006',
    firstName: 'Dawit', lastName: 'Kebede',
    age: 67, sex: 'Male', dateOfBirth: '1959-05-10',
    address: 'Lideta Sub-city, Kebele 07', phone: '+251966001001',
    emergencyContactName: 'Yeshi Kebede', emergencyContactPhone: '+251966002002',
    caregiverName: 'Birhan Kebede', caregiverPhone: '+251966003003',
    primaryDiagnosis: 'Prostate Cancer', secondaryDiagnoses: ['Bone metastasis'],
    diseaseStage: 'EndStage', comorbidities: ['Hypertension'],
    estimatedPrognosis: 'Weeks', status: 'Discharged', currentLocation: 'Home',
    registeredBy: 'staff-002', createdAt: '2026-05-15T08:00:00Z',
  },
  {
    id: 'pat-007', patientDisplayId: 'PAT-007',
    firstName: 'Hana', lastName: 'Worku',
    age: 52, sex: 'Female', dateOfBirth: '1974-07-30',
    address: 'Gullele Sub-city, Kebele 09', phone: '+251977001001',
    emergencyContactName: 'Solomon Worku', emergencyContactPhone: '+251977002002',
    caregiverName: 'Meron Worku', caregiverPhone: '+251977003003',
    primaryDiagnosis: 'Gastric Cancer', secondaryDiagnoses: ['Peritoneal carcinomatosis'],
    diseaseStage: 'Advanced', comorbidities: ['Malnutrition'],
    estimatedPrognosis: 'Months', status: 'Active', currentLocation: 'Home',
    registeredBy: 'staff-001', createdAt: '2026-08-05T08:00:00Z',
  },
  {
    id: 'pat-008', patientDisplayId: 'PAT-008',
    firstName: 'Tesfaye', lastName: 'Mulugeta',
    age: 75, sex: 'Male', dateOfBirth: '1951-12-05',
    address: 'Akaki Sub-city, Kebele 04', phone: '+251988001001',
    emergencyContactName: 'Azeb Mulugeta', emergencyContactPhone: '+251988002002',
    caregiverName: 'Yonas Mulugeta', caregiverPhone: '+251988003003',
    primaryDiagnosis: 'Hepatocellular Carcinoma', secondaryDiagnoses: [],
    diseaseStage: 'EndStage', comorbidities: ['Cirrhosis', 'Ascites'],
    estimatedPrognosis: 'Days', status: 'Active', currentLocation: 'Home',
    registeredBy: 'staff-003', createdAt: '2026-08-15T08:00:00Z',
  },
  {
    id: 'pat-009', patientDisplayId: 'PAT-009',
    firstName: 'Liya', lastName: 'Solomon',
    age: 40, sex: 'Female', dateOfBirth: '1986-04-18',
    address: 'Bole Sub-city, Kebele 10', phone: '+251999001001',
    emergencyContactName: 'Daniel Solomon', emergencyContactPhone: '+251999002002',
    caregiverName: 'Ruth Solomon', caregiverPhone: '+251999003003',
    primaryDiagnosis: 'Brain Tumor (Glioblastoma)', secondaryDiagnoses: [],
    diseaseStage: 'Advanced', comorbidities: ['Epilepsy'],
    estimatedPrognosis: 'Months', status: 'Active', currentLocation: 'Home',
    registeredBy: 'staff-001', createdAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'pat-010', patientDisplayId: 'PAT-010',
    firstName: 'Girma', lastName: 'Desta',
    age: 63, sex: 'Male', dateOfBirth: '1963-08-25',
    address: 'Kolfe Sub-city, Kebele 06', phone: '+251911101001',
    emergencyContactName: 'Senait Desta', emergencyContactPhone: '+251911102002',
    caregiverName: 'Kidist Desta', caregiverPhone: '+251911103003',
    primaryDiagnosis: 'Oesophageal Cancer', secondaryDiagnoses: ['Dysphagia'],
    diseaseStage: 'EndStage', comorbidities: ['Severe malnutrition'],
    estimatedPrognosis: 'Weeks', status: 'Active', currentLocation: 'Home',
    registeredBy: 'staff-002', createdAt: '2026-08-12T08:00:00Z',
  },
  {
    id: 'pat-011', patientDisplayId: 'PAT-011',
    firstName: 'Meseret', lastName: 'Abebe',
    age: 55, sex: 'Female', dateOfBirth: '1971-01-14',
    address: 'Addis Ketema Sub-city, Kebele 02', phone: '+251922101001',
    emergencyContactName: 'Abebe Tadesse', emergencyContactPhone: '+251922102002',
    caregiverName: 'Netsanet Abebe', caregiverPhone: '+251922103003',
    primaryDiagnosis: 'Thyroid Cancer', secondaryDiagnoses: [],
    diseaseStage: 'Early', comorbidities: [],
    estimatedPrognosis: 'Uncertain', status: 'Active', currentLocation: 'Home',
    registeredBy: 'staff-001', createdAt: '2026-08-20T08:00:00Z',
  },
  {
    id: 'pat-012', patientDisplayId: 'PAT-012',
    firstName: 'Yohannes', lastName: 'Getachew',
    age: 70, sex: 'Male', dateOfBirth: '1956-10-02',
    address: 'Kirkos Sub-city, Kebele 15', phone: '+251933101001',
    emergencyContactName: 'Meron Getachew', emergencyContactPhone: '+251933102002',
    caregiverName: 'Tsega Getachew', caregiverPhone: '+251933103003',
    primaryDiagnosis: 'Bladder Cancer', secondaryDiagnoses: ['Haematuria'],
    diseaseStage: 'Advanced', comorbidities: ['Hypertension', 'Chronic kidney disease'],
    estimatedPrognosis: 'Months', status: 'Discharged', currentLocation: 'Home',
    registeredBy: 'staff-003', createdAt: '2026-06-01T08:00:00Z',
  },
];

export const mockPatientApi = {
  register: async (data: Record<string, unknown>): Promise<Patient> => {
    await delay(700);
    const newPatient: Patient = {
      id: 'pat-new-' + Date.now(),
      patientDisplayId: `PAT-${String(MOCK_PATIENTS.length + 1).padStart(3, '0')}`,
      firstName: data.firstName as string,
      lastName: data.lastName as string,
      age: data.age as number,
      sex: data.sex as 'Male' | 'Female',
      dateOfBirth: data.dateOfBirth as string,
      address: data.address as string,
      phone: data.phone as string,
      emergencyContactName: data.emergencyContactName as string,
      emergencyContactPhone: data.emergencyContactPhone as string,
      caregiverName: data.caregiverName as string,
      caregiverPhone: data.caregiverPhone as string,
      primaryDiagnosis: data.primaryDiagnosis as string,
      secondaryDiagnoses: (data.secondaryDiagnoses as string[]) || [],
      diseaseStage: data.diseaseStage as 'Early' | 'Advanced' | 'EndStage',
      comorbidities: (data.comorbidities as string[]) || [],
      estimatedPrognosis: data.estimatedPrognosis as 'Days' | 'Weeks' | 'Months' | 'Uncertain',
      status: 'Active',
      currentLocation: 'Home',
      registeredBy: 'staff-001',
      createdAt: new Date().toISOString(),
    };
    MOCK_PATIENTS.push(newPatient);
    return newPatient;
  },

  getList: async (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<PatientListResponse> => {
    await delay(400);
    let filtered = [...MOCK_PATIENTS];
    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.primaryDiagnosis.toLowerCase().includes(q) ||
          p.patientDisplayId?.toLowerCase().includes(q)
      );
    }
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const start = (page - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      page,
      limit,
      total: filtered.length,
    };
  },

  getById: async (id: string): Promise<Patient> => {
    await delay(300);
    const patient = MOCK_PATIENTS.find((p) => p.id === id);
    if (!patient) throw new Error('Patient not found');
    return patient;
  },

  getSummary: async (id: string): Promise<PatientSummaryResponse> => {
    await delay(500);
    const patient = MOCK_PATIENTS.find((p) => p.id === id);
    if (!patient) throw new Error('Patient not found');
    return {
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        age: patient.age,
        sex: patient.sex,
        status: patient.status,
        currentLocation: patient.currentLocation,
        patientDisplayId: patient.patientDisplayId,
      },
      diagnosis: {
        primary: patient.primaryDiagnosis,
        secondary: patient.secondaryDiagnoses,
        stage: patient.diseaseStage,
      },
      visits: [
        { id: `v-${id}-1`, date: '2026-08-25T08:00:00Z', outcome: 'Stable', staff: { id: 'staff-001', name: 'John Doe' } },
        { id: `v-${id}-2`, date: '2026-08-18T08:00:00Z', outcome: 'SymptomsImproved', staff: { id: 'staff-002', name: 'Dr. Tigist Alemu' } },
      ],
      medications: [
        { id: `med-${id}-1`, name: 'Morphine', dosage: '10mg', status: 'Ordered', administeredAt: 'Home' },
        { id: `med-${id}-2`, name: 'Paracetamol', dosage: '500mg', status: 'Given', administeredAt: 'Home' },
      ],
      labTests: [
        { id: `lab-${id}-1`, name: 'Complete Blood Count', dateOrdered: '2026-08-20T00:00:00Z', result: 'Hb: 9.5 g/dL' },
      ],
      referrals: id === 'pat-002' ? [{ id: `ref-${id}-1`, date: '2026-08-22T00:00:00Z', status: 'Accepted' }] : [],
      admissions: id === 'pat-002' ? [{ id: `adm-${id}-1`, date: '2026-08-24T00:00:00Z', status: 'Active' }] : [],
    };
  },

  getProgress: async (id: string): Promise<PatientProgressData> => {
    await delay(400);
    const patient = MOCK_PATIENTS.find((p) => p.id === id);
    const visits = [
      { visitId: `v-${id}-6`, visitDate: '2026-07-01', kpsScore: 60, ppsScore: 65 },
      { visitId: `v-${id}-5`, visitDate: '2026-07-15', kpsScore: 55, ppsScore: 60 },
      { visitId: `v-${id}-4`, visitDate: '2026-07-29', kpsScore: 52, ppsScore: 55 },
      { visitId: `v-${id}-3`, visitDate: '2026-08-08', kpsScore: 48, ppsScore: 50 },
      { visitId: `v-${id}-2`, visitDate: '2026-08-18', kpsScore: 44, ppsScore: 46 },
      { visitId: `v-${id}-1`, visitDate: '2026-08-25', kpsScore: 40, ppsScore: 42 },
    ];
    return {
      patientId: id,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      visits,
      trends: {
        kps: { trend: 'declining', percentageChange: -33, firstScore: 60, lastScore: 40 },
        pps: { trend: 'declining', percentageChange: -35, firstScore: 65, lastScore: 42 },
      },
    };
  },
};
