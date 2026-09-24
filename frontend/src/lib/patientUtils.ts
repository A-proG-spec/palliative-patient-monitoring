// ═════════════════════════════════════════════════════════════
// Patient display helpers
// ═════════════════════════════════════════════════════════════

/**
 * Derive a stable, human-readable patient identifier.
 *
 * Backend returns:
 *   id: string | number         — internal PK (serialized as string on the wire)
 *   hospitalPatientId: string | null — real hospital MRN (only when admitted)
 *
 * Prefers `hospitalPatientId` when set; falls back to
 * `PAT-0001` derived from the primary key.
 */
export function getPatientDisplayId(patient: {
  id: string | number;
  hospitalPatientId?: string | null;
}): string {
  return (
    patient.hospitalPatientId ??
    `PAT-${String(patient.id).padStart(4, '0')}`
  );
}
