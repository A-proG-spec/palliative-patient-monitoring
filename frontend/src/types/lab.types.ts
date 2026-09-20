// ─────────────────────────────────────────────────────────────
// Enums — mirror backend
// ─────────────────────────────────────────────────────────────
export type LabCategory =
  | 'Hematology'
  | 'Chemistry'
  | 'Hormone'
  | 'Urinalysis'
  | 'Stool'
  | 'Microbiology'
  | 'Histopathology'
  | 'Immunology'
  | 'Cardiac';

export type LabPriority = 'Routine' | 'Urgent' | 'Emergency';
export type LabStatus = 'Ordered' | 'Completed' | 'Cancelled';
export type LabLocation = 'Home' | 'Hospital';
export type LabAbnormalFlag = 'Low' | 'High' | 'Critical' | 'Normal';

// ─────────────────────────────────────────────────────────────
// Main document
// ─────────────────────────────────────────────────────────────
export interface LaboratoryTest {
  id: string;
  patientId: string;

  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    age: number | null;
    sex: string;
    dateOfBirth: string | null;
    patientDisplayId: string | null;
    hospitalPatientId: string | null;
    currentLocation: string | null;
  };

  // Header
  hospitalClinic?: string;
  departmentLaboratory?: string;
  requestNo?: string;
  dateOfRequest?: string;

  // Section 1 — Patient / Requester
  wardClinic?: string;
  physicianRequester?: string;
  contactExtension?: string;

  // Section 2 — Test identification
  category: LabCategory;
  testName: string;
  otherText?: string;
  specimenType?: string;
  specimenSite?: string;

  // Section 3 — Clinical context
  clinicalHistory?: string;

  // Section 4 — Priority
  priority: LabPriority;

  // Section 5 — Collection & submission
  collectionDate?: string;
  collectionTime?: string;
  receivedDate?: string;
  receivedTime?: string;

  // Core
  dateOrdered: string;
  location: LabLocation;
  status: LabStatus;

  // Result (header-level)
  datePerformed?: string;
  result?: string;
  referenceRange?: string;
  abnormalFlag?: LabAbnormalFlag;
  resultNotes?: string;
  performedBy?: string;

  // Structured lab result (1:1 child, present when completed)
  labResult?: LabResult | null;

  // Links
  hospitalAdmissionId?: string | null;

  // Actors
  orderedBy?: { id: string; name: string; role?: string };
  updatedBy?: { id: string; name: string; role?: string };

  // Meta
  createdAt: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Structured result — mirrors backend LabResult model
// All analyte fields are optional; each panel populates its own.
// ─────────────────────────────────────────────────────────────
export interface LabResult {
  id: string;
  labTestOrderId: string;

  // Report info
  reportNumber?: string | null;
  collectedAt?: string | null;
  reportedAt?: string | null;
  verifiedAt?: string | null;

  // Stool
  stoolMacroscopic?: string | null;
  stoolChemical?: string | null;
  stoolMicroscopic?: string | null;
  stoolAdditional?: string | null;

  // Urine
  urineChemical?: string | null;
  urineMicroscopic?: string | null;
  urineAdditional?: string | null;

  // CBC
  hemoglobin?: number | null;
  hematocrit?: number | null;
  rbcCount?: number | null;
  wbcCount?: number | null;
  plateletCount?: number | null;
  mcv?: number | null;
  mch?: number | null;
  mchc?: number | null;
  rdw?: number | null;

  // Differential
  neutrophils?: number | null;
  neutrophilsAbs?: number | null;
  lymphocytes?: number | null;
  lymphocytesAbs?: number | null;
  monocytes?: number | null;
  monocytesAbs?: number | null;
  eosinophils?: number | null;
  eosinophilsAbs?: number | null;
  basophils?: number | null;
  basophilsAbs?: number | null;

  bloodFilm?: string | null;
  additionalBloodTests?: string | null;

  // Chemistry
  glucose?: number | null;
  urea?: number | null;
  creatinine?: number | null;
  uricAcid?: number | null;
  totalProtein?: number | null;
  albumin?: number | null;
  totalBilirubin?: number | null;
  directBilirubin?: number | null;
  alt?: number | null;
  ast?: number | null;
  alp?: number | null;
  totalCholesterol?: number | null;
  triglycerides?: number | null;
  hdlC?: number | null;
  ldlC?: number | null;
  sodium?: number | null;
  potassium?: number | null;
  chloride?: number | null;
  calcium?: number | null;
  phosphate?: number | null;

  // Hormones
  tsh?: number | null;
  freeT4?: number | null;
  freeT3?: number | null;
  fsh?: number | null;
  lh?: number | null;
  prolactin?: number | null;
  estradiol?: number | null;
  progesterone?: number | null;
  testosterone?: number | null;
  cortisol?: number | null;
  insulin?: number | null;
  hcg?: number | null;
  betaHcg?: number | null;
  growthHormone?: number | null;
  acth?: number | null;
  pth?: number | null;

  // General
  interpretation?: string | null;
  comments?: string | null;

  // Meta
  patientId?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Requests
// ─────────────────────────────────────────────────────────────
export interface CreateLabRequest {
  wardClinic?: string;
  physicianRequester: string;
  contactExtension?: string;

  category: LabCategory;
  testName: string;
  otherText?: string;
  specimenType?: string;
  specimenSite?: string;

  clinicalHistory?: string;

  priority?: LabPriority;

  collectionDate?: string;
  collectionTime?: string;

  dateOrdered: string;
  location: LabLocation;

  hospitalClinic?: string;
  departmentLaboratory?: string;

  hospitalAdmissionId?: string;
}

/**
 * Update payload — superset of the backend `updateLabResultSchema`.
 * Includes both the flat header fields AND the structured LabResult
 * analytes, since the backend upserts the LabResult row in the
 * same call.
 */
export interface UpdateLabRequest {
  // Header-level
  datePerformed?: string;
  performedBy?: string;
  abnormalFlag?: LabAbnormalFlag;
  resultNotes?: string;
  receivedDate?: string;
  receivedTime?: string;

  // Legacy freeform
  result?: string;
  referenceRange?: string;

  // Structured analytes
  reportNumber?: string;
  collectedAt?: string;
  reportedAt?: string;
  verifiedAt?: string;

  stoolMacroscopic?: string;
  stoolChemical?: string;
  stoolMicroscopic?: string;
  stoolAdditional?: string;

  urineChemical?: string;
  urineMicroscopic?: string;
  urineAdditional?: string;

  hemoglobin?: number;
  hematocrit?: number;
  rbcCount?: number;
  wbcCount?: number;
  plateletCount?: number;
  mcv?: number;
  mch?: number;
  mchc?: number;
  rdw?: number;

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

  interpretation?: string;
  comments?: string;
}

export interface LabListResponse {
  items: LaboratoryTest[];
  page: number;
  limit: number;
  total: number;
}