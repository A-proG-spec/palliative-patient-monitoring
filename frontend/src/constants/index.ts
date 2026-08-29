// src/constants/index.ts

// ─── Routes ─────────────────────────────────────────────────────────────────

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  RESEND_VERIFICATION: '/resend-verification',

  // Admin
  ADMIN_DASHBOARD: '/admin',
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
  PATIENT_VISITS: (id: string) => `/patients/${id}/visits`,
  PATIENT_MEDICATIONS: (id: string) => `/patients/${id}/medications`,
  PATIENT_LABS: (id: string) => `/patients/${id}/labs`,
  PATIENT_REFERRALS: (id: string) => `/patients/${id}/referrals`,
  PATIENT_ADMISSIONS: (id: string) => `/patients/${id}/admissions`,
} as const;

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  AUTH_ME: ['auth', 'me'],
  STAFF_PROFILE: ['staff', 'profile'],
  STAFF_DASHBOARD_STATS: ['staff', 'dashboard', 'stats'],
  STAFF_ALERTS: ['staff', 'alerts'],

  ADMIN_DASHBOARD_STATS: ['admin', 'dashboard', 'stats'],
  ADMIN_NOTIFICATIONS: ['admin', 'dashboard', 'notifications'],
  ADMIN_STAFF_PENDING: ['admin', 'staff', 'pending'],
  ADMIN_REFERRALS_PENDING: ['admin', 'referrals', 'pending'],
  ADMIN_PATIENTS: ['admin', 'patients'],
  ADMIN_REPORTS: ['admin', 'reports'],

  PATIENTS: ['patients'],
  PATIENT: (id: string) => ['patients', id],
  PATIENT_SUMMARY: (id: string) => ['patients', id, 'summary'],
  PATIENT_VISITS: (id: string) => ['patients', id, 'visits'],
  PATIENT_MEDICATIONS: (id: string) => ['patients', id, 'medications'],
  PATIENT_LABS: (id: string) => ['patients', id, 'labs'],
  PATIENT_REFERRALS: (id: string) => ['patients', id, 'referrals'],
  PATIENT_ADMISSIONS: (id: string) => ['patients', id, 'admissions'],
} as const;

// ─── Enum Display Labels ─────────────────────────────────────────────────────

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

export const PATIENT_STATUS_LABELS: Record<string, string> = {
  Active: 'Active',
  Discharged: 'Discharged',
};

export const PATIENT_LOCATION_LABELS: Record<string, string> = {
  Home: 'Home',
  ReferredHospital: 'Referred Hospital',
};

export const STAFF_ROLE_LABELS: Record<string, string> = {
  TeamLeader: 'Team Leader',
  Physician: 'Physician',
  Nurse: 'Nurse',
};

export const STAFF_STATUS_LABELS: Record<string, string> = {
  Pending: 'Pending',
  Active: 'Active',
  Rejected: 'Rejected',
};

export const REFERRAL_STATUS_LABELS: Record<string, string> = {
  Pending: 'Pending',
  Accepted: 'Accepted',
  Declined: 'Declined',
  Admitted: 'Admitted',
  InfoRequested: 'Info Requested',
};

export const VISIT_TYPE_LABELS: Record<string, string> = {
  Routine: 'Routine',
  Emergency: 'Emergency',
  FirstAssessment: 'First Assessment',
  PostDischarge: 'Post Discharge',
  EndOfLife: 'End of Life',
  Bereavement: 'Bereavement',
};

export const VISIT_OUTCOME_LABELS: Record<string, string> = {
  Stable: 'Stable',
  SymptomsImproved: 'Symptoms Improved',
  SymptomsUnchanged: 'Symptoms Unchanged',
  SymptomsWorsened: 'Symptoms Worsened',
  ReferredToFacility: 'Referred to Facility',
  Deceased: 'Deceased',
};

export const OVERALL_STATUS_LABELS: Record<string, string> = {
  Stable: 'Stable',
  Deteriorating: 'Deteriorating',
  Critical: 'Critical',
  BedBound: 'Bed Bound',
};

export const MOBILITY_LABELS: Record<string, string> = {
  Ambulatory: 'Ambulatory',
  RequiresAssistance: 'Requires Assistance',
  Bedridden: 'Bedridden',
};

export const ADL_STATUS_LABELS: Record<string, string> = {
  Independent: 'Independent',
  NeedsAssistance: 'Needs Assistance',
  FullyDependent: 'Fully Dependent',
};

export const APPETITE_LABELS: Record<string, string> = {
  Good: 'Good',
  Fair: 'Fair',
  Poor: 'Poor',
  UnableToEat: 'Unable to Eat',
};

export const ORAL_INTAKE_LABELS: Record<string, string> = {
  Adequate: 'Adequate',
  Reduced: 'Reduced',
  Minimal: 'Minimal',
};

