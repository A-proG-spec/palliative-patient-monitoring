import { Medication } from '@models/Medication.js';
import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Order medication
// ─────────────────────────────────────────────────────────────
export const orderMedication = async (
  patientId: string,
  data: any,
  staffId: string,
) => {
  const [patient, staff] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(staffId),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const medication = await Medication.create({
    patientId,
    ...data,
    prescribedBy: staffId,
    status: 'Ordered',
  });

  return {
    id: medication._id.toString(),
    patientId: medication.patientId.toString(),
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    route: medication.route,
    administeredAt: medication.administeredAt,
    status: medication.status,
    prescribedBy: {
      id: staff._id.toString(),
      name: staff.name,
    },
    createdAt: medication.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// List medications for a patient
// ─────────────────────────────────────────────────────────────
export const getMedications = async (
  patientId: string,
  status?: string,
  page: number = 1,
  limit: number = 20,
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const filter: any = { patientId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Medication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('prescribedBy', 'name'),
    Medication.countDocuments(filter),
  ]);

  return {
    items: items.map((med) => ({
      id: med._id.toString(),
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      route: med.route,
      administeredAt: med.administeredAt,
      status: med.status,
      prescribedBy: {
        id: (med.prescribedBy as any)?._id?.toString() || '',
        name: (med.prescribedBy as any)?.name || 'Unknown',
      },
      createdAt: med.createdAt,
    })),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Get one medication
// ─────────────────────────────────────────────────────────────
export const getMedicationById = async (
  patientId: string,
  medicationId: string,
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const medication = await Medication
    .findOne({ _id: medicationId, patientId })
    .populate('prescribedBy', 'name');

  if (!medication) throw new ApiError(404, 'Medication not found');

  return {
    id: medication._id.toString(),
    patientId: medication.patientId.toString(),
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    route: medication.route,
    administeredAt: medication.administeredAt,
    status: medication.status,
    prescribedBy: {
      id: (medication.prescribedBy as any)?._id?.toString() || '',
      name: (medication.prescribedBy as any)?.name || 'Unknown',
    },
    createdAt: medication.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update medication status — records who made the change
// ─────────────────────────────────────────────────────────────
export const updateMedicationStatus = async (
  patientId: string,
  medicationId: string,
  status: string,
  adminId: string,
) => {
  const [patient, admin] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(adminId),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!admin) throw new ApiError(404, 'Staff member not found');

  const medication = await Medication.findOne({ _id: medicationId, patientId });
  if (!medication) throw new ApiError(404, 'Medication not found');

  if (!['Ordered', 'Given'].includes(status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  medication.status = status as 'Ordered' | 'Given';
  medication.updatedBy = adminId as any;   // ← audit
  await medication.save();

  return {
    id: medication._id.toString(),
    patientId: medication.patientId.toString(),
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    route: medication.route,
    administeredAt: medication.administeredAt,
    status: medication.status,
    prescribedBy: {
      id: admin._id.toString(),
      name: admin.name,
    },
    updatedAt: medication.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Soft delete medication (admin only)
// ─────────────────────────────────────────────────────────────
export const deleteMedication = async (
  patientId: string,
  medicationId: string,
  adminId: string,
  reason?: string,
) => {
  const medication = await Medication.findOne({ _id: medicationId, patientId });
  if (!medication) throw new ApiError(404, 'Medication not found');

  if (medication.deletedAt) {
    throw new ApiError(400, 'Medication is already deleted');
  }

  medication.deletedAt = new Date();
  medication.deletedBy = adminId as any;
  medication.deletionReason = reason;
  medication.updatedBy = adminId as any;
  await medication.save();

  return { id: medicationId, success: true, deletedAt: medication.deletedAt };
};

// ─────────────────────────────────────────────────────────────
// Restore a soft-deleted medication (admin only)
// ─────────────────────────────────────────────────────────────
export const restoreMedication = async (
  patientId: string,
  medicationId: string,
  adminId: string,
) => {
  const medication = await Medication
    .findOne({ _id: medicationId, patientId })
    .setOptions({ includeDeleted: true });

  if (!medication) throw new ApiError(404, 'Medication not found');
  if (!medication.deletedAt) {
    throw new ApiError(400, 'Medication is not deleted');
  }

  medication.deletedAt = null;
  medication.deletedBy = null as any;
  medication.deletionReason = undefined;
  medication.updatedBy = adminId as any;
  await medication.save();

  return { id: medicationId, restored: true };
};

export default {
  orderMedication,
  getMedications,
  getMedicationById,
  updateMedicationStatus,
  deleteMedication,
  restoreMedication,
};