import bcrypt from 'bcrypt';
import { prisma } from '@db/prisma.js';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';

// ─────────────────────────────────────────────────────────────
// DTO helpers
// ─────────────────────────────────────────────────────────────
const formatSignatures = (signatures: any[]) =>
  (signatures || []).map((s) => ({
    staffId: s.staffId,
    name: s.name,
    role: s.role,
    isTeamLeader: s.isTeamLeader,
    signedAt: s.signedAt,
  }));

const isAllSigned = (signatures: any[]): boolean => {
  const roles = new Set((signatures || []).map((s) => s.role));
  return roles.has('Physician') && roles.has('Nurse');
};

// ═════════════════════════════════════════════════════════════
// Record visit
//
// The submitting staff (`req.user.id`) becomes the team leader:
//   - HomeVisit.createdBy = staffId
//   - One auto-inserted HomeVisitSignature with isTeamLeader = true
// ═════════════════════════════════════════════════════════════
export const recordVisit = async (
  patientId: string,
  data: any,
  staffId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(staffId, 'staff id');

  const [patient, teamLeader] = await Promise.all([
    prisma.patient.findUnique({ where: { id: pid }, select: { id: true } }),
    prisma.staff.findUnique({
      where: { id: sid },
      select: { id: true, name: true, role: true },
    }),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!teamLeader) throw new ApiError(404, 'Team leader not found');

  // Validate any referenced team member staffIds exist
  const memberIds = (data.teamMembers || [])
    .map((m: any) => (m.staffId ? Number(m.staffId) : null))
    .filter((x): x is number => x !== null && Number.isInteger(x) && x > 0);

  if (memberIds.length > 0) {
    const found = await prisma.staff.count({ where: { id: { in: memberIds } } });
    if (found !== memberIds.length) {
      throw new ApiError(400, 'One or more team members not found');
    }
  }

  // Fallback: if the submitting staff has no role set, default to Nurse
  // (their signature still uses isTeamLeader: true).
  const leaderRole = teamLeader.role === 'Physician' ? 'Physician' : 'Nurse';

  const visit = await prisma.homeVisit.create({
    data: {
      patientId: pid,

      visitDate: new Date(data.visitDate),
      timeStarted: data.timeStarted,
      timeEnded: data.timeEnded,
      visitType: data.visitType,

      overallStatus: data.overallStatus,
      mobility: data.mobility,

      // vitals (schema uses `temprature` — keep the field name as-is)
      temprature: data.vitals?.temperature ?? null,
      pulse: data.vitals?.pulse ?? null,
      bloodPressure: data.vitals?.bloodPressure ?? null,
      respiration: data.vitals?.respiration ?? null,
      spO2: data.vitals?.spO2 ?? null,

      // pain
      painPresent: data.painPresent ?? null,
      painScore: data.painScore,
      painLocation: data.painLocation ?? [],
      painLocationOther: data.painLocationOther ?? null,
      painCharacteristics: data.painCharacteristics ?? [],
      currentPainMedication: data.currentPainMedication ?? null,
      painMedicationEffective: data.painMedicationEffective,
      painManagementIneffectiveReason: data.painManagementIneffectiveReason ?? null,

      // symptoms
      symptoms: data.symptoms ?? [],
      symptomsOther: data.symptomsOther ?? null,

      // ADL (note: `Mobility` is capitalized in the schema)
      feeding: data.adl?.feeding,
      bathing: data.adl?.bathing,
      dressing: data.adl?.dressing,
      toileting: data.adl?.toileting,
      Mobility: data.adl?.mobility,
      ppsScore: data.ppsScore,
      kpsScore: data.kpsScore,

      // nutrition
      appetite: data.appetite,
      oralIntake: data.oralIntake,
      hydrationStatus: data.hydrationStatus,
      nutritionComments: data.nutritionComments ?? null,

      // psychosocial
      emotionalStatus: data.emotionalStatus,
      emotionalComments: data.emotionalComments ?? null,
      familySupport: data.familySupport,
      financialDifficulty: data.financialDifficulty,
      financialComments: data.financialComments ?? null,

      // spiritual
      spiritualNeeds: data.spiritualNeeds,
      spiritualNeedsDescription: data.spiritualNeedsDescription ?? null,
      religiousSupportRequested: data.religiousSupportRequested,
      religiousSupportSpecify: data.religiousSupportSpecify ?? null,

      // medication review
      medicationAvailable: data.medicationAvailable,
      medicationCorrectlyTaken: data.medicationCorrectlyTaken,
      medicationSideEffects: data.medicationSideEffects,
      medicationRefillNeeded: data.medicationRefillNeeded,
      morphineAvailable: data.morphineAvailable ?? null,
      adherenceLevel: data.adherenceLevel,
      medicationIssues: data.medicationIssues ?? null,

      // caregiver
      primaryCaregiver: data.primaryCaregiver ?? null,
      caregiverBurden: data.caregiverBurden,
      caregiverUnderstanding: data.caregiverUnderstanding,
      caregivingCapacity: data.caregivingCapacity,
      familyEmotionalStatus: data.familyEmotionalStatus,

      // education
      educationProvided: data.educationProvided ?? [],
      educationProvidedOther: data.educationProvidedOther ?? null,
      trainingNeeds: data.trainingNeeds ?? [],
      additionalSupportNeeded: data.additionalSupportNeeded ?? null,
      additionalSupportSpecify: data.additionalSupportSpecify ?? null,

      // home environment
      homeCondition: data.homeCondition,
      homeObservations: data.homeObservations ?? [],
      homeEnvironmentDetails: data.homeEnvironmentDetails ?? null,

      // nursing care
      nursingCareGiven: data.nursingCareGiven ?? [],
      nursingCareOther: data.nursingCareOther ?? null,

      // red flags
      redFlags: data.redFlags ?? [],
      redFlagActions: data.redFlagActions ?? null,

      // referrals made
      referralsMade: data.referralsMade ?? [],

      // key issues / action plan
      keyIssues: data.keyIssues ?? null,
      immediateActions: data.immediateActions ?? null,
      followUpPlan: data.followUpPlan ?? null,
      nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate) : null,

      // outcome
      outcome: data.outcome,
      dateOfDeath: data.dateOfDeath ? new Date(data.dateOfDeath) : null,

      // audit
      createdBy: sid,

      // Auto-signature: the submitting staff is the team leader
      signatures: {
        create: [
          {
            staffId: sid,
            name: teamLeader.name,
            role: leaderRole,
            isTeamLeader: true,
            signedAt: new Date(),
          },
        ],
      },

      // Additional team members (if any) go in as signatures with isTeamLeader: false
      ...(Array.isArray(data.teamMembers) && data.teamMembers.length > 0
        ? {
          signatures: {
            create: [
              {
                staffId: sid,
                name: teamLeader.name,
                role: leaderRole,
                isTeamLeader: true,
                signedAt: new Date(),
              },
              ...data.teamMembers
                .filter((m: any) => m.staffId && Number(m.staffId) !== sid)
                .map((m: any) => ({
                  staffId: Number(m.staffId),
                  name: m.name,
                  role: m.role === 'Physician' ? 'Physician' : 'Nurse',
                  isTeamLeader: false,
                  signedAt: new Date(),
                })),
            ],
          },
        }
        : {}),

      // Current medications (child rows)
      ...(Array.isArray(data.currentMedications) && data.currentMedications.length > 0
        ? {
          currentMedications: {
            create: data.currentMedications.map((m: any) => ({
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              route: m.route,
            })),
          },
        }
        : {}),
    },
    include: {
      signatures: true,
      currentMedications: true,
    },
  });

  return {
    id: visit.id,
    patientId: visit.patientId,
    visitDate: visit.visitDate,
    outcome: visit.outcome,
    createdBy: visit.createdBy,
    signatures: formatSignatures(visit.signatures),
    currentMedications: visit.currentMedications,
    createdAt: visit.createdAt,
  };
};