export const HYDRATION_LABELS: Record<string, string> = {
  Adequate: 'Adequate',
  MildDehydration: 'Mild Dehydration',
  SevereDehydration: 'Severe Dehydration',
};

export const EMOTIONAL_STATUS_LABELS: Record<string, string> = {
  Stable: 'Stable',
  Anxious: 'Anxious',
  Depressed: 'Depressed',
  Fearful: 'Fearful',
  Distressed: 'Distressed',
};

export const FAMILY_SUPPORT_LABELS: Record<string, string> = {
  Excellent: 'Excellent',
  Good: 'Good',
  Limited: 'Limited',
  None: 'None',
};

export const ADHERENCE_LABELS: Record<string, string> = {
  Good: 'Good',
  Partial: 'Partial',
  Poor: 'Poor',
};

export const CAREGIVER_BURDEN_LABELS: Record<string, string> = {
  Low: 'Low',
  Moderate: 'Moderate',
  High: 'High',
};

export const HOME_CONDITION_LABELS: Record<string, string> = {
  Clean: 'Clean',
  Fair: 'Fair',
  Poor: 'Poor',
};

export const MEDICATION_STATUS_LABELS: Record<string, string> = {
  Ordered: 'Ordered',
  Given: 'Given',
};

export const LAB_STATUS_LABELS: Record<string, string> = {
  Ordered: 'Ordered',
  Completed: 'Completed',
};

export const ADMISSION_STATUS_LABELS: Record<string, string> = {
  Active: 'Active',
  Discharged: 'Discharged',
};

export const FUNCTIONAL_STATUS_LABELS: Record<string, string> = {
  FullyIndependent: 'Fully Independent',
  PartiallyDependent: 'Partially Dependent',
  FullyDependent: 'Fully Dependent',
};

export const PAIN_TYPE_LABELS: Record<string, string> = {
  Acute: 'Acute',
  Chronic: 'Chronic',
  Neuropathic: 'Neuropathic',
  Mixed: 'Mixed',
};

// ─── Enum Option Arrays (for select dropdowns) ───────────────────────────────

export const SEX_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

export const DISEASE_STAGE_OPTIONS = [
  { value: 'Early', label: 'Early' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'EndStage', label: 'End Stage' },
];

export const DISEASE_STAGE_ADMISSION_OPTIONS = [
  { value: 'Early', label: 'Early' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Terminal', label: 'Terminal' },
];

export const PROGNOSIS_OPTIONS = [
  { value: 'Days', label: 'Days' },
  { value: 'Weeks', label: 'Weeks' },
  { value: 'Months', label: 'Months' },
  { value: 'Uncertain', label: 'Uncertain' },
];

export const STAFF_ROLE_OPTIONS = [
  { value: 'TeamLeader', label: 'Team Leader' },
  { value: 'Physician', label: 'Physician' },
  { value: 'Nurse', label: 'Nurse' },
];

export const VISIT_TYPE_OPTIONS = [
  { value: 'Routine', label: 'Routine' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'FirstAssessment', label: 'First Assessment' },
  { value: 'PostDischarge', label: 'Post Discharge' },
  { value: 'EndOfLife', label: 'End of Life' },
  { value: 'Bereavement', label: 'Bereavement' },
];

export const OVERALL_STATUS_OPTIONS = [
  { value: 'Stable', label: 'Stable' },
  { value: 'Deteriorating', label: 'Deteriorating' },
  { value: 'Critical', label: 'Critical' },
  { value: 'BedBound', label: 'Bed Bound' },
];

export const MOBILITY_OPTIONS = [
  { value: 'Ambulatory', label: 'Ambulatory' },
  { value: 'RequiresAssistance', label: 'Requires Assistance' },
  { value: 'Bedridden', label: 'Bedridden' },
];

export const ADL_OPTIONS = [
  { value: 'Independent', label: 'Independent' },
  { value: 'NeedsAssistance', label: 'Needs Assistance' },
  { value: 'FullyDependent', label: 'Fully Dependent' },
];

export const APPETITE_OPTIONS = [
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
  { value: 'UnableToEat', label: 'Unable to Eat' },
];

export const ORAL_INTAKE_OPTIONS = [
  { value: 'Adequate', label: 'Adequate' },
  { value: 'Reduced', label: 'Reduced' },
  { value: 'Minimal', label: 'Minimal' },
];

export const HYDRATION_OPTIONS = [
  { value: 'Adequate', label: 'Adequate' },
  { value: 'MildDehydration', label: 'Mild Dehydration' },
  { value: 'SevereDehydration', label: 'Severe Dehydration' },
];

export const EMOTIONAL_STATUS_OPTIONS = [
  { value: 'Stable', label: 'Stable' },
  { value: 'Anxious', label: 'Anxious' },
  { value: 'Depressed', label: 'Depressed' },
  { value: 'Fearful', label: 'Fearful' },
  { value: 'Distressed', label: 'Distressed' },
];

export const FAMILY_SUPPORT_OPTIONS = [
  { value: 'Excellent', label: 'Excellent' },
  { value: 'Good', label: 'Good' },
  { value: 'Limited', label: 'Limited' },
  { value: 'None', label: 'None' },
];

export const ADHERENCE_OPTIONS = [
  { value: 'Good', label: 'Good' },
  { value: 'Partial', label: 'Partial' },
  { value: 'Poor', label: 'Poor' },
];

export const CAREGIVER_BURDEN_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'High', label: 'High' },
];

