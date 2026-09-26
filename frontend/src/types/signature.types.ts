// ─────────────────────────────────────────────────────────────
// Shared role union for visit signatures
// ─────────────────────────────────────────────────────────────
export type VisitSignatureRole =
  | 'Physician'
  | 'Nurse'
  | 'Pharmacist'
  | 'Radiologist'
  | 'LaboratoryTechnician'
  | 'Physiologist'
  | 'Psychiatrist'
  | 'Psychologist'
  | 'SocialWorker'
  | 'SpiritualPerson'
  | 'Nutritionist';

// Progress notes additionally allow a "Reviewer" role
export type ProgressNoteSignatureRole = VisitSignatureRole | 'Reviewer';

// ─────────────────────────────────────────────────────────────
// Signature entry — one item in a visit/note `signatures[]`
// ─────────────────────────────────────────────────────────────
export interface Signature {
  staffId: string;
  name: string;
  role: VisitSignatureRole | 'Reviewer';
  isTeamLeader?: boolean;
  signedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Sign a visit
// ─────────────────────────────────────────────────────────────
export interface SignVisitRequest {
  email: string;
  password: string;
  role: VisitSignatureRole;   // ← widened
}

export interface SignVisitResponse {
  id: string;
  signedBy: {
    staffId: string;
    name: string;
    role: VisitSignatureRole;
    signedAt: string;
  };
  signatures: Signature[];
  allSigned: boolean;
}

export interface VisitSignaturesResponse {
  visitId: string;
  visitDate: string;
  teamLeader: {
    staffId: string;
    name: string;
    role: string;
    signedAt?: string;
  } | null;
  signatures: Signature[];
  allSigned: boolean;
  totalSignatures: number;
}

// ─────────────────────────────────────────────────────────────
// Sign a progress note
// ─────────────────────────────────────────────────────────────
export interface SignProgressNoteRequest {
  email: string;
  password: string;
  role: ProgressNoteSignatureRole;   // ← widened (includes Reviewer)
}

export interface ProgressNoteSignaturesResponse {
  noteId: string;
  createdAt: string;
  responsibleClinician: {
    staffId: string;
    name: string;
    role: string;
  } | null;
  signatures: Signature[];
  allSigned: boolean;
  totalSignatures: number;
}