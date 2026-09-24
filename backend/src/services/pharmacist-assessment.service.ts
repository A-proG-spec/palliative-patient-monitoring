import { PrismaClient } from '@prisma/client';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';


const prismaBase = new PrismaClient();
export const prisma = prismaBase;
// ─────────────────────────────────────────────────────────────
// DTO mapper
// ─────────────────────────────────────────────────────────────
const toPharmacistAssessmentDto = (a: any) => ({
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

  // Header
  assessmentType: a.assessmentType,
  weightKg: a.weightKg,
  allergies: a.allergies,
  wardUnit: a.wardUnit,

  // Medication history
  otcHerbalUsed: a.otcHerbalUsed,
  otcHerbalDetails: a.otcHerbalDetails,
  medicationHistoryAdherence: a.medicationHistoryAdherence,
  hasAdrHistory: a.hasAdrHistory,
  adrHistoryDetails: a.adrHistoryDetails,

  // Pain management
  analgesicNonOpioids: a.analgesicNonOpioids,
  analgesicWeakOpioids: a.analgesicWeakOpioids,
  analgesicStrongOpioids: a.analgesicStrongOpioids,
  analgesicAdjuvants: a.analgesicAdjuvants,
  analgesicOtherDetails: a.analgesicOtherDetails,
  painControl: a.painControl,
  breakthroughPain: a.breakthroughPain,
  opioidSideEffects: a.opioidSideEffects,

  // Medication safety
  drugDrugInteractions: a.drugDrugInteractions,
  drugDrugInteractionDetails: a.drugDrugInteractionDetails,
  drugDiseaseInteractions: a.drugDiseaseInteractions,
  drugDiseaseInteractionDetails: a.drugDiseaseInteractionDetails,
  highRiskMedications: a.highRiskMedications,

  // Renal & hepatic
  renalFunction: a.renalFunction,
  creatinine: a.creatinine,
  hepaticFunction: a.hepaticFunction,
  lfts: a.lfts,

  // Symptom-related review
  symptomMedicationEffectiveness: a.symptomMedicationEffectiveness,

  // ADR
  suspectedAdr: a.suspectedAdr,
  suspectedAdrDrug: a.suspectedAdrDrug,
  suspectedAdrReaction: a.suspectedAdrReaction,
  adrSeverity: a.adrSeverity,
  adrManagement: a.adrManagement,

  // Constipation
  bowelFunction: a.bowelFunction,
  laxativeUse: a.laxativeUse,
  laxativeDetails: a.laxativeDetails,

  // Dose adjustment
  doseAdjustmentRequired: a.doseAdjustmentRequired,
  doseAdjustmentReasons: a.doseAdjustmentReasons,

  // Counselling
  patientUnderstanding: a.patientUnderstanding,
  counselingTopics: a.counselingTopics,

  // Plan
  currentIssuesIdentified: a.currentIssuesIdentified,
  medicationPlanActions: a.medicationPlanActions,
  medicationPlanOther: a.medicationPlanOther,

  // Access & supply
  medicationAvailability: a.medicationAvailability,
  financialBarriers: a.financialBarriers,
  pharmacyIntervention: a.pharmacyIntervention,

  // Summary
  pharmacistSummary: a.pharmacistSummary,
  summaryFlags: a.summaryFlags,
  finalRecommendations: a.finalRecommendations,
  clinicalPharmacistName: a.clinicalPharmacistName,

  // Children
  currentMedications: a.currentMedications ?? [],

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

// ─────────────────────────────────────────────────────────────
// Whitelist of body fields that can be set/updated
// ─────────────────────────────────────────────────────────────
const WRITABLE_FIELDS = [
  // Header
  'assessmentType', 'weightKg', 'allergies', 'wardUnit',
  // Medication history
  'otcHerbalUsed', 'otcHerbalDetails', 'medicationHistoryAdherence',
  'hasAdrHistory', 'adrHistoryDetails',
  // Pain management
  'analgesicNonOpioids', 'analgesicWeakOpioids', 'analgesicStrongOpioids',
  'analgesicAdjuvants', 'analgesicOtherDetails',
  'painControl', 'breakthroughPain', 'opioidSideEffects',
  // Safety
  'drugDrugInteractions', 'drugDrugInteractionDetails',
  'drugDiseaseInteractions', 'drugDiseaseInteractionDetails',
  'highRiskMedications',
  // Renal / hepatic
  'renalFunction', 'creatinine', 'hepaticFunction', 'lfts',
  // Symptom effectiveness
  'symptomMedicationEffectiveness',
  // ADR
  'suspectedAdr', 'suspectedAdrDrug', 'suspectedAdrReaction',
  'adrSeverity', 'adrManagement',
  // Constipation
  'bowelFunction', 'laxativeUse', 'laxativeDetails',
  // Dose adjustment
  'doseAdjustmentRequired', 'doseAdjustmentReasons',
  // Counselling
  'patientUnderstanding', 'counselingTopics',
  // Plan
  'currentIssuesIdentified', 'medicationPlanActions', 'medicationPlanOther',
  // Access
  'medicationAvailability', 'financialBarriers', 'pharmacyIntervention',
  // Summary
  'pharmacistSummary', 'summaryFlags', 'finalRecommendations',
  'clinicalPharmacistName',
] as const;

const pickWritable = (data: any) => {
  const out: any = {};
  for (const key of WRITABLE_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
};

const pickMedicationRows = (data: any) => {
  if (!Array.isArray(data.currentMedications)) return [];
  return data.currentMedications.map((m: any) => ({
    name: m.name ?? '',
    dose: m.dose ?? '',
    route: m.route ?? '',
    frequency: m.frequency ?? '',
    indication: m.indication ?? '',
  }));
};

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createPharmacistAssessment = async (
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

  const medications = pickMedicationRows(data);

  const assessment = await prisma.clinicalPharmacistAssessment.create({
    data: {
      patientId: pid,
      createdBy: sid,
      ...pickWritable(data),
      ...(medications.length > 0
        ? {
            currentMedications: {
              create: medications,
            },
          }
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
      currentMedications: true,
    },
  });

  return toPharmacistAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// LIST (per patient, active only)
// ═════════════════════════════════════════════════════════════
export const getPharmacistAssessments = async (
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
    prisma.clinicalPharmacistAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    prisma.clinicalPharmacistAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      painControl: a.painControl,
      pharmacistSummary: a.pharmacistSummary,
      summaryFlags: a.summaryFlags,
      finalRecommendations: a.finalRecommendations,
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
// LIST ALL (active + deleted, admin view)
// ═════════════════════════════════════════════════════════════
export const getAllPharmacistAssessments = async (
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
    client.clinicalPharmacistAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    client.clinicalPharmacistAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      painControl: a.painControl,
      pharmacistSummary: a.pharmacistSummary,
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
export const getPharmacistAssessmentById = async (
  patientId: string,
  assessmentId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');

  const assessment = await prisma.clinicalPharmacistAssessment.findFirst({
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
      currentMedications: true,
    },
  });

  if (!assessment) throw new ApiError(404, 'Pharmacist assessment not found');
  return toPharmacistAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// UPDATE — admin only
// ═════════════════════════════════════════════════════════════
export const updatePharmacistAssessment = async (
  patientId: string,
  assessmentId: string,
  data: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.clinicalPharmacistAssessment.findFirst({
    where: { id: aid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Pharmacist assessment not found');

  const updateData: any = {
    ...pickWritable(data),
    updatedBy: adm,
  };

  // Full replacement of child rows when provided
  if (Array.isArray(data.currentMedications)) {
    const medications = pickMedicationRows(data);
    updateData.currentMedications = {
      deleteMany: {},
      create: medications,
    };
  }

  const updated = await prisma.clinicalPharmacistAssessment.update({
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
      currentMedications: true,
    },
  });

  return toPharmacistAssessmentDto(updated);
};

// ═════════════════════════════════════════════════════════════
// SOFT DELETE — admin only
// ═════════════════════════════════════════════════════════════
export const deletePharmacistAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.clinicalPharmacistAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Pharmacist assessment not found');
  if (existing.deletedAt) {
    throw new ApiError(400, 'Assessment is already deleted');
  }

  const updated = await prisma.clinicalPharmacistAssessment.update({
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
// RESTORE — admin only
// ═════════════════════════════════════════════════════════════
export const restorePharmacistAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prismaBase.clinicalPharmacistAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Pharmacist assessment not found');
  if (!existing.deletedAt) {
    throw new ApiError(400, 'Assessment is not deleted');
  }

  await prisma.clinicalPharmacistAssessment.update({
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
// LIST DELETED — admin only, global
// ═════════════════════════════════════════════════════════════
export const getDeletedPharmacistAssessments = async (
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prismaBase.clinicalPharmacistAssessment.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        deletedByAdmin: { select: { id: true, name: true } },
      },
    }),
    prismaBase.clinicalPharmacistAssessment.count({
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
  createPharmacistAssessment,
  getPharmacistAssessments,
  getAllPharmacistAssessments,
  getPharmacistAssessmentById,
  updatePharmacistAssessment,
  deletePharmacistAssessment,
  restorePharmacistAssessment,
  getDeletedPharmacistAssessments,
};