import { PrismaClient } from '@prisma/client';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';


const prismaBase = new PrismaClient();
export const prisma = prismaBase;

// ─────────────────────────────────────────────────────────────
// DTO mapper
// ─────────────────────────────────────────────────────────────
const toFamilyAssessmentDto = (a: any) => ({
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

  householdSize: a.householdSize,
  primaryDecisionMaker: a.primaryDecisionMaker,
  primaryDecisionMakerName: a.primaryDecisionMakerName,

  primaryCaregiverName: a.primaryCaregiverName,
  primaryCaregiverRelationship: a.primaryCaregiverRelationship,
  primaryCaregiverAge: a.primaryCaregiverAge,
  primaryCaregiverPhone: a.primaryCaregiverPhone,

  secondaryCaregiverName: a.secondaryCaregiverName,
  secondaryCaregiverRelationship: a.secondaryCaregiverRelationship,
  secondaryCaregiverPhone: a.secondaryCaregiverPhone,

  caregiverAvailability: a.caregiverAvailability,
  physicalAbility: a.physicalAbility,
  emotionalReadiness: a.emotionalReadiness,
  knowledgeOfIllness: a.knowledgeOfIllness,

  internalSupport: a.internalSupport,
  externalSupport: a.externalSupport,
  socialIsolationRisk: a.socialIsolationRisk,

  incomeSources: a.incomeSources,
  monthlyIncomeLevel: a.monthlyIncomeLevel,
  financialBurden: a.financialBurden,
  financialChallenges: a.financialChallenges,

  housingType: a.housingType,
  housingTypeOther: a.housingTypeOther,
  homeEnvironment: a.homeEnvironment,
  utilitiesAccess: a.utilitiesAccess,

  copingAbility: a.copingAbility,
  familyEmotionalStatus: a.familyEmotionalStatus,
  anticipatoryGrief: a.anticipatoryGrief,

  religiousAffiliation: a.religiousAffiliation,
  religiousAffiliationOther: a.religiousAffiliationOther,
  culturalBeliefsAffectingCare: a.culturalBeliefsAffectingCare,
  palliativeCareAcceptance: a.palliativeCareAcceptance,

  burdenLevel: a.burdenLevel,
  burdenFactors: a.burdenFactors,

  needs: a.needs,
  strengths: a.strengths,

  plannedInterventions: a.plannedInterventions,
  supportServices: a.supportServices,
  followUpPlan: a.followUpPlan,

  assessmentOutcome: a.assessmentOutcome,
  finalRecommendations: a.finalRecommendations,
  assessorName: a.assessorName,

  householdMembers: a.householdMembers ?? [],

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
  'householdSize',
  'primaryDecisionMaker', 'primaryDecisionMakerName',
  'primaryCaregiverName', 'primaryCaregiverRelationship',
  'primaryCaregiverAge', 'primaryCaregiverPhone',
  'secondaryCaregiverName', 'secondaryCaregiverRelationship',
  'secondaryCaregiverPhone',
  'caregiverAvailability',
  'physicalAbility', 'emotionalReadiness', 'knowledgeOfIllness',
  'internalSupport', 'externalSupport', 'socialIsolationRisk',
  'incomeSources', 'monthlyIncomeLevel',
  'financialBurden', 'financialChallenges',
  'housingType', 'housingTypeOther', 'homeEnvironment',
  'utilitiesAccess',
  'copingAbility', 'familyEmotionalStatus', 'anticipatoryGrief',
  'religiousAffiliation', 'religiousAffiliationOther',
  'culturalBeliefsAffectingCare', 'palliativeCareAcceptance',
  'burdenLevel', 'burdenFactors',
  'needs', 'strengths',
  'plannedInterventions', 'supportServices', 'followUpPlan',
  'assessmentOutcome', 'finalRecommendations', 'assessorName',
] as const;

const pickWritable = (data: any) => {
  const out: any = {};
  for (const key of WRITABLE_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
};

const pickHouseholdRows = (data: any) => {
  if (!Array.isArray(data.householdMembers)) return [];
  return data.householdMembers.map((m: any) => ({
    name: m.name ?? '',
    age: m.age ?? null,
    relationship: m.relationship ?? '',
    occupation: m.occupation ?? '',
    contact: m.contact ?? '',
  }));
};

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createFamilyAssessment = async (
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

  const members = pickHouseholdRows(data);

  const assessment = await prisma.familyAssessment.create({
    data: {
      patientId: pid,
      createdBy: sid,
      ...pickWritable(data),
      ...(members.length > 0
        ? { householdMembers: { create: members } }
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
      householdMembers: true,
    },
  });

  return toFamilyAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getFamilyAssessments = async (
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
    prisma.familyAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    prisma.familyAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      burdenLevel: a.burdenLevel,
      palliativeCareAcceptance: a.palliativeCareAcceptance,
      assessmentOutcome: a.assessmentOutcome,
      assessorName: a.assessorName,
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
export const getAllFamilyAssessments = async (
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
    client.familyAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    client.familyAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      burdenLevel: a.burdenLevel,
      palliativeCareAcceptance: a.palliativeCareAcceptance,
      assessmentOutcome: a.assessmentOutcome,
      assessorName: a.assessorName,
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
export const getFamilyAssessmentById = async (
  patientId: string,
  assessmentId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');

  const assessment = await prisma.familyAssessment.findFirst({
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
      householdMembers: true,
    },
  });

  if (!assessment) throw new ApiError(404, 'Family assessment not found');
  return toFamilyAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════
export const updateFamilyAssessment = async (
  patientId: string,
  assessmentId: string,
  data: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.familyAssessment.findFirst({
    where: { id: aid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Family assessment not found');

  const updateData: any = {
    ...pickWritable(data),
    updatedBy: adm,
  };

  if (Array.isArray(data.householdMembers)) {
    const members = pickHouseholdRows(data);
    updateData.householdMembers = { deleteMany: {}, create: members };
  }

  const updated = await prisma.familyAssessment.update({
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
      householdMembers: true,
    },
  });

  return toFamilyAssessmentDto(updated);
};

// ═════════════════════════════════════════════════════════════
// SOFT DELETE
// ═════════════════════════════════════════════════════════════
export const deleteFamilyAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.familyAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Family assessment not found');
  if (existing.deletedAt) {
    throw new ApiError(400, 'Assessment is already deleted');
  }

  const updated = await prisma.familyAssessment.update({
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
export const restoreFamilyAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prismaBase.familyAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Family assessment not found');
  if (!existing.deletedAt) {
    throw new ApiError(400, 'Assessment is not deleted');
  }

  await prisma.familyAssessment.update({
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
export const getDeletedFamilyAssessments = async (
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prismaBase.familyAssessment.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        deletedByAdmin: { select: { id: true, name: true } },
      },
    }),
    prismaBase.familyAssessment.count({
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
  createFamilyAssessment,
  getFamilyAssessments,
  getAllFamilyAssessments,
  getFamilyAssessmentById,
  updateFamilyAssessment,
  deleteFamilyAssessment,
  restoreFamilyAssessment,
  getDeletedFamilyAssessments,
};