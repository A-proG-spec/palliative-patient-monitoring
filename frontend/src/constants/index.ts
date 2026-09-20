// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  RESEND_VERIFICATION: '/resend-verification',

  // Admin
  ADMIN: '/admin',
  ADMIN_PATIENTS: '/admin/patients',
  ADMIN_PATIENT_DETAIL: (id: string) => `/admin/patients/${id}`,
  ADMIN_STAFF: '/admin/staff',
  ADMIN_REFERRALS: '/admin/referrals',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',

  // Staff
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  PATIENT_NEW: '/patients/new',
  PATIENT_DETAIL: (id: string) => `/patients/${id}`,
  PATIENT_SUMMARY: (id: string) => `/patients/${id}/summary`,
  PATIENT_PROGRESS: (id: string) => `/patients/${id}/progress`,

  PATIENT_VISITS: (id: string) => `/patients/${id}/visits`,
  PATIENT_VISIT_DETAIL: (patientId: string, visitId: string) =>
    `/patients/${patientId}/visits/${visitId}`,

  PATIENT_MEDICATIONS: (id: string) => `/patients/${id}/medications`,
  PATIENT_MEDICATION_DETAIL: (patientId: string, medId: string) =>
    `/patients/${patientId}/medications/${medId}`,

  PATIENT_LABS: (id: string) => `/patients/${id}/labs`,
  PATIENT_LAB_DETAIL: (patientId: string, labId: string) =>
    `/patients/${patientId}/labs/${labId}`,

  PATIENT_REFERRALS: (id: string) => `/patients/${id}/referrals`,
  PATIENT_REFERRAL_DETAIL: (patientId: string, refId: string) =>
    `/patients/${patientId}/referrals/${refId}`,

  PATIENT_ADMISSIONS: (id: string) => `/patients/${id}/admissions`,
  PATIENT_ADMISSION_DETAIL: (patientId: string, admId: string) =>
    `/patients/${patientId}/admissions/${admId}`,

  // Role-specific queues
  MEDICATION_ORDERS: '/medication-orders',
  MEDICATION_ORDER_DETAIL: (id: string) => `/medication-orders/${id}`,
  LAB_REQUESTS: '/lab-requests',
  LAB_REQUEST_DETAIL: (id: string) => `/lab-requests/${id}`,
  IMAGING_ORDERS: '/imaging-orders',
  IMAGING_ORDER_DETAIL: (id: string) => `/imaging-orders/${id}`,
} as const;

// TanStack Query keys
export const QUERY_KEYS = {
  AUTH_ME: ['auth', 'me'],
  STAFF_PROFILE: ['staff', 'profile'],
  STAFF_DASHBOARD: ['staff', 'dashboard', 'stats'],
  ADMIN_DASHBOARD: ['admin', 'dashboard', 'stats'],
  ADMIN_NOTIFICATIONS: ['admin', 'dashboard', 'notifications'],
  ADMIN_PATIENTS: ['admin', 'patients'],
  ADMIN_STAFF_PENDING: ['admin', 'staff', 'pending'],
  ADMIN_REFERRALS_PENDING: ['admin', 'referrals', 'pending'],
  ADMIN_REPORTS: ['admin', 'reports'],
  PATIENTS: ['patients'],
  PATIENT: (id: string) => ['patients', id],
  PATIENT_SUMMARY: (id: string) => ['patients', id, 'summary'],
  PATIENT_PROGRESS: (id: string) => ['patients', id, 'progress'],
  PATIENT_VISITS: (id: string) => ['patients', id, 'visits'],
  PATIENT_VISIT: (patientId: string, visitId: string) => [
    'patients',
    patientId,
    'visits',
    visitId,
  ],
  PATIENT_MEDICATIONS: (id: string) => ['patients', id, 'medications'],
  PATIENT_MEDICATION: (patientId: string, medId: string) => [
    'patients',
    patientId,
    'medications',
    medId,
  ],
  PATIENT_LABS: (id: string) => ['patients', id, 'labs'],
  PATIENT_LAB: (patientId: string, labId: string) => [
    'patients',
    patientId,
    'labs',
    labId,
  ],
  PATIENT_REFERRALS: (id: string) => ['patients', id, 'referrals'],
  PATIENT_REFERRAL: (patientId: string, refId: string) => [
    'patients',
    patientId,
    'referrals',
    refId,
  ],
  PATIENT_ADMISSIONS: (id: string) => ['patients', id, 'admissions'],
  PATIENT_ADMISSION: (patientId: string, admId: string) => [
    'patients',
    patientId,
    'admissions',
    admId,
  ],
  MEDICATION_ORDERS: ['medication-orders'],
  LAB_REQUESTS: ['lab-requests'],
  IMAGING_ORDERS: ['imaging-orders'],
} as const;

