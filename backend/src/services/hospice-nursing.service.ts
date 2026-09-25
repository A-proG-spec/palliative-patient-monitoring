import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';
// ─────────────────────────────────────────────────────────────
// DTO mapper — one place to shape the response
// ─────────────────────────────────────────────────────────────
const toHospiceDto = (a: any) => ({
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

    hospitalAdmissionId: a.hospitalAdmissionId,
    assessmentDate: a.assessmentDate,

    assessedByStaffId: a.assessedByStaffId,
    assessedBy: a.assessedByStaff
        ? {
            id: a.assessedByStaff.id,
            name: a.assessedByStaff.name,
            role: a.assessedByStaff.role,
        }
        : null,

    // General observation
    levelOfConsciousness: a.levelOfConsciousness,
    orientation: a.orientation,
    generalAppearance: a.generalAppearance,

    // Vitals
    bloodPressure: a.bloodPressure,
    pulseRate: a.pulseRate,
    respiratoryRate: a.respiratoryRate,
    temperature: a.temperature,
    oxygenSaturation: a.oxygenSaturation,
    weightKg: a.weightKg,
    heightCm: a.heightCm,

    // Pain
    painPresent: a.painPresent,
    painScore: a.painScore,
    painLocation: a.painLocation,
    painLocationOther: a.painLocationOther,
    painCharacteristics: a.painCharacteristics,
    painReliefMeasures: a.painReliefMeasures,
    painReliefOther: a.painReliefOther,

    // Respiratory
    breathingPattern: a.breathingPattern,
    dyspneaSeverity: a.dyspneaSeverity,
    oxygenTherapy: a.oxygenTherapy,
    oxygenFlowRate: a.oxygenFlowRate,
    cough: a.cough,
    sputumColor: a.sputumColor,
    respiratoryNotes: a.respiratoryNotes,

    // Cardiovascular
    pulseRhythm: a.pulseRhythm,
    peripheralEdema: a.peripheralEdema,
    edemaLocation: a.edemaLocation,
    skinColor: a.skinColor,

    // GI
    appetite: a.appetite,
    nausea: a.nausea,
    vomiting: a.vomiting,
    vomitingFrequency: a.vomitingFrequency,
    bowelFunction: a.bowelFunction,
    lastBowelMovement: a.lastBowelMovement,

    // GU
    urinaryFunction: a.urinaryFunction,
    urineAppearance: a.urineAppearance,

    // Skin
    skinIntegrity: a.skinIntegrity,
    pressureInjuryRisk: a.pressureInjuryRisk,
    pressureUlcerPresent: a.pressureUlcerPresent,
    pressureUlcerLocation: a.pressureUlcerLocation,
    pressureUlcerStage: a.pressureUlcerStage,

    // Mobility + ADL
    mobilityStatus: a.mobilityStatus,
    fallRisk: a.fallRisk,
    assistiveDevices: a.assistiveDevices,
    assistiveDevicesOther: a.assistiveDevicesOther,
    feeding: a.feeding,
    bathing: a.bathing,
    dressing: a.dressing,
    toileting: a.toileting,
    mobility: a.mobility,

    // Psychological
    emotionalStatus: a.emotionalStatus,
    communicationAbility: a.communicationAbility,
    cognitiveStatus: a.cognitiveStatus,

    // Family / caregiver
    primaryCaregiverName: a.primaryCaregiverName,
    primaryCaregiverRelationship: a.primaryCaregiverRelationship,
    primaryCaregiverPhone: a.primaryCaregiverPhone,
    familySupport: a.familySupport,
    caregiverStressLevel: a.caregiverStressLevel,

    // Spiritual
    spiritualSupportRequested: a.spiritualSupportRequested,
    religiousAffiliation: a.religiousAffiliation,
    religiousAffiliationOther: a.religiousAffiliationOther,
    culturalConsiderations: a.culturalConsiderations,

    // Nursing diagnoses + summary
    nursingDiagnoses: a.nursingDiagnoses,
    nursingDiagnosesOther: a.nursingDiagnosesOther,
    nurseSummary: a.nurseSummary,

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
// Whitelist of fields that can be set/updated from a request body
// ─────────────────────────────────────────────────────────────
const WRITABLE_FIELDS = [
    // General observation
    'levelOfConsciousness', 'orientation', 'generalAppearance',
    // Vitals
    'bloodPressure', 'pulseRate', 'respiratoryRate', 'temperature',
    'oxygenSaturation', 'weightKg', 'heightCm',
    // Pain
    'painPresent', 'painScore', 'painLocation', 'painLocationOther',
    'painCharacteristics', 'painReliefMeasures', 'painReliefOther',
    // Respiratory
    'breathingPattern', 'dyspneaSeverity', 'oxygenTherapy', 'oxygenFlowRate',
    'cough', 'sputumColor', 'respiratoryNotes',
    // Cardiovascular
    'pulseRhythm', 'peripheralEdema', 'edemaLocation', 'skinColor',
    // GI
    'appetite', 'nausea', 'vomiting', 'vomitingFrequency',
    'bowelFunction', 'lastBowelMovement',
    // GU
    'urinaryFunction', 'urineAppearance',
    // Skin
    'skinIntegrity', 'pressureInjuryRisk', 'pressureUlcerPresent',
    'pressureUlcerLocation', 'pressureUlcerStage',
    // Mobility + ADL
    'mobilityStatus', 'fallRisk', 'assistiveDevices', 'assistiveDevicesOther',
    'feeding', 'bathing', 'dressing', 'toileting', 'mobility',
    // Psychological
    'emotionalStatus', 'communicationAbility', 'cognitiveStatus',
    // Family / caregiver
    'primaryCaregiverName', 'primaryCaregiverRelationship',
    'primaryCaregiverPhone', 'familySupport', 'caregiverStressLevel',
    // Spiritual
    'spiritualSupportRequested', 'religiousAffiliation',
    'religiousAffiliationOther', 'culturalConsiderations',
    // Nursing
    'nursingDiagnoses', 'nursingDiagnosesOther', 'nurseSummary',
] as const;

const DATE_FIELDS = ['lastBowelMovement', 'assessmentDate'] as const;

const pickWritable = (data: any) => {
    const out: any = {};
    for (const key of WRITABLE_FIELDS) {
        if (data[key] !== undefined) out[key] = data[key];
    }
    for (const key of DATE_FIELDS) {
        if (data[key] !== undefined) {
            out[key] = data[key] ? new Date(data[key]) : null;
        }
    }
    return out;
};

// ═════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════
export const createHospiceNursingAssessment = async (
    patientId: string,
    data: any,
    staffId: string | number,
) => {
    const pid = toId(patientId, 'patient id');
    const sid = toId(staffId, 'staff id');

    const [patient, staff] = await Promise.all([
        prisma.patient.findUnique({
            where: { id: pid },
            select: { id: true },
        }),
        prisma.staff.findUnique({
            where: { id: sid },
            select: { id: true },
        }),
    ]);
    if (!patient) throw new ApiError(404, 'Patient not found');
    if (!staff) throw new ApiError(404, 'Staff member not found');

    // Optional admission link — validate it belongs to the same patient
    let hospitalAdmissionId: number | null = null;
    if (data.hospitalAdmissionId) {
        const aid = toId(data.hospitalAdmissionId, 'admission id');
        const admission = await prisma.hospitalAdmission.findFirst({
            where: { id: aid, patientId: pid },
            select: { id: true },
        });
        if (!admission) {
            throw new ApiError(404, 'Admission not found for this patient');
        }
        hospitalAdmissionId = aid;
    }

    const createData: any = {
        patientId: pid,
        createdBy: sid,
        hospitalAdmissionId,
        ...pickWritable(data),
    };

    if (data.assessedByStaffId) {
        createData.assessedByStaffId = toId(data.assessedByStaffId, 'assessed-by staff id');
    }

    const assessment = await prisma.hospiceNursingAssessment.create({
        data: createData,
        include: {
            patient: {
                select: {
                    id: true, firstName: true, lastName: true, age: true,
                    sex: true, hospitalPatientId: true,
                },
            },
            assessedByStaff: { select: { id: true, name: true, role: true } },
            createdByStaff: { select: { id: true, name: true } },
        },
    });

    return toHospiceDto(assessment);
};

export const getAllHospiceNursingAssessments = async (
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
    client.hospiceNursingAssessment.findMany({
      where: { patientId: pid },
      orderBy: { assessmentDate: 'desc' },
      skip,
      take: limit,
      include: {
        assessedByStaff: { select: { id: true, name: true, role: true } },
      },
    }),
    client.hospiceNursingAssessment.count({ where: { patientId: pid } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      assessmentDate: a.assessmentDate,
      assessedBy: a.assessedByStaff
        ? {
            id: a.assessedByStaff.id,
            name: a.assessedByStaff.name,
            role: a.assessedByStaff.role,
          }
        : null,
      levelOfConsciousness: a.levelOfConsciousness,
      painScore: a.painScore,
      mobilityStatus: a.mobilityStatus,
      emotionalStatus: a.emotionalStatus,
      nurseSummary: a.nurseSummary,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      // Soft-delete metadata
      deletedAt: a.deletedAt ?? null,
      deletionReason: a.deletionReason ?? null,
    })),
    page,
    limit,
    total,
  };
};

