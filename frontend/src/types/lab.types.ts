export interface LaboratoryTest {
  id: string;
  patientId: string;
  testName: string;
  orderedBy: string;
  dateOrdered: string;
  datePerformed?: string;
  result?: string;
  location: 'Home' | 'Hospital';
  status: 'Ordered' | 'Completed';
  visitId?: string;
  admissionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLabRequest {
  testName: string;
  dateOrdered: string;
  location: 'Home' | 'Hospital';
}

export interface UpdateLabRequest {
  datePerformed: string;
  result: string;
}

export interface LabListResponse {
  items: LaboratoryTest[];
  page: number;
  limit: number;
  total: number;
}
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