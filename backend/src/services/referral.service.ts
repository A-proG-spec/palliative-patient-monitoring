import { Referral } from '@models/Referral.js';
import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { Notification } from '@models/Notification.js';
import { ApiError } from '@utils/ApiError.js';

export const requestReferral = async (patientId: string, data: any, staffId: string) => {
  const [patient, staff] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(staffId),
  ]);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  // Validate prepared by fields
  if (!data.preparedBy || data.preparedBy.trim().length === 0) {
    throw new ApiError(400, 'preparedBy is required');
  }
  if (!data.preparedByDesignation || data.preparedByDesignation.trim().length === 0) {
    throw new ApiError(400, 'preparedByDesignation is required');
  }
  if (!data.signature || data.signature.trim().length === 0) {
    throw new ApiError(400, 'signature is required');
  }

  const referral = await Referral.create({
    patientId,
    ...data,
    requestedBy: staffId,
    status: 'Pending',
  });

  // Create notification for admin
  await Notification.create({
    type: 'ReferralApproval',
    message: `New referral request: ${patient.firstName} ${patient.lastName}`,
    data: {
      referralId: referral._id,
      patientId: referral.patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
    },
    read: false,
  });

  return {
    id: referral._id.toString(),
    patientId: referral.patientId.toString(),
    referralType: referral.referralType,
    referralDate: referral.referralDate,
    primaryDiagnosis: referral.primaryDiagnosis,
    status: referral.status,
    reasons: referral.reasons,
    receivingFacility: referral.receivingFacility,
    requestedBy: {
      id: staff._id.toString(),
      name: staff.name,
    },
    preparedBy: referral.preparedBy,
    preparedByDesignation: referral.preparedByDesignation,
    signature: referral.signature,
    actionTaken: referral.actionTaken,
    outcome: referral.outcome,
    followUpDate: referral.followUpDate,
    followUpStatus: referral.followUpStatus,
    createdAt: referral.createdAt,
  };
};

export const getReferrals = async (patientId: string, status?: string, page: number = 1, limit: number = 20) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const filter: any = { patientId };
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Referral.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('requestedBy', 'name'),
    Referral.countDocuments(filter),
  ]);

  return {
    items: items.map((r) => ({
      id: r._id.toString(),
      referralType: r.referralType,
      referralDate: r.referralDate,
      primaryDiagnosis: r.primaryDiagnosis,
      status: r.status,
      reasons: r.reasons,
      receivingFacility: r.receivingFacility,
      requestedBy: {
        id: (r.requestedBy as any)?._id?.toString() || '',
        name: (r.requestedBy as any)?.name || 'Unknown',
      },
      preparedBy: r.preparedBy,
      actionTaken: r.actionTaken,
      followUpDate: r.followUpDate,
      followUpStatus: r.followUpStatus,
      createdAt: r.createdAt,
    })),
    page,
    limit,
    total,
  };
};

export const getReferralById = async (patientId: string, referralId: string) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const referral = await Referral.findOne({ _id: referralId, patientId })
    .populate('requestedBy', 'name')
    .populate('approvedBy', 'name');

  if (!referral) {
    throw new ApiError(404, 'Referral not found');
  }

  return {
    id: referral._id.toString(),
    patientId: referral.patientId.toString(),
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
      id: (referral.requestedBy as any)?._id?.toString() || '',
      name: (referral.requestedBy as any)?.name || 'Unknown',
    },
    approvedBy: referral.approvedBy ? {
      id: (referral.approvedBy as any)?._id?.toString() || '',
      name: (referral.approvedBy as any)?.name || 'Unknown',
    } : null,
    preparedBy: referral.preparedBy,
    preparedByDesignation: referral.preparedByDesignation,
    signature: referral.signature,
    createdAt: referral.createdAt,
    updatedAt: referral.updatedAt,
  };
};

export default {
  requestReferral,
  getReferrals,
  getReferralById,
};