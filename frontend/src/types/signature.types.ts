// ─────────────────────────────────────────────────────────────
// Signature entry — one item in a visit/note `signatures[]`
// ─────────────────────────────────────────────────────────────
export interface Signature {
  staffId: string;
  name: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse' | 'Reviewer';
  isTeamLeader?: boolean;
  signedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Sign a visit — matches backend `signVisitSchema.body`
// ─────────────────────────────────────────────────────────────
export interface SignVisitRequest {
  email: string;
  password: string;
  role: 'Physician' | 'Nurse';
}

export interface SignVisitResponse {
  id: string;
  signedBy: {
    staffId: string;
    name: string;
    role: string;
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
// Sign a progress note — matches backend `signProgressNoteSchema.body`
// ─────────────────────────────────────────────────────────────
export interface SignProgressNoteRequest {
  email: string;
  password: string;
  role: 'Physician' | 'Nurse' | 'Reviewer';
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