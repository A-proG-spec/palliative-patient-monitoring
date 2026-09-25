import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';
// ─────────────────────────────────────────────────────────────
// DTO mapper
// ─────────────────────────────────────────────────────────────
const toPainAssessmentDto = (a: any) => ({
  id: a.id,
  patientId: a.patientId,
  patient: a.patient
    ? {
        id: a.patient.id,
        firstName: a.patient.firstName,
        lastName: a.patient.lastName,
        age: a.patient.age,
        sex: a.patient.sex,
        hospitalPatientId: a.patient.hospitalPatientId,
      }
    : null,

  assessmentType: a.assessmentType,

  primaryPainComplaint: a.primaryPainComplaint,
  painOnset: a.painOnset,
  painDuration: a.painDuration,

  painLocations: a.painLocations,
  painLocationOther: a.painLocationOther,
  painDescriptions: a.painDescriptions,

  currentPainScore: a.currentPainScore,
  worstPainLast24h: a.worstPainLast24h,
  leastPainLast24h: a.leastPainLast24h,

  painType: a.painType,
  painPattern: a.painPattern,

  aggravatingFactors: a.aggravatingFactors,
  relievingFactors: a.relievingFactors,
  relievingOther: a.relievingOther,

  opioidUse: a.opioidUse,
  adjuvantDrugs: a.adjuvantDrugs,

  breakthroughFrequency: a.breakthroughFrequency,
  rescueMedicationUsed: a.rescueMedicationUsed,
  rescueEffectiveness: a.rescueEffectiveness,

  associatedSymptoms: a.associatedSymptoms,
  patientBehaviors: a.patientBehaviors,

  managementBarriers: a.managementBarriers,
  managementBarrierOther: a.managementBarrierOther,

  diagnosis: a.diagnosis,

  managementGoals: a.managementGoals,
  interventions: a.interventions,
  nonPharmacologicalMethods: a.nonPharmacologicalMethods,
  monitoringPlan: a.monitoringPlan,

  assessmentOutcome: a.assessmentOutcome,
  finalRecommendations: a.finalRecommendations,

  impacts: a.impacts ?? [],

  createdBy: a.createdBy,
  createdByStaff: a.createdByStaff
    ? { id: a.createdByStaff.id, name: a.createdByStaff.name }
    : null,
  updatedBy: a.updatedBy,
  updatedByAdmin: a.updatedByAdmin
    ? { id: a.updatedByAdmin.id, name: a.updatedByAdmin.name }
    : null,
  deletedAt: a.deletedAt,
  deletedBy: a.deletedBy,
  deletionReason: a.deletionReason,

  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

const WRITABLE_FIELDS = [
  'assessmentType',
  'primaryPainComplaint', 'painOnset', 'painDuration',
  'painLocations', 'painLocationOther', 'painDescriptions',
  'currentPainScore', 'worstPainLast24h', 'leastPainLast24h',
  'painType', 'painPattern',
  'aggravatingFactors', 'relievingFactors', 'relievingOther',
  'opioidUse', 'adjuvantDrugs',
  'breakthroughFrequency', 'rescueMedicationUsed', 'rescueEffectiveness',
  'associatedSymptoms', 'patientBehaviors',
  'managementBarriers', 'managementBarrierOther',
  'diagnosis',
  'managementGoals', 'interventions',
  'nonPharmacologicalMethods', 'monitoringPlan',
  'assessmentOutcome', 'finalRecommendations',
] as const;

const pickWritable = (data: any) => {
  const out: any = {};
  for (const key of WRITABLE_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
};

const pickImpactRows = (data: any) => {
  if (!Array.isArray(data.impacts)) return [];
  return data.impacts.map((r: any) => ({
    area: r.area,
    severity: r.severity ?? null,
  }));
};

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createPainAssessment = async (
  patientId: string,
  data: any,
  staffId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(staffId, 'staff id');

  const [patient, staff] = await Promise.all([
    prisma.patient.findUnique({ where: { id: pid }, select: { id: true } }),
    prisma.staff.findUnique({ where: { id: sid }, select: { id: true } }),
  ]);
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const impacts = pickImpactRows(data);

  const assessment = await prisma.painAssessment.create({
    data: {
      patientId: pid,
      createdBy: sid,
      ...pickWritable(data),
      ...(impacts.length > 0 ? { impacts: { create: impacts } } : {}),
    },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true,
          sex: true, hospitalPatientId: true,
        },
      },
      createdByStaff: { select: { id: true, name: true } },
      impacts: true,
    },
  });

  return toPainAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getPainAssessments = async (
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
    prisma.painAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    prisma.painAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      currentPainScore: a.currentPainScore,
      worstPainLast24h: a.worstPainLast24h,
      painType: a.painType,
      diagnosis: a.diagnosis,
      assessmentOutcome: a.assessmentOutcome,
      createdBy: a.createdByStaff
        ? { id: a.createdByStaff.id, name: a.createdByStaff.name }
        : null,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      deletedAt: a.deletedAt,
    })),
    page,
    limit,
    total,
  };
};

