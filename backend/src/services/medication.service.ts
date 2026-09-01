import { Medication } from '@models/Medication.js';
import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { ApiError } from '@utils/ApiError.js';

export const orderMedication = async (patientId: string, data: any, staffId: string) => {
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

export const getMedications = async (patientId: string, status?: string, page: number = 1, limit: number = 20) => {
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

export const getMedicationById = async (patientId: string, medicationId: string) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const medication = await Medication.findOne({ _id: medicationId, patientId }).populate('prescribedBy', 'name');

  if (!medication) {
    throw new ApiError(404, 'Medication not found');
  }

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
    visitId: medication.visitId?.toString(),
    admissionId: medication.admissionId?.toString(),
    createdAt: medication.createdAt,
    // ✅ Removed: updatedAt - not in Medication interface
  };
};

export const updateMedicationStatus = async (patientId: string, medicationId: string, status: string, staffId: string) => {
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

  const medication = await Medication.findOne({ _id: medicationId, patientId });

  if (!medication) {
    throw new ApiError(404, 'Medication not found');
  }

  if (!['Ordered', 'Given'].includes(status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  // ✅ Fixed: Type assertion for status
  medication.status = status as 'Ordered' | 'Given';
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
      id: staff._id.toString(),
      name: staff.name,
    },
    // ✅ Removed: updatedAt - not in Medication interface
  };
};

export default {
  orderMedication,
  getMedications,
  getMedicationById,
  updateMedicationStatus,
};