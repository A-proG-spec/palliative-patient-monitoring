import { Request } from 'express';

// ============================================
// SHARED ROLE TYPES
// ============================================
// Kept in sync with Prisma enums in `schema.prisma`.
// If you change an enum there, update it here too.

export type StaffRole =
  | 'Physician'
  | 'Nurse'
  | 'Pharmacist'
  | 'Radiologist'
  | 'LaboratoryTechnician';

export type VisitTeamRole = 'Physician' | 'Nurse';

export type StaffStatus = 'Pending' | 'Active' | 'Rejected';

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: StaffRole | null;
  type: 'staff' | 'admin';
  status?: StaffStatus;
  isEmailVerified?: boolean;
  createdAt?: Date;
}

export interface AuthenticatedRequest extends Request {
  user: User;
  token: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface VerifyEmailResponse {
  email: string;
  isEmailVerified: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

// ============================================
// STAFF TYPES
// ============================================

export interface PendingStaff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: null;
  status: 'Pending';
  createdAt: Date;
}

export interface ApproveStaffRequest {
  role: StaffRole;
}

export interface ApprovedStaffResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: 'Active';
  assignedBy: {
    id: number;
    name: string;
  };
  updatedAt: Date;
}

export interface StaffProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  isEmailVerified: boolean;
  assignedPatientsCount: number;
  todayVisitsCount: number;
  createdAt: Date;
}

// ============================================
// PATIENT TYPES
// ============================================

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  dateOfBirth: Date;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverRelation?: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  status: 'Active' | 'Discharged';
  currentLocation: 'Home' | 'ReferredHospital';
  registeredBy: number;
  createdAt: Date;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverRelation?: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  comorbidities?: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
}

export interface CloseCaseRequest {
  reason: 'Improved' | 'Deceased';
}

export interface CloseCaseResponse {
  id: number;
  status: 'Discharged';
  closeReason: 'Improved' | 'Deceased';
  closeDate: Date;
}

// ============================================
// VISIT TYPES
// ============================================

export type ActivityOfDailyLivingStatus =
  | 'Independent'
  | 'NeedsAssistance'
  | 'FullyDependent';

export interface CreateVisitRequest {
  visitDate: string;
  timeStarted: string;
  timeEnded: string;
  visitType:
    | 'Routine'
    | 'Emergency'
    | 'FirstAssessment'
    | 'PostDischarge'
    | 'EndOfLife'
    | 'Bereavement';
  teamMembers: Array<{
    role: VisitTeamRole;
    name: string;
    staffId?: number;
    isTeamLeader?: boolean;
  }>;
  overallStatus: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  mobility: 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
  vitals?: {
    temperature: string;
    pulse: string;
    bloodPressure: string;
    respiration: string;
    spO2: string;
  };
  painScore: number;
  painLocation?: string[];
  painLocationOther?: string;
  painCharacteristics?: string[];
  currentPainMedication?: boolean;
  painMedicationEffective: boolean;
  painManagementIneffectiveReason?: string;
  symptoms?: string[];
  symptomsOther?: string;
  adl: {
    feeding: ActivityOfDailyLivingStatus;
    bathing: ActivityOfDailyLivingStatus;
    dressing: ActivityOfDailyLivingStatus;
    toileting: ActivityOfDailyLivingStatus;
    mobility: ActivityOfDailyLivingStatus;
  };
  ppsScore: number;
  kpsScore: number;
  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  nutritionComments?: string;
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  emotionalComments?: string;
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  financialComments?: string;
  spiritualNeeds: boolean;
  spiritualNeedsDescription?: string;
  religiousSupportRequested: boolean;
  religiousSupportSpecify?: string;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable?: boolean;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
  }>;
  medicationIssues?: string;
  primaryCaregiver?: string;
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';
  educationProvided?: string[];
  educationProvidedOther?: string;
  trainingNeeds?: string[];
  additionalSupportNeeded?: boolean;
  additionalSupportSpecify?: string;
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations?: string[];
  homeEnvironmentDetails?: string;
  nursingCareGiven?: string[];
  nursingCareOther?: string;
  redFlags?: string[];
  redFlagActions?: string;
  referralsMade?: string[];
  keyIssues?: string;
  immediateActions?: string;
  followUpPlan?: string;
  outcome:
    | 'Stable'
    | 'SymptomsImproved'
    | 'SymptomsUnchanged'
    | 'SymptomsWorsened'
    | 'ReferredToFacility'
    | 'Deceased';
  dateOfDeath?: string;
  nextVisitDate?: string;
  createdBy: number;
}