export const CAREGIVER_UNDERSTANDING_OPTIONS = [
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
];

export const CAREGIVING_CAPACITY_OPTIONS = [
  { value: 'Strong', label: 'Strong' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Weak', label: 'Weak' },
];

export const FAMILY_EMOTIONAL_STATUS_OPTIONS = [
  { value: 'Stable', label: 'Stable' },
  { value: 'Stressed', label: 'Stressed' },
  { value: 'Overwhelmed', label: 'Overwhelmed' },
];

export const HOME_CONDITION_OPTIONS = [
  { value: 'Clean', label: 'Clean' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
];

export const VISIT_OUTCOME_OPTIONS = [
  { value: 'Stable', label: 'Stable' },
  { value: 'SymptomsImproved', label: 'Symptoms Improved' },
  { value: 'SymptomsUnchanged', label: 'Symptoms Unchanged' },
  { value: 'SymptomsWorsened', label: 'Symptoms Worsened' },
  { value: 'ReferredToFacility', label: 'Referred to Facility' },
  { value: 'Deceased', label: 'Deceased' },
];

export const PAIN_LOCATION_OPTIONS = [
  { value: 'Head', label: 'Head' },
  { value: 'Neck', label: 'Neck' },
  { value: 'Chest', label: 'Chest' },
  { value: 'Abdomen', label: 'Abdomen' },
  { value: 'Back', label: 'Back' },
  { value: 'Limbs', label: 'Limbs' },
  { value: 'Generalized', label: 'Generalized' },
  { value: 'Other', label: 'Other' },
];

export const PAIN_CHARACTERISTICS_OPTIONS = [
  { value: 'Sharp', label: 'Sharp' },
  { value: 'Dull', label: 'Dull' },
  { value: 'Burning', label: 'Burning' },
  { value: 'Cramping', label: 'Cramping' },
  { value: 'Intermittent', label: 'Intermittent' },
  { value: 'Continuous', label: 'Continuous' },
];

export const SYMPTOMS_OPTIONS = [
  { value: 'Dyspnea', label: 'Dyspnea' },
  { value: 'Nausea', label: 'Nausea' },
  { value: 'Constipation', label: 'Constipation' },
  { value: 'Anxiety', label: 'Anxiety' },
  { value: 'Fatigue', label: 'Fatigue' },
  { value: 'PoorAppetite', label: 'Poor Appetite' },
  { value: 'PressureSores', label: 'Pressure Sores' },
  { value: 'Other', label: 'Other' },
];

export const HOME_OBSERVATIONS_OPTIONS = [
  { value: 'AdequateLighting', label: 'Adequate Lighting' },
  { value: 'Ventilation', label: 'Ventilation' },
  { value: 'SafeBed', label: 'Safe Bed' },
  { value: 'CleanWater', label: 'Clean Water' },
  { value: 'SanitationIssues', label: 'Sanitation Issues' },
];

export const NURSING_CARE_OPTIONS = [
  { value: 'Hygiene', label: 'Hygiene' },
  { value: 'WoundCare', label: 'Wound Care' },
  { value: 'MedicationAdmin', label: 'Medication Administration' },
  { value: 'PositionChange', label: 'Position Change' },
  { value: 'FeedingAssistance', label: 'Feeding Assistance' },
  { value: 'Counseling', label: 'Counseling' },
  { value: 'Other', label: 'Other' },
];

export const RED_FLAG_OPTIONS = [
  { value: 'SevereUncontrolledPain', label: 'Severe Uncontrolled Pain' },
  { value: 'SevereShortnessOfBreath', label: 'Severe Shortness of Breath' },
  { value: 'MassiveBleeding', label: 'Massive Bleeding' },
  { value: 'UncontrolledSeizures', label: 'Uncontrolled Seizures' },
  { value: 'AlteredMentalStatus', label: 'Altered Mental Status' },
  { value: 'SevereDehydration', label: 'Severe Dehydration' },
  { value: 'None', label: 'None' },
];

export const REFERRALS_MADE_OPTIONS = [
  { value: 'PhysicianReview', label: 'Physician Review' },
  { value: 'HospitalAdmission', label: 'Hospital Admission' },
  { value: 'SocialWorker', label: 'Social Worker' },
  { value: 'Psychologist', label: 'Psychologist' },
  { value: 'SpiritualCare', label: 'Spiritual Care' },
  { value: 'NutritionSupport', label: 'Nutrition Support' },
];

export const EDUCATION_PROVIDED_OPTIONS = [
  { value: 'MedicationAdministration', label: 'Medication Administration' },
  { value: 'PainManagement', label: 'Pain Management' },
  { value: 'NutritionSupport', label: 'Nutrition Support' },
  { value: 'SkinCare', label: 'Skin Care' },
  { value: 'PressureSorePrevention', label: 'Pressure Sore Prevention' },
  { value: 'EndOfLifeCare', label: 'End of Life Care' },
  { value: 'EmergencySigns', label: 'Emergency Signs' },
  { value: 'EmotionalSupport', label: 'Emotional Support' },
  { value: 'Other', label: 'Other' },
];

export const REFERRAL_REASON_OPTIONS = [
  { value: 'PainManagement', label: 'Pain Management' },
  { value: 'SymptomControl', label: 'Symptom Control' },
  { value: 'EndOfLifeCare', label: 'End of Life Care' },
  { value: 'HomeHospiceCare', label: 'Home Hospice Care' },
  { value: 'InpatientAdmission', label: 'Inpatient Admission' },
  { value: 'PsychologicalSupport', label: 'Psychological Support' },
  { value: 'SpiritualCare', label: 'Spiritual Care' },
  { value: 'CaregiverSupport', label: 'Caregiver Support' },
  { value: 'BereavementServices', label: 'Bereavement Services' },
  { value: 'EmergencyCare', label: 'Emergency Care' },
  { value: 'DiagnosticEvaluation', label: 'Diagnostic Evaluation' },
  { value: 'Other', label: 'Other' },
];

export const ADMISSION_SYMPTOMS_OPTIONS = [
  { value: 'Dyspnea', label: 'Dyspnea' },
  { value: 'Nausea', label: 'Nausea' },
  { value: 'Fatigue', label: 'Fatigue' },
  { value: 'Anxiety', label: 'Anxiety' },
  { value: 'Depression', label: 'Depression' },
  { value: 'Insomnia', label: 'Insomnia' },
  { value: 'Other', label: 'Other' },
];

export const ADMISSION_EMOTIONAL_STATUS_OPTIONS = [
  { value: 'Stable', label: 'Stable' },
  { value: 'Anxious', label: 'Anxious' },
  { value: 'Depressed', label: 'Depressed' },
  { value: 'Distressed', label: 'Distressed' },
];

export const ADMISSION_FAMILY_SUPPORT_OPTIONS = [
  { value: 'Strong', label: 'Strong' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Weak', label: 'Weak' },
  { value: 'None', label: 'None' },
];

export const FUNCTIONAL_STATUS_OPTIONS = [
  { value: 'FullyIndependent', label: 'Fully Independent' },
  { value: 'PartiallyDependent', label: 'Partially Dependent' },
  { value: 'FullyDependent', label: 'Fully Dependent' },
];

export const PAIN_TYPE_OPTIONS = [
  { value: 'Acute', label: 'Acute' },
  { value: 'Chronic', label: 'Chronic' },
  { value: 'Neuropathic', label: 'Neuropathic' },
  { value: 'Mixed', label: 'Mixed' },
];

export const SPIRITUAL_SUPPORT_OPTIONS = [
  { value: 'ReligiousLeader', label: 'Religious Leader' },
  { value: 'Counselor', label: 'Counselor' },
  { value: 'Other', label: 'Other' },
];

export const ADMINISTERED_AT_OPTIONS = [
  { value: 'Home', label: 'Home' },
  { value: 'Hospital', label: 'Hospital' },
];

export const LOCATION_OPTIONS = [
  { value: 'Home', label: 'Home' },
  { value: 'Hospital', label: 'Hospital' },
];

export const REFERRAL_TYPE_OPTIONS = [
  { value: 'Incoming', label: 'Incoming' },
  { value: 'Outgoing', label: 'Outgoing' },
];

export const PATIENT_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Discharged', label: 'Discharged' },
];

// ─── Pagination ──────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

// ─── Auto-refresh Intervals ──────────────────────────────────────────────────

export const ADMIN_DASHBOARD_REFRESH_INTERVAL = 30_000; // 30 seconds
export const STAFF_DASHBOARD_REFRESH_INTERVAL = 60_000; // 60 seconds