// ═════════════════════════════════════════════════════════════
// List visits for a patient
// ═════════════════════════════════════════════════════════════
export const getVisits = async (
  patientId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const pid = toId(patientId, 'patient id');

  const patient = await prisma.patient.findUnique({
    where: { id: pid },
    select: { id: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.homeVisit.findMany({
      where: { patientId: pid },
      orderBy: { visitDate: 'desc' },
      skip,
      take: limit,
      include: { signatures: true },
    }),
    prisma.homeVisit.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((visit) => ({
      id: visit.id,
      visitDate: visit.visitDate,
      visitType: visit.visitType,
      overallStatus: visit.overallStatus,
      outcome: visit.outcome,
      ppsScore: visit.ppsScore,
      kpsScore: visit.kpsScore,
      createdBy: visit.createdBy,
      signatures: formatSignatures(visit.signatures),
      allSigned: isAllSigned(visit.signatures),
      createdAt: visit.createdAt,
    })),
    page,
    limit,
    total,
  };
};

// ═════════════════════════════════════════════════════════════
// Get one visit (full detail)
// ═════════════════════════════════════════════════════════════
export const getVisitById = async (patientId: string, visitId: string) => {
  const pid = toId(patientId, 'patient id');
  const vid = toId(visitId, 'visit id');

  const visit = await prisma.homeVisit.findFirst({
    where: { id: vid, patientId: pid },
    include: {
      createdByStaff: { select: { id: true, name: true, role: true } },
      signatures: true,
      currentMedications: true,
    },
  });

  if (!visit) throw new ApiError(404, 'Visit not found');

  return {
    ...visit,
    createdBy: {
      id: visit.createdByStaff.id,
      name: visit.createdByStaff.name,
      role: visit.createdByStaff.role,
    },
    createdByStaff: undefined,
    signatures: formatSignatures(visit.signatures),
    allSigned: isAllSigned(visit.signatures),
    currentMedications: visit.currentMedications,
  };
};

// ═════════════════════════════════════════════════════════════
// Sign visit — verifies email + password (bcrypt)
//
// The team leader is auto-signed at creation, so they cannot
// sign again. Only Physician/Nurse roles can sign here.
// ═════════════════════════════════════════════════════════════
export const signVisit = async (
  visitId: string,
  data: { email: string; password: string; role: 'Physician' | 'Nurse' },
  _currentUserId: string | number,
) => {
  const vid = toId(visitId, 'visit id');

  const visit = await prisma.homeVisit.findUnique({
    where: { id: vid },
    include: { signatures: true },
  });
  if (!visit) throw new ApiError(404, 'Visit not found');

  const email = data.email.toLowerCase().trim();
  const staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff) throw new ApiError(401, 'Invalid credentials');

  if (staff.status !== 'Active') {
    throw new ApiError(403, 'Staff account is not active');
  }
  if (!staff.isEmailVerified) {
    throw new ApiError(403, 'Staff email is not verified');
  }

  const passwordOk = await bcrypt.compare(data.password, staff.password);
  if (!passwordOk) throw new ApiError(401, 'Invalid credentials');

  if (staff.role !== data.role) {
    throw new ApiError(403, `You are not registered as a ${data.role}`);
  }

  const alreadySigned = visit.signatures.some((s) => s.staffId === staff.id);
  if (alreadySigned) {
    throw new ApiError(400, 'You have already signed this visit');
  }

  await prisma.homeVisitSignature.create({
    data: {
      homeVisitId: vid,
      staffId: staff.id,
      name: staff.name,
      role: data.role,
      isTeamLeader: false,
      signedAt: new Date(),
    },
  });

  const refreshed = await prisma.homeVisitSignature.findMany({
    where: { homeVisitId: vid },
    orderBy: { signedAt: 'asc' },
  });

  return {
    id: vid,
    signedBy: {
      staffId: staff.id,
      name: staff.name,
      role: data.role,
      signedAt: refreshed[refreshed.length - 1].signedAt,
    },
    signatures: formatSignatures(refreshed),
    allSigned: isAllSigned(refreshed),
  };
};

// ═════════════════════════════════════════════════════════════
// Get signature status for a visit
// ═════════════════════════════════════════════════════════════
export const getVisitSignatures = async (visitId: string) => {
  const vid = toId(visitId, 'visit id');

  const visit = await prisma.homeVisit.findUnique({
    where: { id: vid },
    include: {
      createdByStaff: { select: { id: true, name: true, role: true } },
      signatures: true,
    },
  });
  if (!visit) throw new ApiError(404, 'Visit not found');

  const leaderSignature = visit.signatures.find((s) => s.isTeamLeader);

  return {
    visitId: visit.id,
    visitDate: visit.visitDate,
    teamLeader: leaderSignature
      ? {
        staffId: leaderSignature.staffId,
        name: leaderSignature.name,
        role: leaderSignature.role,
        signedAt: leaderSignature.signedAt,
      }
      : {
        staffId: visit.createdByStaff.id,
        name: visit.createdByStaff.name,
        role: visit.createdByStaff.role,
      },
    signatures: formatSignatures(visit.signatures),
    allSigned: isAllSigned(visit.signatures),
    totalSignatures: visit.signatures.length,
  };
};

// ═════════════════════════════════════════════════════════════
// Update visit — admin only, records auditor
// ═════════════════════════════════════════════════════════════
export const updateVisit = async (
  visitId: string,
  data: any,
  adminId: string | number,
) => {
  const vid = toId(visitId, 'visit id');
  const aid = toId(adminId, 'admin id');

  const visit = await prisma.homeVisit.findUnique({
    where: { id: vid },
  });
  if (!visit) throw new ApiError(404, 'Visit not found');

  const allowed = [
    'visitDate',
    'timeStarted',
    'timeEnded',
    'overallStatus',
    'painScore',
    'ppsScore',
    'kpsScore',
    'outcome',
  ] as const;

  const updateData: any = {};
  const changes: any[] = [];

  for (const key of allowed) {
    if (data[key] !== undefined && (visit as any)[key] !== data[key]) {
      changes.push({ field: key, from: (visit as any)[key], to: data[key] });
      updateData[key] =
        key === 'visitDate' ? new Date(data[key]) : data[key];
    }
  }

  updateData.updatedBy = aid;

  const updated = await prisma.homeVisit.update({
    where: { id: vid },
    data: updateData,
  });

  return {
    id: updated.id,
    updatedAt: updated.updatedAt,
    changes,
  };
};

// ═════════════════════════════════════════════════════════════
// Soft delete (admin only)
// ═════════════════════════════════════════════════════════════
export const deleteVisit = async (
  visitId: string,
  adminId: string | number,
  reason?: string,
) => {
  const vid = toId(visitId, 'visit id');
  const aid = toId(adminId, 'admin id');

  const visit = await prisma.homeVisit.findUnique({
    where: { id: vid },
  });
  if (!visit) throw new ApiError(404, 'Visit not found');
  if (visit.deletedAt) throw new ApiError(400, 'Visit is already deleted');

  const updated = await prisma.homeVisit.update({
    where: { id: vid },
    data: {
      deletedAt: new Date(),
      deletedBy: aid,
      deletionReason: reason ?? null,
      updatedBy: aid,
    },
  });

  return { id: visitId, success: true, deletedAt: updated.deletedAt };
};

// ═════════════════════════════════════════════════════════════
// Restore
// ═════════════════════════════════════════════════════════════
export const restoreVisit = async (visitId: string, adminId: string | number) => {
  const vid = toId(visitId, 'visit id');
  const aid = toId(adminId, 'admin id');

  const visit = await prisma.homeVisit.findUnique({ where: { id: vid } });
  if (!visit) throw new ApiError(404, 'Visit not found');
  if (!visit.deletedAt) throw new ApiError(400, 'Visit is not deleted');

  await prisma.homeVisit.update({
    where: { id: vid },
    data: {
      deletedAt: null,
      deletedBy: null,
      deletionReason: null,
      updatedBy: aid,
    },
  });

  return { id: visitId, restored: true };
};

export default {
  recordVisit,
  getVisits,
  getVisitById,
  signVisit,
  getVisitSignatures,
  updateVisit,
  deleteVisit,
  restoreVisit,
};