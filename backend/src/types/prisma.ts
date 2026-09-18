import { Prisma } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// Common includes
// ─────────────────────────────────────────────────────────────

export const patientWithRegistrar = {
  include: { registeredByStaff: true },
} satisfies Prisma.PatientDefaultArgs;

export type PatientWithRegistrar = Prisma.PatientGetPayload<
  typeof patientWithRegistrar
>;

// ── HomeVisit ──
export const homeVisitFullInclude = {
  include: {
    patient: true,
    createdByStaff: true,
    signatures: true,
    currentMedications: true,
  },
} satisfies Prisma.HomeVisitDefaultArgs;

export type HomeVisitFull = Prisma.HomeVisitGetPayload<
  typeof homeVisitFullInclude
>;

// ── HospitalAdmission ──
export const admissionFullInclude = {
  include: {
    patient: true,
    referral: true,
    createdByStaff: true,
    dischargeSummaries: true,
  },
} satisfies Prisma.HospitalAdmissionDefaultArgs;

export type AdmissionFull = Prisma.HospitalAdmissionGetPayload<
  typeof admissionFullInclude
>;

// ── PatientProgressNote ──
export const progressNoteFullInclude = {
  include: {
    patient: true,
    admission: true,
    responsibleClinician: true,
    createdByStaff: true,
    signatures: true,
    medications: true,
    multidisciplinaryTeamReview: true,
    additionalProgressNotes: true,
  },
} satisfies Prisma.PatientProgressNoteDefaultArgs;

export type ProgressNoteFull = Prisma.PatientProgressNoteGetPayload<
  typeof progressNoteFullInclude
>;

// ── DischargeSummary ──
export const dischargeFullInclude = {
  include: {
    patient: true,
    admission: true,
    createdByStaff: true,
    dischargeMedications: true,
  },
} satisfies Prisma.DischargeSummaryDefaultArgs;

export type DischargeFull = Prisma.DischargeSummaryGetPayload<
  typeof dischargeFullInclude
>;

// ── ImagingOrder ──
export const imagingFullInclude = {
  include: {
    patient: true,
    orderedByStaff: true,
  },
} satisfies Prisma.ImagingOrderDefaultArgs;

export type ImagingFull = Prisma.ImagingOrderGetPayload<
  typeof imagingFullInclude
>;

// ── LaboratoryTest ──
export const labFullInclude = {
  include: {
    patient: true,
    orderedByStaff: true,
  },
} satisfies Prisma.LaboratoryTestDefaultArgs;

export type LabFull = Prisma.LaboratoryTestGetPayload<typeof labFullInclude>;

// ── Referral ──
export const referralFullInclude = {
  include: {
    patient: true,
    requestedByStaff: true,
    approvedByAdmin: true,
  },
} satisfies Prisma.ReferralDefaultArgs;

export type ReferralFull = Prisma.ReferralGetPayload<
  typeof referralFullInclude
>;

// ── Medication ──
export const medicationFullInclude = {
  include: {
    patient: true,
    prescribedByStaff: true,
  },
} satisfies Prisma.MedicationDefaultArgs;

export type MedicationFull = Prisma.MedicationGetPayload<
  typeof medicationFullInclude
>;

// ─────────────────────────────────────────────────────────────
// Re-export Prisma namespace for service use
// ─────────────────────────────────────────────────────────────
export { Prisma };