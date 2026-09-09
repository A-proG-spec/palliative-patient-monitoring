export interface Signature {
  id: string;
  visitId: string;
  staffId: string;
  staffName: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  signedAt: string;
  autoSigned: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface SignVisitRequest {
  email: string;
  password: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
}

export interface SignVisitResponse {
  id: string;
  visitId: string;
  staffId: string;
  staffName: string;
  role: string;
  signedAt: string;
  ipAddress?: string;
}

export interface VisitSignaturesResponse {
  visitId: string;
  visitDate: string;
  teamLeader: Signature | null;
  physician: Signature | null;
  nurse: Signature | null;
  allSigned: boolean;
  totalSignatures: number;
}