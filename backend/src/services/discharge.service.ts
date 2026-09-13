import { DischargeSummary } from '@models/DischargeSummary.js';
import { HospitalAdmission } from '@models/HospitalAdmission.js';
import { Patient } from '@models/Patient.js';
import { Notification } from '@models/Notification.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Create discharge summary (finalizes discharge workflow)
// ─────────────────────────────────────────────────────────────
export const createDischargeSummary = async (
  patientId: string,
  data: any,
  staffId: string
) => {
  const [patient, admission] = await Promise.all([
    Patient.findById(patientId),
    data.admissionId
      ? HospitalAdmission.findById(data.admissionId)
      : HospitalAdmission.findOne({ patientId, status: 'Active' }).sort({ admissionDate: -1 }),
  ]);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  // Prevent duplicate discharge summaries for the same admission
  if (admission) {
    const existing = await DischargeSummary.findOne({ admissionId: admission._id });
    if (existing) {
      throw new ApiError(400, 'Discharge summary already exists for this admission');
    }
  }

  const summary = await DischargeSummary.create({
    patientId,
    admissionId: admission?._id,
    ...data,
    createdBy: staffId,
  });

  // Flip linked admission to Discharged
  if (admission) {
    admission.status = 'Discharged';
    admission.dischargeDate = new Date(data.dateOfDischarge);
    admission.dischargeReason = data.dischargeReason || 'Improved';
    await admission.save();
  }

  // Flip patient to Discharged
  patient.status = 'Discharged';
  await patient.save();

  // Notify admins
  await Notification.create({
    type: 'CloseCase',
    message: `Patient discharged: ${patient.firstName} ${patient.lastName}`,
    data: {
      patientId: patient._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
    },
    read: false,
  });

  return {
    id: summary._id.toString(),
    patientId: summary.patientId.toString(),
    admissionId: summary.admissionId?.toString(),
    dateOfDischarge: summary.dateOfDischarge,
    dischargeType: summary.dischargeType,
    status: summary.status,
    createdAt: summary.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Get discharge summary for a patient
// ─────────────────────────────────────────────────────────────
export const getDischargeSummaryByPatient = async (patientId: string) => {
  const summary = await DischargeSummary.findOne({ patientId })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name role')
    .populate('admissionId', 'admissionDate ward bedNumber');

  if (!summary) {
    throw new ApiError(404, 'Discharge summary not found');
  }

  return formatSummary(summary);
};

// ─────────────────────────────────────────────────────────────
// Get by admission ID (used internally)
// ─────────────────────────────────────────────────────────────
export const getDischargeSummaryByAdmission = async (admissionId: string) => {
  const summary = await DischargeSummary.findOne({ admissionId })
    .populate('createdBy', 'name role');

  if (!summary) return null;

  return formatSummary(summary);
};

// ─────────────────────────────────────────────────────────────
// Update (only allowed while Draft)
// ─────────────────────────────────────────────────────────────
export const updateDischargeSummary = async (
  patientId: string,
  summaryId: string,
  data: any,
  staffId: string
) => {
  const summary = await DischargeSummary.findOne({ _id: summaryId, patientId });

  if (!summary) {
    throw new ApiError(404, 'Discharge summary not found');
  }

  if (summary.status === 'Final') {
    throw new ApiError(400, 'Cannot edit a finalized discharge summary');
  }

  Object.assign(summary, data);
  summary.updatedAt = new Date();
  await summary.save();

  return formatSummary(summary);
};

// ─────────────────────────────────────────────────────────────
// Finalize (Draft → Final)
// ─────────────────────────────────────────────────────────────
export const finalizeDischargeSummary = async (
  patientId: string,
  summaryId: string,
  adminId:string,
) => {
  const summary = await DischargeSummary.findOne({ _id: summaryId, patientId });

  if (!summary) {
    throw new ApiError(404, 'Discharge summary not found');
  }

  if (summary.status === 'Final') {
    throw new ApiError(400, 'Discharge summary is already finalized');
  }

  summary.status = 'Final';
  summary.createdBy = adminId as any;
  await summary.save();

  return {
    id: summary._id.toString(),
    status: summary.status,
  };
};

// ─────────────────────────────────────────────────────────────
// Delete (admin-only)
// ─────────────────────────────────────────────────────────────
export const deleteDischargeSummary = async (
  patientId: string,
  summaryId: string
) => {
  const summary = await DischargeSummary.findOne({ _id: summaryId, patientId });

  if (!summary) {
    throw new ApiError(404, 'Discharge summary not found');
  }

  await summary.deleteOne();

  return { id: summaryId, success: true };
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const formatSummary = (summary: any) => {
  const obj = summary.toObject ? summary.toObject() : summary;
  return {
    id: obj._id.toString(),
    patientId: obj.patientId.toString(),
    admissionId: obj.admissionId?._id?.toString() || obj.admissionId?.toString(),
    ...obj,
    createdBy: obj.createdBy
      ? {
          id: obj.createdBy._id?.toString() || obj.createdBy.toString(),
          name: obj.createdBy.name || 'Unknown',
          role: obj.createdBy.role || null,
        }
      : null,
  };
};

export default {
  createDischargeSummary,
  getDischargeSummaryByPatient,
  getDischargeSummaryByAdmission,
  updateDischargeSummary,
  finalizeDischargeSummary,
  deleteDischargeSummary,
};