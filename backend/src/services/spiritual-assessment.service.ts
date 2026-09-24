import { PrismaClient } from '@prisma/client';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';


const prismaBase = new PrismaClient();
export const prisma = prismaBase;
// ─────────────────────────────────────────────────────────────
// DTO mapper
// ─────────────────────────────────────────────────────────────
const toSpiritualAssessmentDto = (a: any) => ({
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

  religiousAffiliation: a.religiousAffiliation,
  religiousAffiliationOther: a.religiousAffiliationOther,
  faithImportance: a.faithImportance,
  activityParticipation: a.activityParticipation,
  placeOfWorship: a.placeOfWorship,

  supportSources: a.supportSources,

  religiousLeaderName: a.religiousLeaderName,
  religiousLeaderOrganization: a.religiousLeaderOrganization,
  religiousLeaderPhone: a.religiousLeaderPhone,

  lifeMeaningAndPurpose: a.lifeMeaningAndPurpose,
  sourcesOfStrength: a.sourcesOfStrength,

  practicesToContinue: a.practicesToContinue,
  practicesToContinueDetails: a.practicesToContinueDetails,

  ritualsToRespect: a.ritualsToRespect,
  ritualsToRespectDetails: a.ritualsToRespectDetails,

  spiritualDistressLevel: a.spiritualDistressLevel,
  spiritualConcernsDescription: a.spiritualConcernsDescription,

  currentHopes: a.currentHopes,
  copingMethods: a.copingMethods,
  copingMethodOther: a.copingMethodOther,
  feelsAtPeace: a.feelsAtPeace,

  familySharesBeliefs: a.familySharesBeliefs,
  familyBenefitFromSupport: a.familyBenefitFromSupport,
  familySpiritualConcerns: a.familySpiritualConcerns,

  preferredEndOfLifeCare: a.preferredEndOfLifeCare,
  preferredEndOfLifeCareOther: a.preferredEndOfLifeCareOther,
  preferredPlaceOfCare: a.preferredPlaceOfCare,
  preferredPlaceOfCareOther: a.preferredPlaceOfCareOther,
  preferredPlaceOfDeath: a.preferredPlaceOfDeath,
  religiousPracticesAfterDeath: a.religiousPracticesAfterDeath,

  patientStrengths: a.patientStrengths,
  patientStrengthOther: a.patientStrengthOther,
  additionalStrengths: a.additionalStrengths,

  identifiedNeeds: a.identifiedNeeds,
  identifiedNeedOther: a.identifiedNeedOther,
  plannedInterventions: a.plannedInterventions,
  followUpSchedule: a.followUpSchedule,

  summaryOfAssessment: a.summaryOfAssessment,
  providerDistressLevel: a.providerDistressLevel,
  recommendedServices: a.recommendedServices,
  assessmentOutcome: a.assessmentOutcome,

  distressConcerns: a.distressConcerns ?? [],

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
  'religiousAffiliation', 'religiousAffiliationOther',
  'faithImportance', 'activityParticipation', 'placeOfWorship',
  'supportSources',
  'religiousLeaderName', 'religiousLeaderOrganization',
  'religiousLeaderPhone',
  'lifeMeaningAndPurpose', 'sourcesOfStrength',
  'practicesToContinue', 'practicesToContinueDetails',
  'ritualsToRespect', 'ritualsToRespectDetails',
  'spiritualDistressLevel', 'spiritualConcernsDescription',
  'currentHopes', 'copingMethods', 'copingMethodOther', 'feelsAtPeace',
  'familySharesBeliefs', 'familyBenefitFromSupport',
  'familySpiritualConcerns',
  'preferredEndOfLifeCare', 'preferredEndOfLifeCareOther',
  'preferredPlaceOfCare', 'preferredPlaceOfCareOther',
  'preferredPlaceOfDeath', 'religiousPracticesAfterDeath',
  'patientStrengths', 'patientStrengthOther', 'additionalStrengths',
  'identifiedNeeds', 'identifiedNeedOther',
  'plannedInterventions', 'followUpSchedule',
  'summaryOfAssessment', 'providerDistressLevel',
  'recommendedServices', 'assessmentOutcome',
] as const;

const pickWritable = (data: any) => {
  const out: any = {};
  for (const key of WRITABLE_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
};

const pickDistressRows = (data: any) => {
  if (!Array.isArray(data.distressConcerns)) return [];
  return data.distressConcerns.map((r: any) => ({
    concern: r.concern,
    present: r.present ?? false,
  }));
};

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createSpiritualAssessment = async (
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

  const distress = pickDistressRows(data);

  const assessment = await prisma.spiritualAssessment.create({
    data: {
      patientId: pid,
      createdBy: sid,
      ...pickWritable(data),
      ...(distress.length > 0
        ? { distressConcerns: { create: distress } }
        : {}),
    },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true,
          sex: true, hospitalPatientId: true,
        },
      },
      createdByStaff: { select: { id: true, name: true } },
      distressConcerns: true,
    },
  });

  return toSpiritualAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getSpiritualAssessments = async (
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
    prisma.spiritualAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    prisma.spiritualAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      religiousAffiliation: a.religiousAffiliation,
      spiritualDistressLevel: a.spiritualDistressLevel,
      feelsAtPeace: a.feelsAtPeace,
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
export const getAllSpiritualAssessments = async (
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
    client.spiritualAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    client.spiritualAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      religiousAffiliation: a.religiousAffiliation,
      spiritualDistressLevel: a.spiritualDistressLevel,
      feelsAtPeace: a.feelsAtPeace,
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
export const getSpiritualAssessmentById = async (
  patientId: string,
  assessmentId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');

  const assessment = await prisma.spiritualAssessment.findFirst({
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
      distressConcerns: true,
    },
  });

  if (!assessment) throw new ApiError(404, 'Spiritual assessment not found');
  return toSpiritualAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════
export const updateSpiritualAssessment = async (
  patientId: string,
  assessmentId: string,
  data: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.spiritualAssessment.findFirst({
    where: { id: aid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Spiritual assessment not found');

  const updateData: any = {
    ...pickWritable(data),
    updatedBy: adm,
  };

  if (Array.isArray(data.distressConcerns)) {
    const rows = pickDistressRows(data);
    updateData.distressConcerns = { deleteMany: {}, create: rows };
  }

  const updated = await prisma.spiritualAssessment.update({
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
      distressConcerns: true,
    },
  });

  return toSpiritualAssessmentDto(updated);
};

// ═════════════════════════════════════════════════════════════
// SOFT DELETE
// ═════════════════════════════════════════════════════════════
export const deleteSpiritualAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.spiritualAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Spiritual assessment not found');
  if (existing.deletedAt) {
    throw new ApiError(400, 'Assessment is already deleted');
  }

  const updated = await prisma.spiritualAssessment.update({
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
export const restoreSpiritualAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prismaBase.spiritualAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Spiritual assessment not found');
  if (!existing.deletedAt) {
    throw new ApiError(400, 'Assessment is not deleted');
  }

  await prisma.spiritualAssessment.update({
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
export const getDeletedSpiritualAssessments = async (
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prismaBase.spiritualAssessment.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        deletedByAdmin: { select: { id: true, name: true } },
      },
    }),
    prismaBase.spiritualAssessment.count({
      where: { deletedAt: { not: null } },
    }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      assessmentType: a.assessmentType,
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
  createSpiritualAssessment,
  getSpiritualAssessments,
  getAllSpiritualAssessments,
  getSpiritualAssessmentById,
  updateSpiritualAssessment,
  deleteSpiritualAssessment,
  restoreSpiritualAssessment,
  getDeletedSpiritualAssessments,
};