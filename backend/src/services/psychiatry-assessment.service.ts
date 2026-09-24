import { PrismaClient } from '@prisma/client';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';



const prismaBase = new PrismaClient();
export const prisma = prismaBase;
// ─────────────────────────────────────────────────────────────
// Safety constants — high risk levels that require a documented
// reason when deleting, and that trigger a notification on create.
// ─────────────────────────────────────────────────────────────
const HIGH_SUICIDE_RISK = ['High'] as const;

// ─────────────────────────────────────────────────────────────
// DTO mapper
// ─────────────────────────────────────────────────────────────
const toPsychiatryAssessmentDto = (a: any) => ({
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

  reasonForReferral: a.reasonForReferral,
  currentSymptoms: a.currentSymptoms,
  symptomOther: a.symptomOther,
  onsetAndDuration: a.onsetAndDuration,
  severity: a.severity,

  appearanceBehavior: a.appearanceBehavior,
  speech: a.speech,
  mood: a.mood,
  affect: a.affect,
  thoughtProcess: a.thoughtProcess,
  thoughtContent: a.thoughtContent,
  perception: a.perception,
  cognition: a.cognition,
  insightJudgment: a.insightJudgment,

  suicidalIdeation: a.suicidalIdeation,
  suicideRiskLevel: a.suicideRiskLevel,
  protectiveFactors: a.protectiveFactors,

  organicCauses: a.organicCauses,
  medicationsAffectingMentalState: a.medicationsAffectingMentalState,

  sleepPattern: a.sleepPattern,
  appetite: a.appetite,

  dailyFunctioning: a.dailyFunctioning,
  socialWithdrawal: a.socialWithdrawal,

  diagnoses: a.diagnoses,
  diagnosisOther: a.diagnosisOther,

  immediateInterventions: a.immediateInterventions,
  pharmacologicalPlan: a.pharmacologicalPlan,
  nonPharmacologicalPlan: a.nonPharmacologicalPlan,
  monitoringPlan: a.monitoringPlan,

  familyDistressLevel: a.familyDistressLevel,
  caregiverBurnout: a.caregiverBurnout,
  familyCounselingNeeded: a.familyCounselingNeeded,

  assessmentOutcome: a.assessmentOutcome,
  finalRecommendations: a.finalRecommendations,

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
  'reasonForReferral', 'currentSymptoms', 'symptomOther',
  'onsetAndDuration', 'severity',
  'appearanceBehavior', 'speech', 'mood', 'affect',
  'thoughtProcess', 'thoughtContent', 'perception', 'cognition',
  'insightJudgment',
  'suicidalIdeation', 'suicideRiskLevel', 'protectiveFactors',
  'organicCauses', 'medicationsAffectingMentalState',
  'sleepPattern', 'appetite',
  'dailyFunctioning', 'socialWithdrawal',
  'diagnoses', 'diagnosisOther',
  'immediateInterventions', 'pharmacologicalPlan',
  'nonPharmacologicalPlan', 'monitoringPlan',
  'familyDistressLevel', 'caregiverBurnout', 'familyCounselingNeeded',
  'assessmentOutcome', 'finalRecommendations',
] as const;

const pickWritable = (data: any) => {
  const out: any = {};
  for (const key of WRITABLE_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
};

// ─────────────────────────────────────────────────────────────
// Safety guard
// ─────────────────────────────────────────────────────────────
const assertSafeToDelete = (
  assessment: { suicideRiskLevel: string | null },
  reason?: string,
) => {
  if (
    assessment.suicideRiskLevel &&
    (HIGH_SUICIDE_RISK as readonly string[]).includes(
      assessment.suicideRiskLevel,
    ) &&
    !reason?.trim()
  ) {
    throw new ApiError(
      400,
      'A documented reason is required to delete a psychiatry assessment with High suicide risk.',
    );
  }
};

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createPsychiatryAssessment = async (
  patientId: string,
  data: any,
  staffId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(staffId, 'staff id');

  const [patient, staff] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: pid },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.staff.findUnique({ where: { id: sid }, select: { id: true } }),
  ]);
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const assessment = await prisma.$transaction(async (tx) => {
    const created = await tx.psychiatryAssessment.create({
      data: {
        patientId: pid,
        createdBy: sid,
        ...pickWritable(data),
      },
      include: {
        patient: {
          select: {
            id: true, firstName: true, lastName: true, age: true,
            sex: true, hospitalPatientId: true,
          },
        },
        createdByStaff: { select: { id: true, name: true } },
      },
    });

    // ── Safety escalation ──
    if (
      created.suicideRiskLevel &&
      (HIGH_SUICIDE_RISK as readonly string[]).includes(
        created.suicideRiskLevel,
      )
    ) {
      await tx.notification.create({
        data: {
          type: 'CloseCase', // reuse existing notification type
          message: `⚠️ HIGH suicide risk recorded for ${patient.firstName} ${patient.lastName}`,
          data: {
            patientId: pid,
            patientName: `${patient.firstName} ${patient.lastName}`,
            psychiatryAssessmentId: created.id,
            suicideRiskLevel: created.suicideRiskLevel,
          },
          read: false,
        },
      });
    }

    return created;
  });

  return toPsychiatryAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// LIST (per patient)
