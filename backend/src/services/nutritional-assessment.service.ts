import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';
// ─────────────────────────────────────────────────────────────
// DTO mapper
// ─────────────────────────────────────────────────────────────
const toNutritionalAssessmentDto = (a: any) => ({
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

  weightKg: a.weightKg,
  heightCm: a.heightCm,
  bmi: a.bmi,
  muacCm: a.muacCm,
  recentWeightLossKg: a.recentWeightLossKg,
  weightLossPeriod: a.weightLossPeriod,
  nutritionalStatusClassification: a.nutritionalStatusClassification,

  weightSixMonthsAgoKg: a.weightSixMonthsAgoKg,
  weightThreeMonthsAgoKg: a.weightThreeMonthsAgoKg,
  currentWeightKg: a.currentWeightKg,
  percentageWeightLoss: a.percentageWeightLoss,
  significantWeightLoss: a.significantWeightLoss,

  currentAppetite: a.currentAppetite,
  appetiteTrend: a.appetiteTrend,
  appetiteCauses: a.appetiteCauses,
  appetiteCauseOther: a.appetiteCauseOther,

  mealsPerDay: a.mealsPerDay,
  oralIntake: a.oralIntake,
  fluidIntake: a.fluidIntake,
  specialDiet: a.specialDiet,
  specialDietSpecify: a.specialDietSpecify,

  feedingMethod: a.feedingMethod,
  feedingMethodOther: a.feedingMethodOther,
  feedingAssistanceRequired: a.feedingAssistanceRequired,
  difficultySwallowing: a.difficultySwallowing,
  difficultySwallowingDetails: a.difficultySwallowingDetails,

  nauseaSeverity: a.nauseaSeverity,
  vomitingSeverity: a.vomitingSeverity,
  constipationSeverity: a.constipationSeverity,
  diarrheaSeverity: a.diarrheaSeverity,
  abdominalPainSeverity: a.abdominalPainSeverity,
  bloatingSeverity: a.bloatingSeverity,
  mouthSoresSeverity: a.mouthSoresSeverity,

  energyLevel: a.energyLevel,
  mealPreparation: a.mealPreparation,
  feedingAbility: a.feedingAbility,

  riskFactors: a.riskFactors,
  overallNutritionalRisk: a.overallNutritionalRisk,

  adequateFoodAccess: a.adequateFoodAccess,
  financialBarriersToNutrition: a.financialBarriersToNutrition,
  requiresNutritionalAssistance: a.requiresNutritionalAssistance,

  diagnoses: a.diagnoses,
  diagnosisOther: a.diagnosisOther,

  nutritionalGoals: a.nutritionalGoals,
  interventions: a.interventions,
  interventionOther: a.interventionOther,

  monitoringPlans: a.monitoringPlans,
  monitoringOther: a.monitoringOther,

  assessmentOutcome: a.assessmentOutcome,
  finalRecommendations: a.finalRecommendations,

  dietaryRecall: a.dietaryRecall ?? [],
  labResults: a.labResults ?? [],

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
  'weightKg', 'heightCm', 'bmi', 'muacCm',
  'recentWeightLossKg', 'weightLossPeriod',
  'nutritionalStatusClassification',
  'weightSixMonthsAgoKg', 'weightThreeMonthsAgoKg',
  'currentWeightKg', 'percentageWeightLoss', 'significantWeightLoss',
  'currentAppetite', 'appetiteTrend', 'appetiteCauses', 'appetiteCauseOther',
  'mealsPerDay', 'oralIntake', 'fluidIntake',
  'specialDiet', 'specialDietSpecify',
  'feedingMethod', 'feedingMethodOther', 'feedingAssistanceRequired',
  'difficultySwallowing', 'difficultySwallowingDetails',
  'nauseaSeverity', 'vomitingSeverity', 'constipationSeverity',
  'diarrheaSeverity', 'abdominalPainSeverity',
  'bloatingSeverity', 'mouthSoresSeverity',
  'energyLevel', 'mealPreparation', 'feedingAbility',
  'riskFactors', 'overallNutritionalRisk',
  'adequateFoodAccess', 'financialBarriersToNutrition',
  'requiresNutritionalAssistance',
  'diagnoses', 'diagnosisOther',
  'nutritionalGoals', 'interventions', 'interventionOther',
  'monitoringPlans', 'monitoringOther',
  'assessmentOutcome', 'finalRecommendations',
] as const;

const pickWritable = (data: any) => {
  const out: any = {};
  for (const key of WRITABLE_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
};

const pickDietaryRecallRows = (data: any) => {
  if (!Array.isArray(data.dietaryRecall)) return [];
  return data.dietaryRecall.map((r: any) => ({
    mealType: r.mealType,
    contents: r.contents ?? '',
  }));
};

const pickLabRows = (data: any) => {
  if (!Array.isArray(data.labResults)) return [];
  return data.labResults.map((r: any) => ({
    test: r.test,
    testOther: r.testOther ?? '',
    result: r.result ?? '',
  }));
};

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createNutritionalAssessment = async (
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

  const dietaryRows = pickDietaryRecallRows(data);
  const labRows = pickLabRows(data);

  const assessment = await prisma.nutritionalAssessment.create({
    data: {
      patientId: pid,
      createdBy: sid,
      ...pickWritable(data),
      ...(dietaryRows.length > 0
        ? { dietaryRecall: { create: dietaryRows } }
        : {}),
      ...(labRows.length > 0 ? { labResults: { create: labRows } } : {}),
    },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true,
          sex: true, hospitalPatientId: true,
        },
      },
      createdByStaff: { select: { id: true, name: true } },
      dietaryRecall: true,
      labResults: true,
    },
  });

  return toNutritionalAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getNutritionalAssessments = async (
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
    prisma.nutritionalAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    prisma.nutritionalAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      bmi: a.bmi,
      nutritionalStatusClassification: a.nutritionalStatusClassification,
      overallNutritionalRisk: a.overallNutritionalRisk,
      currentAppetite: a.currentAppetite,
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
export const getAllNutritionalAssessments = async (
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
    client.nutritionalAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    client.nutritionalAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      bmi: a.bmi,
      nutritionalStatusClassification: a.nutritionalStatusClassification,
      overallNutritionalRisk: a.overallNutritionalRisk,
      currentAppetite: a.currentAppetite,
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
export const getNutritionalAssessmentById = async (
  patientId: string,
  assessmentId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');

  const assessment = await prisma.nutritionalAssessment.findFirst({
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
      dietaryRecall: true,
      labResults: true,
    },
  });

  if (!assessment) throw new ApiError(404, 'Nutritional assessment not found');
  return toNutritionalAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════
export const updateNutritionalAssessment = async (
  patientId: string,
  assessmentId: string,
  data: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.nutritionalAssessment.findFirst({
    where: { id: aid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Nutritional assessment not found');

  const updateData: any = {
    ...pickWritable(data),
    updatedBy: adm,
  };

  if (Array.isArray(data.dietaryRecall)) {
    const rows = pickDietaryRecallRows(data);
    updateData.dietaryRecall = { deleteMany: {}, create: rows };
  }

  if (Array.isArray(data.labResults)) {
    const rows = pickLabRows(data);
    updateData.labResults = { deleteMany: {}, create: rows };
  }

  const updated = await prisma.nutritionalAssessment.update({
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
      dietaryRecall: true,
      labResults: true,
    },
  });

  return toNutritionalAssessmentDto(updated);
};

// ═════════════════════════════════════════════════════════════
// SOFT DELETE
// ═════════════════════════════════════════════════════════════
export const deleteNutritionalAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.nutritionalAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Nutritional assessment not found');
  if (existing.deletedAt) {
    throw new ApiError(400, 'Assessment is already deleted');
  }

  const updated = await prisma.nutritionalAssessment.update({
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
export const restoreNutritionalAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prismaBase.nutritionalAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Nutritional assessment not found');
  if (!existing.deletedAt) {
    throw new ApiError(400, 'Assessment is not deleted');
  }

  await prisma.nutritionalAssessment.update({
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
export const getDeletedNutritionalAssessments = async (
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prismaBase.nutritionalAssessment.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        deletedByAdmin: { select: { id: true, name: true } },
      },
    }),
    prismaBase.nutritionalAssessment.count({
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
  createNutritionalAssessment,
  getNutritionalAssessments,
  getAllNutritionalAssessments,
  getNutritionalAssessmentById,
  updateNutritionalAssessment,
  deleteNutritionalAssessment,
  restoreNutritionalAssessment,
  getDeletedNutritionalAssessments,
};