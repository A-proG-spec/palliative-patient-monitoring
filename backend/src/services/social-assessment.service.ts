import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';
// ─────────────────────────────────────────────────────────────
// DTO mapper
// ─────────────────────────────────────────────────────────────
const toSocialAssessmentDto = (a: any) => ({
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
  livingArrangement: a.livingArrangement,
  livingArrangementOther: a.livingArrangementOther,

  caregiverAvailability: a.caregiverAvailability,
  caregiverHealth: a.caregiverHealth,
  caregiverUnderstanding: a.caregiverUnderstanding,
  caregiverStress: a.caregiverStress,

  familySupport: a.familySupport,
  communitySupport: a.communitySupport,
  contactFrequency: a.contactFrequency,
  isolationRisk: a.isolationRisk,

  incomeSources: a.incomeSources,
  incomeSourceOther: a.incomeSourceOther,
  monthlyHouseholdIncome: a.monthlyHouseholdIncome,
  financialChallenges: a.financialChallenges,
  financialChallengeOther: a.financialChallengeOther,
  financialRiskLevel: a.financialRiskLevel,

  residenceType: a.residenceType,
  residenceTypeOther: a.residenceTypeOther,
  homeEnvironment: a.homeEnvironment,
  utilitiesAccess: a.utilitiesAccess,
  homeBasedCareSuitability: a.homeBasedCareSuitability,

  transportAccess: a.transportAccess,
  distanceToHealthFacilityKm: a.distanceToHealthFacilityKm,
  transportChallenges: a.transportChallenges,
  transportChallengeOther: a.transportChallengeOther,

  employmentStatus: a.employmentStatus,
  educationLevel: a.educationLevel,

  religiousAffiliation: a.religiousAffiliation,
  religiousAffiliationOther: a.religiousAffiliationOther,
  spiritualSupportAvailable: a.spiritualSupportAvailable,
  culturalFactorsAffectingCare: a.culturalFactorsAffectingCare,

  hasLegalRepresentative: a.hasLegalRepresentative,
  advanceDirectivesAvailable: a.advanceDirectivesAvailable,
  legalConcerns: a.legalConcerns,
  legalConcernOther: a.legalConcernOther,

  familyPreparedForPrognosis: a.familyPreparedForPrognosis,
  anticipatoryGrief: a.anticipatoryGrief,
  bereavementRisk: a.bereavementRisk,
  familyRequiresSupport: a.familyRequiresSupport,

  majorSocialIssues: a.majorSocialIssues,
  majorSocialIssueOther: a.majorSocialIssueOther,
  strengthsAndResources: a.strengthsAndResources,
  areasRequiringIntervention: a.areasRequiringIntervention,

  plannedInterventions: a.plannedInterventions,
  plannedInterventionOther: a.plannedInterventionOther,
  followUpPlan: a.followUpPlan,

  assessmentOutcome: a.assessmentOutcome,

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
  'livingArrangement', 'livingArrangementOther',
  'caregiverAvailability', 'caregiverHealth',
  'caregiverUnderstanding', 'caregiverStress',
  'familySupport', 'communitySupport', 'contactFrequency', 'isolationRisk',
  'incomeSources', 'incomeSourceOther', 'monthlyHouseholdIncome',
  'financialChallenges', 'financialChallengeOther', 'financialRiskLevel',
  'residenceType', 'residenceTypeOther', 'homeEnvironment',
  'utilitiesAccess', 'homeBasedCareSuitability',
  'transportAccess', 'distanceToHealthFacilityKm',
  'transportChallenges', 'transportChallengeOther',
  'employmentStatus', 'educationLevel',
  'religiousAffiliation', 'religiousAffiliationOther',
  'spiritualSupportAvailable', 'culturalFactorsAffectingCare',
  'hasLegalRepresentative', 'advanceDirectivesAvailable',
  'legalConcerns', 'legalConcernOther',
  'familyPreparedForPrognosis', 'anticipatoryGrief',
  'bereavementRisk', 'familyRequiresSupport',
  'majorSocialIssues', 'majorSocialIssueOther',
  'strengthsAndResources', 'areasRequiringIntervention',
  'plannedInterventions', 'plannedInterventionOther', 'followUpPlan',
  'assessmentOutcome',
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
    relationship: m.relationship ?? '',
    age: m.age ?? null,
    occupation: m.occupation ?? '',
  }));
};

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createSocialAssessment = async (
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

  const assessment = await prisma.socialAssessment.create({
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

  return toSocialAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getSocialAssessments = async (
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
    prisma.socialAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    prisma.socialAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      livingArrangement: a.livingArrangement,
      isolationRisk: a.isolationRisk,
      financialRiskLevel: a.financialRiskLevel,
      bereavementRisk: a.bereavementRisk,
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
export const getAllSocialAssessments = async (
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
    client.socialAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    client.socialAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      livingArrangement: a.livingArrangement,
      isolationRisk: a.isolationRisk,
      financialRiskLevel: a.financialRiskLevel,
      bereavementRisk: a.bereavementRisk,
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
export const getSocialAssessmentById = async (
  patientId: string,
  assessmentId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');

  const assessment = await prisma.socialAssessment.findFirst({
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

  if (!assessment) throw new ApiError(404, 'Social assessment not found');
  return toSocialAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════
export const updateSocialAssessment = async (
  patientId: string,
  assessmentId: string,
  data: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.socialAssessment.findFirst({
    where: { id: aid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Social assessment not found');

  const updateData: any = {
    ...pickWritable(data),
    updatedBy: adm,
  };

  if (Array.isArray(data.householdMembers)) {
    const members = pickHouseholdRows(data);
    updateData.householdMembers = { deleteMany: {}, create: members };
  }

  const updated = await prisma.socialAssessment.update({
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

  return toSocialAssessmentDto(updated);
};

// ═════════════════════════════════════════════════════════════
// SOFT DELETE
// ═════════════════════════════════════════════════════════════
export const deleteSocialAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.socialAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Social assessment not found');
  if (existing.deletedAt) {
    throw new ApiError(400, 'Assessment is already deleted');
  }

  const updated = await prisma.socialAssessment.update({
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
export const restoreSocialAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prismaBase.socialAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Social assessment not found');
  if (!existing.deletedAt) {
    throw new ApiError(400, 'Assessment is not deleted');
  }

  await prisma.socialAssessment.update({
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
export const getDeletedSocialAssessments = async (
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prismaBase.socialAssessment.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        deletedByAdmin: { select: { id: true, name: true } },
      },
    }),
    prismaBase.socialAssessment.count({
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
  createSocialAssessment,
  getSocialAssessments,
  getAllSocialAssessments,
  getSocialAssessmentById,
  updateSocialAssessment,
  deleteSocialAssessment,
  restoreSocialAssessment,
  getDeletedSocialAssessments,
};