// src/types/lab.types.ts

export interface LaboratoryTest {
  id: string;
  patientId: string;
  testName: string;
  orderedBy: string | { id: string; name: string };
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
