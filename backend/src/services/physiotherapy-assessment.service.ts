import { PrismaClient } from '@prisma/client';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';



const prismaBase = new PrismaClient();
export const prisma = prismaBase;
// ─────────────────────────────────────────────────────────────
// DTO mapper
// ─────────────────────────────────────────────────────────────
const toPhysiotherapyAssessmentDto = (a: any) => ({
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

  // Medical overview
  comorbidities: a.comorbidities,
  comorbidityOther: a.comorbidityOther,
  generalCondition: a.generalCondition,

  // Pain & symptoms
  painLevel: a.painLevel,
  painTypes: a.painTypes,
  painTypeOther: a.painTypeOther,
  symptoms: a.symptoms,

  // Functional mobility
  mobilityStatus: a.mobilityStatus,
  transferAbility: a.transferAbility,
  walkingAbility: a.walkingAbility,
  assistiveDevices: a.assistiveDevices,
  assistiveDeviceOther: a.assistiveDeviceOther,

  // Musculoskeletal
  upperLimbStrength: a.upperLimbStrength,
  lowerLimbStrength: a.lowerLimbStrength,
  rangeOfMotion: a.rangeOfMotion,
  jointPainOrStiffness: a.jointPainOrStiffness,
  jointPainLocation: a.jointPainLocation,

  // Neurological
  consciousness: a.consciousness,
  coordination: a.coordination,
  sensoryDeficit: a.sensoryDeficit,
  balance: a.balance,

  // Respiratory
  breathingPattern: a.breathingPattern,
  breathlessnessLevel: a.breathlessnessLevel,
  chestExpansion: a.chestExpansion,
  respiratoryNeeds: a.respiratoryNeeds,

  // Pressure injury
  pressureRisk: a.pressureRisk,
  pressureAreas: a.pressureAreas,
  pressureAreaOther: a.pressureAreaOther,
  pressurePreventions: a.pressurePreventions,

  // Fall risk
  fallHistory: a.fallHistory,
  fallRiskLevel: a.fallRiskLevel,
  fallContributors: a.fallContributors,

  // Diagnosis + plan
  diagnosis: a.diagnosis,
  goals: a.goals,
  interventions: a.interventions,
  frequency: a.frequency,
  equipment: a.equipment,
  caregiverTrainings: a.caregiverTrainings,

  // Summary
  outcome: a.outcome,
  finalRecommendations: a.finalRecommendations,

  // Children
  adl: a.adl ?? [],

  // Audit
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
  'comorbidities', 'comorbidityOther', 'generalCondition',
  'painLevel', 'painTypes', 'painTypeOther', 'symptoms',
  'mobilityStatus', 'transferAbility', 'walkingAbility',
  'assistiveDevices', 'assistiveDeviceOther',
  'upperLimbStrength', 'lowerLimbStrength',
  'rangeOfMotion', 'jointPainOrStiffness', 'jointPainLocation',
  'consciousness', 'coordination', 'sensoryDeficit', 'balance',
  'breathingPattern', 'breathlessnessLevel', 'chestExpansion',
  'respiratoryNeeds',
  'pressureRisk', 'pressureAreas', 'pressureAreaOther',
  'pressurePreventions',
  'fallHistory', 'fallRiskLevel', 'fallContributors',
  'diagnosis', 'goals', 'interventions', 'frequency',
  'equipment', 'caregiverTrainings',
  'outcome', 'finalRecommendations',
] as const;

const pickWritable = (data: any) => {
  const out: any = {};
  for (const key of WRITABLE_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
};

const pickAdlRows = (data: any) => {
  if (!Array.isArray(data.adl)) return [];
  return data.adl.map((r: any) => ({
    activity: r.activity,
    level: r.level ?? null,
  }));
};

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createPhysiotherapyAssessment = async (
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

  const adlRows = pickAdlRows(data);

  const assessment = await prisma.physiotherapyAssessment.create({
    data: {
      patientId: pid,
      createdBy: sid,
      ...pickWritable(data),
      ...(adlRows.length > 0 ? { adl: { create: adlRows } } : {}),
    },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true,
          sex: true, hospitalPatientId: true,
        },
      },
      createdByStaff: { select: { id: true, name: true } },
      adl: true,
    },
  });

  return toPhysiotherapyAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getPhysiotherapyAssessments = async (
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
    prisma.physiotherapyAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    prisma.physiotherapyAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      generalCondition: a.generalCondition,
      mobilityStatus: a.mobilityStatus,
      fallRiskLevel: a.fallRiskLevel,
      diagnosis: a.diagnosis,
      outcome: a.outcome,
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
// LIST ALL (active + deleted)
// ═════════════════════════════════════════════════════════════
export const getAllPhysiotherapyAssessments = async (
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
    client.physiotherapyAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    client.physiotherapyAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      generalCondition: a.generalCondition,
      mobilityStatus: a.mobilityStatus,
      fallRiskLevel: a.fallRiskLevel,
      diagnosis: a.diagnosis,
      outcome: a.outcome,
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
export const getPhysiotherapyAssessmentById = async (
  patientId: string,
  assessmentId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');

  const assessment = await prisma.physiotherapyAssessment.findFirst({
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
      adl: true,
    },
  });

  if (!assessment) throw new ApiError(404, 'Physiotherapy assessment not found');
  return toPhysiotherapyAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════
export const updatePhysiotherapyAssessment = async (
  patientId: string,
  assessmentId: string,
  data: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.physiotherapyAssessment.findFirst({
    where: { id: aid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Physiotherapy assessment not found');

  const updateData: any = {
    ...pickWritable(data),
    updatedBy: adm,
  };

  if (Array.isArray(data.adl)) {
    const adlRows = pickAdlRows(data);
    updateData.adl = { deleteMany: {}, create: adlRows };
  }

  const updated = await prisma.physiotherapyAssessment.update({
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
      adl: true,
    },
  });

  return toPhysiotherapyAssessmentDto(updated);
};

// ═════════════════════════════════════════════════════════════
// SOFT DELETE
// ═════════════════════════════════════════════════════════════
export const deletePhysiotherapyAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.physiotherapyAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Physiotherapy assessment not found');
  if (existing.deletedAt) {
    throw new ApiError(400, 'Assessment is already deleted');
  }

  const updated = await prisma.physiotherapyAssessment.update({
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
export const restorePhysiotherapyAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prismaBase.physiotherapyAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Physiotherapy assessment not found');
  if (!existing.deletedAt) {
    throw new ApiError(400, 'Assessment is not deleted');
  }

  await prisma.physiotherapyAssessment.update({
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
// LIST DELETED — admin only
// ═════════════════════════════════════════════════════════════
export const getDeletedPhysiotherapyAssessments = async (
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prismaBase.physiotherapyAssessment.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        deletedByAdmin: { select: { id: true, name: true } },
      },
    }),
    prismaBase.physiotherapyAssessment.count({
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
  createPhysiotherapyAssessment,
  getPhysiotherapyAssessments,
  getAllPhysiotherapyAssessments,
  getPhysiotherapyAssessmentById,
  updatePhysiotherapyAssessment,
  deletePhysiotherapyAssessment,
  restorePhysiotherapyAssessment,
  getDeletedPhysiotherapyAssessments,
};