// ═════════════════════════════════════════════════════════════
// LIST (per patient, paginated)
// ═════════════════════════════════════════════════════════════
export const getHospiceNursingAssessments = async (
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
        prisma.hospiceNursingAssessment.findMany({
            where: { patientId: pid },
            orderBy: { assessmentDate: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                patientId: true,
                assessmentDate: true,
                assessedByStaffId: true,
                assessedByStaff: { select: { id: true, name: true, role: true } },
                levelOfConsciousness: true,
                painScore: true,
                mobilityStatus: true,
                emotionalStatus: true,
                nurseSummary: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        }),
        prisma.hospiceNursingAssessment.count({ where: { patientId: pid } }),
    ]);

    return {
        items: items.map((a) => ({
            id: a.id,
            patientId: a.patientId,
            assessmentDate: a.assessmentDate,
            assessedBy: a.assessedByStaff
                ? {
                    id: a.assessedByStaff.id,
                    name: a.assessedByStaff.name,
                    role: a.assessedByStaff.role,
                }
                : null,
            levelOfConsciousness: a.levelOfConsciousness,
            painScore: a.painScore,
            mobilityStatus: a.mobilityStatus,
            emotionalStatus: a.emotionalStatus,
            nurseSummary: a.nurseSummary,
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
// GET ONE
// ═════════════════════════════════════════════════════════════
export const getHospiceNursingAssessmentById = async (
    patientId: string,
    assessmentId: string,
) => {
    const pid = toId(patientId, 'patient id');
    const aid = toId(assessmentId, 'assessment id');

    const assessment = await prisma.hospiceNursingAssessment.findFirst({
        where: { id: aid, patientId: pid },
        include: {
            patient: {
                select: {
                    id: true, firstName: true, lastName: true, age: true,
                    sex: true, hospitalPatientId: true,
                },
            },
            assessedByStaff: { select: { id: true, name: true, role: true } },
            createdByStaff: { select: { id: true, name: true } },
            updatedByAdmin: { select: { id: true, name: true } },
        },
    });

    if (!assessment) throw new ApiError(404, 'Hospice nursing assessment not found');

    return toHospiceDto(assessment);
};

// ═════════════════════════════════════════════════════════════
// UPDATE — records auditor via updatedBy
// ═════════════════════════════════════════════════════════════
export const updateHospiceNursingAssessment = async (
    patientId: string,
    assessmentId: string,
    data: any,
    adminId: string | number,
) => {
    const pid = toId(patientId, 'patient id');
    const aid = toId(assessmentId, 'assessment id');
    const adm = toId(adminId, 'admin id');

    const existing = await prisma.hospiceNursingAssessment.findFirst({
        where: { id: aid, patientId: pid },
        select: { id: true },
    });
    if (!existing) throw new ApiError(404, 'Hospice nursing assessment not found');

    const updateData: any = {
        ...pickWritable(data),
        updatedBy: adm,
    };

    // Optional re-assignment of the assessedBy staff
    if (data.assessedByStaffId !== undefined) {
        updateData.assessedByStaffId = data.assessedByStaffId
            ? toId(data.assessedByStaffId, 'assessed-by staff id')
            : null;
    }

    // Optional admission link change
    if (data.hospitalAdmissionId !== undefined) {
        if (data.hospitalAdmissionId === null) {
            updateData.hospitalAdmissionId = null;
        } else {
            const newAid = toId(data.hospitalAdmissionId, 'admission id');
            const admission = await prisma.hospitalAdmission.findFirst({
                where: { id: newAid, patientId: pid },
                select: { id: true },
            });
            if (!admission) {
                throw new ApiError(404, 'Admission not found for this patient');
            }
            updateData.hospitalAdmissionId = newAid;
        }
    }

    const updated = await prisma.hospiceNursingAssessment.update({
        where: { id: aid },
        data: updateData,
        include: {
            patient: {
                select: {
                    id: true, firstName: true, lastName: true, age: true,
                    sex: true, hospitalPatientId: true,
                },
            },
            assessedByStaff: { select: { id: true, name: true, role: true } },
            createdByStaff: { select: { id: true, name: true } },
            updatedByAdmin: { select: { id: true, name: true } },
        },
    });

    return toHospiceDto(updated);
};

// ═════════════════════════════════════════════════════════════
// SOFT DELETE — sets deletedAt / deletedBy / deletionReason
// ═════════════════════════════════════════════════════════════
export const deleteHospiceNursingAssessment = async (
    patientId: string,
    assessmentId: string,
    adminId: string | number,
    reason?: string,
) => {
    const pid = toId(patientId, 'patient id');
    const aid = toId(assessmentId, 'assessment id');
    const adm = toId(adminId, 'admin id');

    const existing = await prisma.hospiceNursingAssessment.findFirst({
        where: { id: aid, patientId: pid },
    });
    if (!existing) throw new ApiError(404, 'Hospice nursing assessment not found');
    if (existing.deletedAt) {
        throw new ApiError(400, 'Assessment is already deleted');
    }

    const updated = await prisma.hospiceNursingAssessment.update({
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
// RESTORE — clears deletedAt / deletedBy / deletionReason
//
// Uses prismaBase so we can find the soft-deleted row even
// though the extended client filters it out on reads.
// ═════════════════════════════════════════════════════════════
export const restoreHospiceNursingAssessment = async (
    patientId: string,
    assessmentId: string,
    adminId: string | number,
) => {
    const pid = toId(patientId, 'patient id');
    const aid = toId(assessmentId, 'assessment id');
    const adm = toId(adminId, 'admin id');

    const existing = await prismaBase.hospiceNursingAssessment.findFirst({
        where: { id: aid, patientId: pid },
    });
    if (!existing) throw new ApiError(404, 'Hospice nursing assessment not found');
    if (!existing.deletedAt) {
        throw new ApiError(400, 'Assessment is not deleted');
    }

    await prisma.hospiceNursingAssessment.update({
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
// LIST DELETED (admin only, paginated)
//
// Bypasses the soft-delete extension to return rows whose
// deletedAt is not null.
// ═════════════════════════════════════════════════════════════
export const getDeletedHospiceNursingAssessments = async (
    page: number = 1,
    limit: number = 20,
) => {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        prismaBase.hospiceNursingAssessment.findMany({
            where: { deletedAt: { not: null } },
            orderBy: { deletedAt: 'desc' },
            skip,
            take: limit,
            include: {
                patient: {
                    select: { id: true, firstName: true, lastName: true },
                },
                deletedByAdmin: { select: { id: true, name: true } },
            },
        }),
        prismaBase.hospiceNursingAssessment.count({
            where: { deletedAt: { not: null } },
        }),
    ]);

    return {
        items: items.map((a) => ({
            id: a.id,
            patientId: a.patientId,
            patientName: `${a.patient.firstName} ${a.patient.lastName}`,
            assessmentDate: a.assessmentDate,
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
    getAllHospiceNursingAssessments,
    createHospiceNursingAssessment,
    getHospiceNursingAssessments,
    getHospiceNursingAssessmentById,
    updateHospiceNursingAssessment,
    deleteHospiceNursingAssessment,
    restoreHospiceNursingAssessment,
    getDeletedHospiceNursingAssessments,
};