// ============================================
// MEDICATION TYPES
// ============================================

export interface CreateMedicationRequest {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  administeredAt: 'Home' | 'Hospital';
}

export interface UpdateMedicationRequest {
  status: 'Ordered' | 'Given';
}

// ============================================
// LAB TYPES
// ============================================

export interface CreateLabRequest {
  testName: string;
  dateOrdered: string;
  location: 'Home' | 'Hospital';
}

// Matches the `LabResult` Prisma model — one row per lab test,
// all analyte values inline. Only send fields relevant to the
// panel being reported.
export interface LabResultData {
  // ── Report info ──
  reportNumber?: string;
  collectedAt?: string;
  reportedAt?: string;
  verifiedAt?: string;

  // ── Stool ──
  stoolMacroscopic?: string;
  stoolChemical?: string;
  stoolMicroscopic?: string;
  stoolAdditional?: string;

  // ── Urine ──
  urineChemical?: string;
  urineMicroscopic?: string;
  urineAdditional?: string;

  // ── CBC ──
  hemoglobin?: number;
  hematocrit?: number;
  rbcCount?: number;
  wbcCount?: number;
  plateletCount?: number;
  mcv?: number;
  mch?: number;
  mchc?: number;
  rdw?: number;

  // ── Differential leukocyte count ──
  neutrophils?: number;
  neutrophilsAbs?: number;
  lymphocytes?: number;
  lymphocytesAbs?: number;
  monocytes?: number;
  monocytesAbs?: number;
  eosinophils?: number;
  eosinophilsAbs?: number;
  basophils?: number;
  basophilsAbs?: number;

  bloodFilm?: string;
  additionalBloodTests?: string;

  // ── Chemistry ──
  glucose?: number;
  urea?: number;
  creatinine?: number;
  uricAcid?: number;
  totalProtein?: number;
  albumin?: number;
  totalBilirubin?: number;
  directBilirubin?: number;
  alt?: number;
  ast?: number;
  alp?: number;
  totalCholesterol?: number;
  triglycerides?: number;
  hdlC?: number;
  ldlC?: number;
  sodium?: number;
  potassium?: number;
  chloride?: number;
  calcium?: number;
  phosphate?: number;

  // ── Hormones ──
  tsh?: number;
  freeT4?: number;
  freeT3?: number;
  fsh?: number;
  lh?: number;
  prolactin?: number;
  estradiol?: number;
  progesterone?: number;
  testosterone?: number;
  cortisol?: number;
  insulin?: number;
  hcg?: number;
  betaHcg?: number;
  growthHormone?: number;
  acth?: number;
  pth?: number;

  // ── General ──
  interpretation?: string;
  comments?: string;
}

export interface UpdateLabRequest extends Partial<LabResultData> {
  datePerformed?: string;
  performedBy?: string;
  abnormalFlag?: 'Low' | 'High' | 'Critical' | 'Normal';
  status?: 'Ordered' | 'Completed' | 'Cancelled';
}

// ============================================
// REFERRAL TYPES
// ============================================