// Enum display labels
export const DISEASE_STAGE_LABELS: Record<string, string> = {
  Early: 'Early',
  Advanced: 'Advanced',
  EndStage: 'End Stage',
  Terminal: 'Terminal',
};

export const PROGNOSIS_LABELS: Record<string, string> = {
  Days: 'Days',
  Weeks: 'Weeks',
  Months: 'Months',
  Uncertain: 'Uncertain',
};

export const VISIT_TYPE_LABELS: Record<string, string> = {
  Routine: 'Routine Follow-up',
  Emergency: 'Emergency Visit',
  FirstAssessment: 'First Home Assessment',
  PostDischarge: 'Post-Discharge Follow-up',
  EndOfLife: 'End-of-Life Visit',
  Bereavement: 'Bereavement Follow-Up',
};

export const OUTCOME_LABELS: Record<string, string> = {
  Stable: 'Patient Stable',
  SymptomsImproved: 'Symptoms Improved',
  SymptomsUnchanged: 'Symptoms Unchanged',
  SymptomsWorsened: 'Symptoms Worsened',
  ReferredToFacility: 'Referred to Facility',
  Deceased: 'Patient Deceased',
};

// ── FIX: keys must match the backend StaffRole enum (long form) ──
// `LaboratoryTechnician`, not `LabTechnician`.
export const ROLE_LABELS: Record<string, string> = {
  TeamLeader: 'Team Leader',
  Physician: 'Physician',
  Nurse: 'Nurse',
  Pharmacist: 'Pharmacist',
  LaboratoryTechnician: 'Laboratory Technician',
  Radiologist: 'Radiologist',
  admin: 'Administrator',
};

export const REFERRAL_REASON_LABELS: Record<string, string> = {
  PainManagement: 'Pain Management',
  SymptomControl: 'Symptom Control',
  EndOfLifeCare: 'End-of-Life Care',
  HomeHospiceCare: 'Home Hospice Care',
  InpatientAdmission: 'Inpatient Admission',
  PsychologicalSupport: 'Psychological Support',
  SpiritualCare: 'Spiritual Care',
  CaregiverSupport: 'Caregiver Support',
  BereavementServices: 'Bereavement Services',
  EmergencyCare: 'Emergency Care',
  DiagnosticEvaluation: 'Diagnostic Evaluation',
  Other: 'Other',
};

export const SYMPTOM_LABELS: Record<string, string> = {
  Dyspnea: 'Dyspnea (Shortness of Breath)',
  Nausea: 'Nausea/Vomiting',
  Constipation: 'Constipation',
  Anxiety: 'Anxiety',
  Fatigue: 'Fatigue',
  PoorAppetite: 'Poor Appetite',
  PressureSores: 'Pressure Sores',
  Other: 'Other',
  // Admission symptoms
  Depression: 'Depression',
  Insomnia: 'Insomnia',
};

export const PAIN_LOCATION_LABELS: Record<string, string> = {
  Head: 'Head',
  Neck: 'Neck',
  Chest: 'Chest',
  Abdomen: 'Abdomen',
  Back: 'Back',
  Limbs: 'Limbs',
  Generalized: 'Generalized',
  Other: 'Other',
};

export const EDUCATION_LABELS: Record<string, string> = {
  MedicationAdministration: 'Medication Administration',
  PainManagement: 'Pain Management',
  NutritionSupport: 'Nutrition Support',
  SkinCare: 'Skin Care',
  PressureSorePrevention: 'Pressure Sore Prevention',
  EndOfLifeCare: 'End-of-Life Care',
  EmergencySigns: 'Emergency Signs',
  EmotionalSupport: 'Emotional Support',
  Other: 'Other',
};

export const RED_FLAG_LABELS: Record<string, string> = {
  SevereUncontrolledPain: 'Severe Uncontrolled Pain',
  SevereShortnessOfBreath: 'Severe Shortness of Breath',
  MassiveBleeding: 'Massive Bleeding',
  UncontrolledSeizures: 'Uncontrolled Seizures',
  AlteredMentalStatus: 'Altered Mental Status',
  SevereDehydration: 'Severe Dehydration',
  None: 'None',
};