// ═════════════════════════════════════════════════════════════
export const getPsychiatryAssessments = async (
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
    prisma.psychiatryAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    prisma.psychiatryAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      severity: a.severity,
      suicidalIdeation: a.suicidalIdeation,
      suicideRiskLevel: a.suicideRiskLevel,
      diagnoses: a.diagnoses,
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
export const getAllPsychiatryAssessments = async (
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
    client.psychiatryAssessment.findMany({
      where: { patientId: pid },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdByStaff: { select: { id: true, name: true } },
      },
    }),
    client.psychiatryAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentType: a.assessmentType,
      severity: a.severity,
      suicidalIdeation: a.suicidalIdeation,
      suicideRiskLevel: a.suicideRiskLevel,
      diagnoses: a.diagnoses,
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
export const getPsychiatryAssessmentById = async (
  patientId: string,
  assessmentId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');

  const assessment = await prisma.psychiatryAssessment.findFirst({
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
    },
  });

  if (!assessment) throw new ApiError(404, 'Psychiatry assessment not found');
  return toPsychiatryAssessmentDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════════════════════
export const updatePsychiatryAssessment = async (
  patientId: string,
  assessmentId: string,
  data: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.psychiatryAssessment.findFirst({
    where: { id: aid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Psychiatry assessment not found');

  const updated = await prisma.psychiatryAssessment.update({
    where: { id: aid },
    data: {
      ...pickWritable(data),
      updatedBy: adm,
    },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true,
          sex: true, hospitalPatientId: true,
        },
      },
      createdByStaff: { select: { id: true, name: true } },
      updatedByAdmin: { select: { id: true, name: true } },
    },
  });

  return toPsychiatryAssessmentDto(updated);
};

// ═════════════════════════════════════════════════════════════
// SOFT DELETE — with safety guard
// ═════════════════════════════════════════════════════════════
export const deletePsychiatryAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.psychiatryAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Psychiatry assessment not found');
  if (existing.deletedAt) {
    throw new ApiError(400, 'Assessment is already deleted');
  }

  // 🚨 Safety gate — high-risk assessments require a reason
  assertSafeToDelete(existing, reason);

  const updated = await prisma.psychiatryAssessment.update({
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
export const restorePsychiatryAssessment = async (
  patientId: string,
  assessmentId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(assessmentId, 'assessment id');
  const adm = toId(adminId, 'admin id');

  const existing = await prismaBase.psychiatryAssessment.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Psychiatry assessment not found');
  if (!existing.deletedAt) {
    throw new ApiError(400, 'Assessment is not deleted');
  }

  await prisma.psychiatryAssessment.update({
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
export const getDeletedPsychiatryAssessments = async (
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prismaBase.psychiatryAssessment.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        deletedByAdmin: { select: { id: true, name: true } },
      },
    }),
    prismaBase.psychiatryAssessment.count({
      where: { deletedAt: { not: null } },
    }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      assessmentType: a.assessmentType,
      suicideRiskLevel: a.suicideRiskLevel,
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
  createPsychiatryAssessment,
  getPsychiatryAssessments,
  getAllPsychiatryAssessments,
  getPsychiatryAssessmentById,
  updatePsychiatryAssessment,
  deletePsychiatryAssessment,
  restorePsychiatryAssessment,
  getDeletedPsychiatryAssessments,
};