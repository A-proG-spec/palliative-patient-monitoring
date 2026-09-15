// ─────────────────────────────────────────────────────────────
// Signature — one entry in the note/visit `signatures[]` array
// ─────────────────────────────────────────────────────────────

export interface Signature {
  staffId: string;
  name: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse' | 'Reviewer';
  signedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Signing request (visits)
// ─────────────────────────────────────────────────────────────

export interface SignVisitRequest {
  email: string;
  password: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
}

// ─────────────────────────────────────────────────────────────
// Signing response — both visits and progress notes use the
// same shape. The backend returns the newly-added signature,
// the full signatures array, and the updated allSigned flag.
// ─────────────────────────────────────────────────────────────

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
  } | null;
  signatures: Signature[];
  allSigned: boolean;
  totalSignatures: number;
}