// ─────────────────────────────────────────────────────────────
// Enum-like unions — mirror the backend model / schemas
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
// Main document — matches backend `toLabDto` response shape
// ─────────────────────────────────────────────────────────────

export interface LaboratoryTest {
  id: string;
  patientId: string;

  /** Populated patient snapshot (present when backend uses .populate) */
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

  // Header (Section 0)
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

  // Result
  datePerformed?: string;
  result?: string;
  referenceRange?: string;
  abnormalFlag?: LabAbnormalFlag;
  resultNotes?: string;
  performedBy?: string;

  // Links
  admissionId?: string | null;

  // Actors
  orderedBy?: { id: string; name: string; role?: string };
  updatedBy?: { id: string; name: string; role?: string };

  // Meta
  createdAt: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Request payloads
// ─────────────────────────────────────────────────────────────

export interface CreateLabRequest {
  // Section 1
  wardClinic?: string;
  physicianRequester: string;
  contactExtension?: string;

  // Section 2
  category: LabCategory;
  testName: string;
  otherText?: string;
  specimenType?: string;
  specimenSite?: string;

  // Section 3
  clinicalHistory?: string;

  // Section 4
  priority?: LabPriority;

  // Section 5
  collectionDate?: string;
  collectionTime?: string;

  // Core
  dateOrdered: string;
  location: LabLocation;

  // Header overrides
  hospitalClinic?: string;
  departmentLaboratory?: string;

  // Encounter links
  admissionId?: string;
}

export interface UpdateLabRequest {
  datePerformed: string;
  result: string;
  referenceRange?: string;
  abnormalFlag?: LabAbnormalFlag;
  resultNotes?: string;
  performedBy?: string;
  receivedDate?: string;
  receivedTime?: string;
}

// ─────────────────────────────────────────────────────────────
// List / pagination envelope
// ─────────────────────────────────────────────────────────────

export interface LabListResponse {
  items: LaboratoryTest[];
  page: number;
  limit: number;
  total: number;
}

// ─────────────────────────────────────────────────────────────
// Imaging sub-types — kept here for backwards compat with any
// importers that historically pulled them from lab.types
// (see `api/imaging.ts` for the canonical versions)
// ─────────────────────────────────────────────────────────────

export interface ImagingOrderData {
  modality: string;
  bodyRegion: string;
  specificSite?: string;
  laterality: string;
  protocol?: string;
  clinicalQuestion?: string;
  contrast: string;
  priority: string;
  reasonForUrgency?: string;
  pregnancyStatus: string;
  implantedDevice: boolean;
  deviceDetails?: string;
  metallicForeignBody: string;
  allergies?: string;
  renalFunction?: string;
  creatinine?: string;
  egfr?: string;
  preparation: string[];
  preparationInstructions?: string;
  clinicianName?: string;
  clinicianDepartment?: string;
  clinicianContact?: string;
}

export interface ImagingReportData {
  reportDate: string;
  findings: string;
  impression: string;
  recommendations?: string;
  reportingPhysician: string;
  imageQuality: 'Diagnostic' | 'Limited' | 'NonDiagnostic' | 'RepeatRequired';
  notes?: string;
}