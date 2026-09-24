import { PrismaClient } from '@prisma/client';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';


const prismaBase = new PrismaClient();
export const prisma = prismaBase;
// ─────────────────────────────────────────────────────────────
// Record admission
// ─────────────────────────────────────────────────────────────
export const getAllAdmissions = async (
  patientId: string,
  status?: string,
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

  const where: any = { patientId: pid };
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    client.hospitalAdmission.findMany({
      where,
      orderBy: { admissionDate: 'desc' },
      skip,
      take: limit,
    }),
    client.hospitalAdmission.count({ where }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      admissionDate: a.admissionDate,
      dischargeDate: a.dischargeDate,
      bedNumber: a.bedNumber,
      ward: a.ward,
      admittingPhysician: a.admittingPhysician,
      careTeam: a.careTeam,
      status: a.status,
      dischargeReason: a.dischargeReason,
      createdAt: a.createdAt,
      deletedAt: a.deletedAt ?? null,
      deletionReason: a.deletionReason ?? null,
    })),
    page,
    limit,
    total,
  };
};

export const recordAdmission = async (
  patientId: string,
  data: any,
  staffId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(staffId, 'staff id');

  const patient = await prisma.patient.findUnique({
    where: { id: pid },
    select: { id: true, firstName: true, lastName: true, hospitalPatientId: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  if (!data.referralId) {
    throw new ApiError(400, 'A referral is required before admission');
  }

  const referralId = toId(data.referralId, 'referral id');
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
  });
  if (!referral) throw new ApiError(404, 'Referral not found');

  if (referral.patientId !== pid) {
    throw new ApiError(400, 'Referral does not belong to this patient');
  }

  if (referral.status === 'Admitted') {
    throw new ApiError(400, 'Referral has already been used for a previous admission');
  }

  if (referral.status !== 'Accepted') {
    throw new ApiError(
      400,
      'Referral must be accepted by an administrator before admission',
    );
  }

  const admission = await prisma.$transaction(async (tx) => {
    const created = await tx.hospitalAdmission.create({
      data: {
        patientId: pid,
        hospitalPatientId: data.hospitalPatientId ?? patient.hospitalPatientId,

        referralId,

        referredFrom: data.referredFrom ?? null,
        referredFromOther: data.referredFromOther ?? null,
        referringClinician: data.referringClinician ?? null,
        diagnosisAtReferral: data.diagnosisAtReferral ?? null,
        referralReason: data.referralReason ?? null,
        referralReasonOther: data.referralReasonOther ?? null,

        admissionDate: new Date(data.admissionDate),
        bedNumber: data.bedNumber,
        ward: data.ward,
        admittingPhysician: data.admittingPhysician,
        careTeam: data.careTeam,

        primaryDiagnosis: data.primaryDiagnosis,
        secondaryDiagnoses: data.secondaryDiagnoses ?? [],
        diseaseStage: data.diseaseStage,
        comorbidities: data.comorbidities ?? [],

        estimatedPrognosis: data.estimatedPrognosis,
        ppsScore: data.ppsScore,
        kpsScore: data.kpsScore ?? null,
        functionalStatus: data.functionalStatus,

        painScore: data.painScore,
        painType: data.painType,
        symptomsPresent: data.symptomsPresent ?? [],
        symptomsPresentOther: data.symptomsPresentOther ?? null,

        emotionalStatus: data.emotionalStatus,
        familySupport: data.familySupport,
        socialChallenges: data.socialChallenges ?? null,

        spiritualConcerns: data.spiritualConcerns,
        spiritualNeedsDescription: data.spiritualNeedsDescription ?? null,
        spiritualSupportPreferred: data.spiritualSupportPreferred ?? null,
        spiritualSupportPreferredOther: data.spiritualSupportPreferredOther ?? null,

        painManagementPlan: data.painManagementPlan,
        medicationPlan: data.medicationPlan,
        nursingCarePlan: data.nursingCarePlan,
        homeBasedCareRequired: data.homeBasedCareRequired,
        psychosocialSupportPlan: data.psychosocialSupportPlan ?? null,
        physiotherapyRequired: data.physiotherapyRequired,

        admittedToHospiceUnit: data.admittedToHospiceUnit ?? true,
        status: 'Active',

        createdBy: sid,
      },
    });

    await tx.referral.update({
      where: { id: referralId },
      data: { status: 'Admitted' },
    });

    await tx.patient.update({
      where: { id: pid },
      data: { currentLocation: 'ReferredHospital' },
    });

    return created;
  });

  return {
    id: admission.id,
    patientId: admission.patientId,
    referralId: admission.referralId,
    admissionDate: admission.admissionDate,
    bedNumber: admission.bedNumber,
    ward: admission.ward,
    status: admission.status,
    createdAt: admission.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// List admissions for a patient
// ─────────────────────────────────────────────────────────────
export const getAdmissions = async (
  patientId: string,
  status?: string,
  page: number = 1,
  limit: number = 20,
) => {
  const pid = toId(patientId, 'patient id');

  const patient = await prisma.patient.findUnique({
    where: { id: pid },
    select: { id: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const where: any = { patientId: pid };
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.hospitalAdmission.findMany({
      where,
      orderBy: { admissionDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.hospitalAdmission.count({ where }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      admissionDate: a.admissionDate,
      dischargeDate: a.dischargeDate,
      bedNumber: a.bedNumber,
      ward: a.ward,
      admittingPhysician: a.admittingPhysician,
      careTeam: a.careTeam,
      status: a.status,
      dischargeReason: a.dischargeReason,
      createdAt: a.createdAt,
    })),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Get one admission
// ─────────────────────────────────────────────────────────────
export const getAdmissionById = async (
  patientId: string,
  admissionId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(admissionId, 'admission id');

  const admission = await prisma.hospitalAdmission.findFirst({
    where: { id: aid, patientId: pid },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true, sex: true,
          dateOfBirth: true, address: true, phone: true,
          emergencyContactName: true, emergencyContactPhone: true,
          hospitalPatientId: true,
        },
      },
      createdByStaff: { select: { id: true, name: true, role: true } },
      referral: {
        select: {
          id: true, referralType: true, referralDate: true,
          receivingFacility: true, status: true,
        },
      },
      _count: { select: { progressNotes: true, dischargeSummaries: true } },
    },
  });

  if (!admission) throw new ApiError(404, 'Admission not found');

  const latestDischarge = await prisma.dischargeSummary.findFirst({
    where: { admissionId: aid },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, dateOfDischarge: true },
  });

  return {
    id: admission.id,
    patientId: admission.patient.id,
    patientName: `${admission.patient.firstName} ${admission.patient.lastName}`,
    hospitalPatientId: admission.hospitalPatientId ?? admission.patient.hospitalPatientId,
    age: admission.patient.age,
    sex: admission.patient.sex,
    dateOfBirth: admission.patient.dateOfBirth,
    address: admission.patient.address,
    phone: admission.patient.phone,

    referralId: admission.referral?.id ?? null,
    referral: admission.referral,
    referredFrom: admission.referredFrom,
    referredFromOther: admission.referredFromOther,
    referringClinician: admission.referringClinician,
    diagnosisAtReferral: admission.diagnosisAtReferral,
    referralReason: admission.referralReason,
    referralReasonOther: admission.referralReasonOther,

    admissionDate: admission.admissionDate,
    dischargeDate: admission.dischargeDate,
    bedNumber: admission.bedNumber,
    ward: admission.ward,
    admittingPhysician: admission.admittingPhysician,
    careTeam: admission.careTeam,

    primaryDiagnosis: admission.primaryDiagnosis,
    secondaryDiagnoses: admission.secondaryDiagnoses,
    diseaseStage: admission.diseaseStage,
    comorbidities: admission.comorbidities,
    estimatedPrognosis: admission.estimatedPrognosis,
    ppsScore: admission.ppsScore,
    kpsScore: admission.kpsScore,
    functionalStatus: admission.functionalStatus,
    painScore: admission.painScore,
    painType: admission.painType,
    symptomsPresent: admission.symptomsPresent,
    symptomsPresentOther: admission.symptomsPresentOther,

    emotionalStatus: admission.emotionalStatus,
    familySupport: admission.familySupport,
    socialChallenges: admission.socialChallenges,

    spiritualConcerns: admission.spiritualConcerns,
    spiritualNeedsDescription: admission.spiritualNeedsDescription,
    spiritualSupportPreferred: admission.spiritualSupportPreferred,
    spiritualSupportPreferredOther: admission.spiritualSupportPreferredOther,

    painManagementPlan: admission.painManagementPlan,
    medicationPlan: admission.medicationPlan,
    nursingCarePlan: admission.nursingCarePlan,
    homeBasedCareRequired: admission.homeBasedCareRequired,
    psychosocialSupportPlan: admission.psychosocialSupportPlan,
    physiotherapyRequired: admission.physiotherapyRequired,

    admittedToHospiceUnit: admission.admittedToHospiceUnit,
    dischargeReason: admission.dischargeReason,
    status: admission.status,

    progressNoteCount: admission._count.progressNotes,
    dischargeSummaryId: latestDischarge?.id ?? null,
    dischargeSummaryStatus: latestDischarge?.status ?? null,

    createdBy: {
      id: admission.createdByStaff.id,
      name: admission.createdByStaff.name,
      role: admission.createdByStaff.role,
    },

    createdAt: admission.createdAt,
    updatedAt: admission.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update admission (discharge or status change)
// ─────────────────────────────────────────────────────────────
export const updateAdmission = async (
  patientId: string,
  admissionId: string,
  data: any,
  adminId: string|number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(admissionId, 'admission id');
  const adm = toId(adminId, 'admin id');

  const existing = await prisma.hospitalAdmission.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!existing) throw new ApiError(404, 'Admission not found');

  if (!['Active', 'Discharged'].includes(data.status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  const updateData: any = {
    status: data.status,
    updatedBy: adm,
  };

  if (data.status === 'Discharged') {
    if (!data.dischargeDate || !data.dischargeReason) {
      throw new ApiError(400, 'Discharge date and reason required');
    }
    updateData.dischargeDate = new Date(data.dischargeDate);
    updateData.dischargeReason = data.dischargeReason;
  }

  const updated = await prisma.hospitalAdmission.update({
    where: { id: aid },
    data: updateData,
  });

  return {
    id: updated.id,
    status: updated.status,
    dischargeDate: updated.dischargeDate,
    dischargeReason: updated.dischargeReason,
    updatedAt: updated.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Soft delete
// ─────────────────────────────────────────────────────────────
export const deleteAdmission = async (
  patientId: string,
  admissionId: string,
  adminId: string|number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(admissionId, 'admission id');
  const adm = toId(adminId, 'admin id');

  const admission = await prisma.hospitalAdmission.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!admission) throw new ApiError(404, 'Admission not found');
  if (admission.deletedAt) throw new ApiError(400, 'Admission is already deleted');

  const updated = await prisma.hospitalAdmission.update({
    where: { id: aid },
    data: {
      deletedAt: new Date(),
      deletedBy: adm,
      deletionReason: reason ?? null,
      updatedBy: adm,
    },
  });

  return { id: admissionId, success: true, deletedAt: updated.deletedAt };
};

// ─────────────────────────────────────────────────────────────
// Restore
// ─────────────────────────────────────────────────────────────
export const restoreAdmission = async (
  patientId: string,
  admissionId: string,
  adminId: string|number,
) => {
  const pid = toId(patientId, 'patient id');
  const aid = toId(admissionId, 'admission id');
  const adm = toId(adminId, 'admin id');

  const admission = await prisma.hospitalAdmission.findFirst({
    where: { id: aid, patientId: pid },
  });
  if (!admission) throw new ApiError(404, 'Admission not found');
  if (!admission.deletedAt) throw new ApiError(400, 'Admission is not deleted');

  await prisma.hospitalAdmission.update({
    where: { id: aid },
    data: {
      deletedAt: null,
      deletedBy: null,
      deletionReason: null,
      updatedBy: adm,
    },
  });

  return { id: admissionId, restored: true };
};

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────
export const getActiveAdmissionForPatient = async (patientId: string) => {
  const pid = toId(patientId, 'patient id');
  return prisma.hospitalAdmission.findFirst({
    where: { patientId: pid, status: 'Active' },
    orderBy: { admissionDate: 'desc' },
  });
};

export default {
  getAllAdmissions,
  recordAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission,
  restoreAdmission,
  getActiveAdmissionForPatient,
};