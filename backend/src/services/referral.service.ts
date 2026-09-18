import { prisma } from '@db/prisma.js';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';

// ─────────────────────────────────────────────────────────────
// Create referral
// ─────────────────────────────────────────────────────────────
export const createReferral = async (
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

  const referral = await prisma.referral.create({
    data: {
      patientId: pid,
      requestedBy: sid,

      referralType: data.referralType,
      referralDate: new Date(data.referralDate),

      primaryDiagnosis: data.primaryDiagnosis,
      diseaseStage: data.diseaseStage,
      ppsScore: data.ppsScore,
      kpsScore: data.kpsScore,
      currentSymptoms: data.currentSymptoms ?? {},

      reasons: data.reasons ?? [],
      otherReason: data.otherReason,

      referringFacility: data.referringFacility,
      receivingFacility: data.receivingFacility,
      contactPerson: data.contactPerson,
      contactNumber: data.contactNumber,

      status: 'Pending',
      outcome: '',
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return {
    id: referral.id,
    patientId: referral.patientId,
    patientName: `${referral.patient.firstName} ${referral.patient.lastName}`,
    referralType: referral.referralType,
    referralDate: referral.referralDate,
    status: referral.status,
    createdAt: referral.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// List referrals for a patient
// ─────────────────────────────────────────────────────────────
export const getReferrals = async (
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
    prisma.referral.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        requestedByStaff: { select: { id: true, name: true, role: true } },
      },
    }),
    prisma.referral.count({ where }),
  ]);

  return {
    items: items.map((r) => ({
      id: r.id,
      patientId: r.patientId,
      referralType: r.referralType,
      referralDate: r.referralDate,
      primaryDiagnosis: r.primaryDiagnosis,
      diseaseStage: r.diseaseStage,
      ppsScore: r.ppsScore,
      kpsScore: r.kpsScore,
      reasons: r.reasons,
      referringFacility: r.referringFacility,
      receivingFacility: r.receivingFacility,
      status: r.status,
      actionTaken: r.actionTaken,
      requestedBy: {
        id: r.requestedByStaff.id,
        name: r.requestedByStaff.name,
        role: r.requestedByStaff.role,
      },
      createdAt: r.createdAt,
    })),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Get one referral
// ─────────────────────────────────────────────────────────────
export const getReferralById = async (
  patientId: string,
  referralId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const rid = toId(referralId, 'referral id');

  const referral = await prisma.referral.findFirst({
    where: { id: rid, patientId: pid },
    include: {
      requestedByStaff: { select: { id: true, name: true, role: true } },
      approvedByAdmin: { select: { id: true, name: true } },
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!referral) throw new ApiError(404, 'Referral not found');

  return {
    id: referral.id,
    patientId: referral.patientId,
    patientName: `${referral.patient.firstName} ${referral.patient.lastName}`,

    referralType: referral.referralType,
    referralDate: referral.referralDate,

    primaryDiagnosis: referral.primaryDiagnosis,
    diseaseStage: referral.diseaseStage,
    ppsScore: referral.ppsScore,
    kpsScore: referral.kpsScore,
    currentSymptoms: referral.currentSymptoms,

    reasons: referral.reasons,
    otherReason: referral.otherReason,

    referringFacility: referral.referringFacility,
    receivingFacility: referral.receivingFacility,
    contactPerson: referral.contactPerson,
    contactNumber: referral.contactNumber,

    status: referral.status,
    actionTaken: referral.actionTaken,
    outcome: referral.outcome,

    followUpDate: referral.followUpDate,
    followUpStatus: referral.followUpStatus,

    requestedBy: {
      id: referral.requestedByStaff.id,
      name: referral.requestedByStaff.name,
      role: referral.requestedByStaff.role,
    },
    approvedBy: referral.approvedByAdmin
      ? { id: referral.approvedByAdmin.id, name: referral.approvedByAdmin.name }
      : null,

    createdAt: referral.createdAt,
    updatedAt: referral.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update referral (author only) — whitelisted fields
// ─────────────────────────────────────────────────────────────
export const updateReferral = async (
  patientId: string,
  referralId: string,
  data: any,
  staffId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const rid = toId(referralId, 'referral id');
  const sid = toId(staffId, 'staff id');

  const referral = await prisma.referral.findFirst({
    where: { id: rid, patientId: pid },
  });
  if (!referral) throw new ApiError(404, 'Referral not found');

  if (referral.requestedBy !== sid) {
    throw new ApiError(403, 'You can only edit referrals you created');
  }

  if (referral.status !== 'Pending') {
    throw new ApiError(400, 'Cannot edit a referral that has been processed');
  }

  const allowed = [
    'referralType', 'primaryDiagnosis', 'diseaseStage',
    'ppsScore', 'kpsScore', 'currentSymptoms',
    'reasons', 'otherReason',
    'referringFacility', 'receivingFacility',
    'contactPerson', 'contactNumber',
  ] as const;

  const updateData: any = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }

  const updated = await prisma.referral.update({
    where: { id: rid },
    data: updateData,
  });

  return {
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updatedAt,
  };
};

export default {
  createReferral,
  getReferrals,
  getReferralById,
  updateReferral,
};