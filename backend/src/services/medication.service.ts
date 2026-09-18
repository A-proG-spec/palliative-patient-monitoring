import { prisma } from '@db/prisma.js';
import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';

// ─────────────────────────────────────────────────────────────
// Order medication
// ─────────────────────────────────────────────────────────────
export const orderMedication = async (
  patientId: string,
  data: any,
  staffId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(staffId, 'staff id');

  const [patient, staff] = await Promise.all([
    prisma.patient.findUnique({ where: { id: pid }, select: { id: true } }),
    prisma.staff.findUnique({ where: { id: sid }, select: { id: true, name: true } }),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const medication = await prisma.medication.create({
    data: {
      patientId: pid,
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      route: data.route,
      administeredAt: data.administeredAt,
      prescribedBy: sid,
      status: 'Ordered',
    },
  });

  return {
    id: medication.id,
    patientId: medication.patientId,
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    route: medication.route,
    administeredAt: medication.administeredAt,
    status: medication.status,
    prescribedBy: { id: staff.id, name: staff.name },
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
    prisma.medication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        prescribedByStaff: { select: { id: true, name: true } },
      },
    }),
    prisma.medication.count({ where }),
  ]);

  return {
    items: items.map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      route: m.route,
      administeredAt: m.administeredAt,
      status: m.status,
      prescribedBy: {
        id: m.prescribedByStaff.id,
        name: m.prescribedByStaff.name,
      },
      createdAt: m.createdAt,
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
  const pid = toId(patientId, 'patient id');
  const mid = toId(medicationId, 'medication id');

  const medication = await prisma.medication.findFirst({
    where: { id: mid, patientId: pid },
    include: {
      prescribedByStaff: { select: { id: true, name: true } },
    },
  });

  if (!medication) throw new ApiError(404, 'Medication not found');

  return {
    id: medication.id,
    patientId: medication.patientId,
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    route: medication.route,
    administeredAt: medication.administeredAt,
    status: medication.status,
    prescribedBy: {
      id: medication.prescribedByStaff.id,
      name: medication.prescribedByStaff.name,
    },
    createdAt: medication.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update status (Ordered ↔ Given) — records auditor
// ─────────────────────────────────────────────────────────────
export const updateMedicationStatus = async (
  patientId: string,
  medicationId: string,
  status: 'Ordered' | 'Given',
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const mid = toId(medicationId, 'medication id');
  const aid = toId(adminId, 'admin id');

  if (!['Ordered', 'Given'].includes(status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  const existing = await prisma.medication.findFirst({
    where: { id: mid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Medication not found');

  const updated = await prisma.medication.update({
    where: { id: mid },
    data: { status, updatedBy: aid },
    include: {
      prescribedByStaff: { select: { id: true, name: true } },
    },
  });

  return {
    id: updated.id,
    patientId: updated.patientId,
    name: updated.name,
    dosage: updated.dosage,
    frequency: updated.frequency,
    route: updated.route,
    administeredAt: updated.administeredAt,
    status: updated.status,
    prescribedBy: {
      id: updated.prescribedByStaff.id,
      name: updated.prescribedByStaff.name,
    },
    updatedAt: updated.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Soft delete (admin only)
// ─────────────────────────────────────────────────────────────
export const deleteMedication = async (
  patientId: string,
  medicationId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const mid = toId(medicationId, 'medication id');
  const aid = toId(adminId, 'admin id');

  const medication = await prisma.medication.findFirst({
    where: { id: mid, patientId: pid },
  });
  if (!medication) throw new ApiError(404, 'Medication not found');

  if (medication.deletedAt) {
    throw new ApiError(400, 'Medication is already deleted');
  }

  const updated = await prisma.medication.update({
    where: { id: mid },
    data: {
      deletedAt: new Date(),
      deletedBy: aid,
      deletionReason: reason ?? null,
      updatedBy: aid,
    },
  });

  return { id: medicationId, success: true, deletedAt: updated.deletedAt };
};

// ─────────────────────────────────────────────────────────────
// Restore a soft-deleted medication (admin only)
//
// Uses prismaBase to bypass the soft-delete extension on read,
// then update clears the deletedAt fields.
// ─────────────────────────────────────────────────────────────
export const restoreMedication = async (
  patientId: string,
  medicationId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const mid = toId(medicationId, 'medication id');
  const aid = toId(adminId, 'admin id');

  const medication = await prisma.medication.findFirst({
    where: { id: mid, patientId: pid },
  });
  if (!medication) throw new ApiError(404, 'Medication not found');
  if (!medication.deletedAt) {
    throw new ApiError(400, 'Medication is not deleted');
  }

  await prisma.medication.update({
    where: { id: mid },
    data: {
      deletedAt: null,
      deletedBy: null,
      deletionReason: null,
      updatedBy: aid,
    },
  });

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