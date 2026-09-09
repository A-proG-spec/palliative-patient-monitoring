import type { Signature, SignVisitRequest, VisitSignaturesResponse } from '@/types/signature.types';
import { delay } from '@/lib/utils';

// ── In-memory store ──────────────────────────────────────────────
const MOCK_SIGNATURES: Record<string, { teamLeader: Signature | null; physician: Signature | null; nurse: Signature | null }> = {};

const getDefaultSignatures = (visitId: string, teamLeaderName?: string) => ({
  teamLeader: teamLeaderName ? {
    id: `sig-tl-${Date.now()}`,
    visitId,
    staffId: 'staff-002',
    staffName: teamLeaderName,
    role: 'TeamLeader' as const,
    signedAt: new Date().toISOString(),
    autoSigned: true,
  } : null,
  physician: null,
  nurse: null,
});

export const mockSignaturesApi = {
  signVisit: async (visitId: string, data: SignVisitRequest): Promise<Signature> => {
    await delay(600);
    if (!MOCK_SIGNATURES[visitId]) {
      MOCK_SIGNATURES[visitId] = getDefaultSignatures(visitId, 'Team Leader');
    }

    const sig: Signature = {
      id: `sig-${Date.now()}`,
      visitId,
      staffId: `staff-${data.role.toLowerCase()}`,
      staffName: data.email.split('@')[0] || 'Staff',
      role: data.role,
      signedAt: new Date().toISOString(),
      autoSigned: false,
    };

    if (data.role === 'Physician') {
      MOCK_SIGNATURES[visitId].physician = sig;
    } else if (data.role === 'Nurse') {
      MOCK_SIGNATURES[visitId].nurse = sig;
    }

    return sig;
  },

  getVisitSignatures: async (visitId: string): Promise<VisitSignaturesResponse> => {
    await delay(400);
    const sigs = MOCK_SIGNATURES[visitId] || getDefaultSignatures(visitId, 'Team Leader');
    const allSigned = !!(sigs.teamLeader && sigs.physician && sigs.nurse);
    const totalSignatures = [sigs.teamLeader, sigs.physician, sigs.nurse].filter(Boolean).length;

    return {
      visitId,
      visitDate: new Date().toISOString(),
      teamLeader: sigs.teamLeader,
      physician: sigs.physician,
      nurse: sigs.nurse,
      allSigned,
      totalSignatures,
    };
  },
};