// ═════════════════════════════════════════════════════════════
// LIST ALL
// ═════════════════════════════════════════════════════════════
export const getAllPainAssessments = async (
  patientId: string,
  page: number = 1,
  limit: number = 20,
  includeDeleted: boolean = false,
) => {
  const pid = toId(patientId, 'patient id');
  const client = includeDeleted ? prismaBase : prisma;

  const patient = await prisma.patient.findUnique({
    where: { id: pid },
    select: { id: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    client.painAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    client.painAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      currentPainScore: a.currentPainScore,
      worstPainLast24h: a.worstPainLast24h,
      painType: a.painType,
      diagnosis: a.diagnosis,
      assessmentOutcome: a.assessmentOutcome,
      createdBy: a.createdByStaff
        ? { id: a.createdByStaff.id, name: a.createdByStaff.name }
        : null,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      deletedAt: a.deletedAt ?? null,
      deletionReason: a.deletionReason ?? null,
    })),
    page,
    limit,
    total,
  };
};

// ═════════════════════════════════════════════════════════════
// GET ONE
// ═════════════════════════════════════════════════════════════
export const getPainAssessmentById = async (
  patientId: string,
  assessmentId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');

  const assessment = await prisma.painAssessment.findFirst({
    where: { id: aid, patientId: pid },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true,
          sex: true, hospitalPatientId: true,
        },
      },
      createdByStaff: { select: { id: true, name: true } },
      updatedByAdmin: { select: { id: true, name: true } },
      impacts: true,
    },
  });

  if (!assessment) throw new ApiError(404, 'Pain assessment not found');
  return toPainAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════
export const updatePainAssessment = async (
  patientId: string,
  assessmentId: string,
  data: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.painAssessment.findFirst({
    where: { id: aid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Pain assessment not found');

  const updateData: any = {
    ...pickWritable(data),
    updatedBy: adm,
  };

  if (Array.isArray(data.impacts)) {
    const rows = pickImpactRows(data);
    updateData.impacts = { deleteMany: {}, create: rows };
  }

  const updated = await prisma.painAssessment.update({
    where: { id: aid },
    data: updateData,
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true,
          sex: true, hospitalPatientId: true,
        },
      },
      createdByStaff: { select: { id: true, name: true } },
      updatedByAdmin: { select: { id: true, name: true } },
      impacts: true,
    },
  });

  return toPainAssessmentDto(updated);
};

// ═════════════════════════════════════════════════════════════
// SOFT DELETE
// ═════════════════════════════════════════════════════════════
export const deletePainAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.painAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Pain assessment not found');
  if (existing.deletedAt) {
    throw new ApiError(400, 'Assessment is already deleted');
  }

  const updated = await prisma.painAssessment.update({
    where: { id: aid },
    data: {
      deletedAt: new Date(),
      deletedBy: adm,
      deletionReason: reason ?? null,
      updatedBy: adm,
    },
  });

  return {
    id: updated.id,
    success: true,
    deletedAt: updated.deletedAt,
    deletionReason: updated.deletionReason,
  };
};

// ═════════════════════════════════════════════════════════════
// RESTORE
// ═════════════════════════════════════════════════════════════
export const restorePainAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prismaBase.painAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Pain assessment not found');
  if (!existing.deletedAt) {
    throw new ApiError(400, 'Assessment is not deleted');
  }

  await prisma.painAssessment.update({
    where: { id: aid },
    data: {
      deletedAt: null,
      deletedBy: null,
      deletionReason: null,
      updatedBy: adm,
    },
  });

  return { id: aid, restored: true };
};

// ═════════════════════════════════════════════════════════════
// LIST DELETED
// ═════════════════════════════════════════════════════════════
export const getDeletedPainAssessments = async (
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prismaBase.painAssessment.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        deletedByAdmin: { select: { id: true, name: true } },
      },
    }),
    prismaBase.painAssessment.count({
      where: { deletedAt: { not: null } },
    }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      assessmentType: a.assessmentType,
      currentPainScore: a.currentPainScore,
      deletedAt: a.deletedAt,
      deletedBy: a.deletedByAdmin
        ? { id: a.deletedByAdmin.id, name: a.deletedByAdmin.name }
        : null,
      deletionReason: a.deletionReason,
    })),
    page,
    limit,
    total,
  };
};

export default {
  createPainAssessment,
  getPainAssessments,
  getAllPainAssessments,
  getPainAssessmentById,
  updatePainAssessment,
  deletePainAssessment,
  restorePainAssessment,
  getDeletedPainAssessments,
};