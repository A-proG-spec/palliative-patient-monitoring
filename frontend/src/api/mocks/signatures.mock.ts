import type { Signature, SignVisitRequest, VisitSignaturesResponse } from '@/types/signature.types';
import { delay } from '@/lib/utils';

// ── In-memory store: visitId → array of signatures ──────────────
const MOCK_SIGNATURES: Record<string, Signature[]> = {};

const makeTeamLeaderSig = (teamLeaderName?: string): Signature | null =>
  teamLeaderName
    ? {
        staffId: 'staff-002',
        name: teamLeaderName,
        role: 'TeamLeader',
        signedAt: new Date().toISOString(),
      }
    : null;

export const mockSignaturesApi = {
  signVisit: async (visitId: string, data: SignVisitRequest): Promise<Signature> => {
    await delay(600);

    // Ensure the store has an entry for this visit (auto-sign team leader)
    if (!MOCK_SIGNATURES[visitId]) {
      const tl = makeTeamLeaderSig('Team Leader');
      MOCK_SIGNATURES[visitId] = tl ? [tl] : [];
    }

    const sig: Signature = {
      staffId: `staff-${data.role.toLowerCase()}`,
      name: data.email.split('@')[0] || 'Staff',
      role: data.role,
      signedAt: new Date().toISOString(),
    };

    // Replace any existing signature for this role, or append
    const existingIdx = MOCK_SIGNATURES[visitId].findIndex((s) => s.role === data.role);
    if (existingIdx >= 0) {
      MOCK_SIGNATURES[visitId][existingIdx] = sig;
    } else {
      MOCK_SIGNATURES[visitId].push(sig);
    }

    return sig;
  },

  getVisitSignatures: async (visitId: string): Promise<VisitSignaturesResponse> => {
    await delay(400);

    const sigs = MOCK_SIGNATURES[visitId] ?? [];
    const defaultTl = makeTeamLeaderSig('Team Leader');
    const allSigs: Signature[] = sigs.length > 0 ? sigs : (defaultTl ? [defaultTl] : []);

    const teamLeader = allSigs.find((s) => s.role === 'TeamLeader') ?? null;
    const allSigned =
      !!allSigs.find((s) => s.role === 'TeamLeader') &&
      !!allSigs.find((s) => s.role === 'Physician') &&
      !!allSigs.find((s) => s.role === 'Nurse');

    return {
      visitId,
      visitDate: new Date().toISOString(),
      teamLeader: teamLeader
        ? { staffId: teamLeader.staffId, name: teamLeader.name, role: teamLeader.role }
        : null,
      signatures: allSigs,
      allSigned,
      totalSignatures: allSigs.length,
    };
  },
};