export interface CreateReferralRequest {
  referralType: 'Incoming' | 'Outgoing';
  referralDate: string;
  primaryDiagnosis: string;
  diseaseStage: 'Early' | 'Advanced' | 'EndStage';
  ppsScore: number;
  kpsScore: number;
  currentSymptoms: {
    pain: number;
    dyspnea: number;
    fatigue: number;
    anxiety: number;
    depression: number;
  };
  reasons: string[];
  otherReason?: string;
  referringFacility: string;
  receivingFacility: string;
  contactPerson: string;
  contactNumber: string;
  preparedBy: string;
  preparedByDesignation: string;
  signature: string;
}

// ============================================
// ADMISSION TYPES
// ============================================

export interface CreateAdmissionRequest {
  referralId: string;
  admissionDate: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diseaseStage: 'Early' | 'Advanced' | 'Terminal';
  comorbidities?: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore: number;
  kpsScore?: number;
  functionalStatus: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  painScore: number;
  painType: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent?: string[];
  symptomsPresentOther?: string;
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualNeedsDescription?: string;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  spiritualSupportPreferredOther?: string;
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
  admittedToHospiceUnit?: boolean;
}

export interface UpdateAdmissionRequest {
  dischargeDate?: string;
  dischargeReason?: 'Improved' | 'Deceased';
  status: 'Active' | 'Discharged';
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: number;
  type: 'StaffApproval' | 'ReferralApproval' | 'CloseCase';
  message: string;
  data: {
    staffId?: number;
    referralId?: number;
    patientId?: number;
    patientName?: string;
    staffName?: string;
  };
  read: boolean;
  createdAt: Date;
}

// ============================================
// STAFF DASHBOARD TYPES
// ============================================

export interface StaffDashboardStats {
  todayVisits: number;
  totalPatients: number;
  activePatients: number;
  pendingTasks: number;
  recentVisits: Array<{
    id: number;
    patientId: number;
    patientName: string;
    visitDate: Date;
    outcome: string;
  }>;
  visitedPatients: Array<{
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    sex: 'Male' | 'Female';
    status: 'Active' | 'Discharged';
    currentLocation: 'Home' | 'ReferredHospital';
    primaryDiagnosis: string;
    lastVisitDate?: Date;
  }>;
  upcomingVisits: Array<{
    id: number;
    patientId: number;
    patientName: string;
    scheduledDate: Date;
    visitType: string;
  }>;
  alerts: Array<{
    id: number;
    type: 'RedFlag' | 'ReferralPending' | 'MedicationDue' | 'VisitOverdue';
    message: string;
    patientId: number;
    patientName: string;
    createdAt: Date;
  }>;
}

// ============================================
// ADMIN TYPES
// ============================================

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  hospitalizedPatients: number;
  dischargedPatients: number;
  pendingReferrals: number;
  pendingStaff: number;
  notifications: {
    staffApprovals: number;
    pendingReferrals: number;
    recentCloseCases: number;
  };
  patientsByStatus: Array<{ status: string; count: number }>;
  recentReferrals: Array<{
    id: number;
    patientName: string;
    date: Date;
    status: string;
  }>;
  recentVisits: Array<{
    patientName: string;
    date: Date;
    staff: string;
  }>;
}

// ============================================
// PATIENT PROGRESS TYPES
// ============================================

export interface ProgressDataPoint {
  visitId: number;
  visitDate: Date;
  kpsScore: number;
  ppsScore: number;
}

export interface PatientProgressData {
  patientId: number;
  patientName: string;
  visits: ProgressDataPoint[];
  trends: {
    kps: {
      trend: 'improving' | 'stable' | 'declining';
      percentageChange: number;
      firstScore: number;
      lastScore: number;
    };
    pps: {
      trend: 'improving' | 'stable' | 'declining';
      percentageChange: number;
      firstScore: number;
      lastScore: number;
    };
  };
}

// ============================================
// HOSPICE NURSING TYPES
// ============================================

export interface CreateHospiceNursingAssessmentRequest {
  patientId: number;

  // General observation
  levelOfConsciousness?:
    | 'Alert'
    | 'Drowsy'
    | 'Confused'
    | 'Unresponsive'
    | 'Comatose';
  orientation?: string[];
  generalAppearance?: string[];

  // Vitals
  bloodPressure?: string;
  pulseRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;

  // Pain
  painPresent?: boolean;
  painScore?: number;
  painLocation?: string[];
  painLocationOther?: string;
  painCharacteristics?: string[];
  painReliefMeasures?: string[];
  painReliefOther?: string;

  // Respiratory
  breathingPattern?: 'Normal' | 'Labored' | 'Shallow' | 'Rapid' | 'Slow';
  dyspneaSeverity?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  oxygenTherapy?: boolean;
  oxygenFlowRate?: string;
  cough?: 'None' | 'Dry' | 'Productive';
  sputumColor?: 'None' | 'Clear' | 'Yellow' | 'Green' | 'Bloody';
  respiratoryNotes?: string;

  // Cardiovascular
  pulseRhythm?: 'Regular' | 'Irregular';
  peripheralEdema?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  edemaLocation?: string;
  skinColor?: 'Normal' | 'Pale' | 'Cyanotic' | 'Jaundiced';

  // Gastrointestinal
  appetite?: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  nausea?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  vomiting?: boolean;
  vomitingFrequency?: string;
  bowelFunction?: 'Normal' | 'Constipation' | 'Diarrhea' | 'Incontinence';
  lastBowelMovement?: string;

  // Genitourinary
  urinaryFunction?: 'Normal' | 'Frequency' | 'Retention' | 'Incontinence' | 'Catheterized';
  urineAppearance?: 'Clear' | 'Cloudy' | 'Bloody' | 'Dark';

  // Skin
  skinIntegrity?: 'Intact' | 'Dry' | 'Fragile' | 'WoundPresent' | 'PressureUlcer';
  pressureInjuryRisk?: 'Low' | 'Moderate' | 'High';
  pressureUlcerPresent?: boolean;
  pressureUlcerLocation?: string;
  pressureUlcerStage?: 'I' | 'II' | 'III' | 'IV';

  // Mobility
  mobilityStatus?: 'Independent' | 'RequiresAssistance' | 'WheelchairDependent' | 'Bedridden';
  fallRisk?: 'Low' | 'Moderate' | 'High';
  assistiveDevices?: string[];
  assistiveDevicesOther?: string;

  // ADL
  feeding?: 'Independent' | 'NeedAssistance' | 'Dependent';
  bathing?: 'Independent' | 'NeedAssistance' | 'Dependent';
  dressing?: 'Independent' | 'NeedAssistance' | 'Dependent';
  toileting?: 'Independent' | 'NeedAssistance' | 'Dependent';
  mobility?: 'Independent' | 'NeedAssistance' | 'Dependent';

  // Psychological
  emotionalStatus?: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Agitated' | 'Grieving';
  communicationAbility?: 'Normal' | 'Impaired' | 'NonVerbal';
  cognitiveStatus?: 'Intact' | 'MildImpairment' | 'SevereImpairment';

  // Family / caregiver
  primaryCaregiverName?: string;
  primaryCaregiverRelationship?: string;
  primaryCaregiverPhone?: string;
  familySupport?: 'Strong' | 'Moderate' | 'Limited' | 'None';
  caregiverStressLevel?: 'Low' | 'Moderate' | 'High';

  // Spiritual / cultural
  spiritualSupportRequested?: boolean;
  religiousAffiliation?: 'Orthodox' | 'Muslim' | 'Protestant' | 'Catholic' | 'Other';
  religiousAffiliationOther?: string;
  culturalConsiderations?: string;

  // Nursing diagnoses
  nursingDiagnoses?: string[];
  nursingDiagnosesOther?: string;

  // Summary
  nurseSummary?: string;

  // Meta
  assessedByStaffId?: number;
  createdBy: number;
  hospitalAdmissionId?: number;
}