import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';

// ─────────────────────────────────────────────────────────────
// Order medication
// ─────────────────────────────────────────────────────────────
export const getAllMedications = async (
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
    client.medication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        prescribedByStaff: { select: { id: true, name: true } },
      },
    }),
    client.medication.count({ where }),
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
      deletedAt: m.deletedAt ?? null,
      deletionReason: m.deletionReason ?? null,
    })),
    page,
    limit,
    total,
  };
};

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

// ─────────────────────────────────────────────────────────────
// Pharmacist queue — all `Ordered` medications across patients
// ─────────────────────────────────────────────────────────────
export const getPendingMedicationOrders = async (
  page: number = 1,
  limit: number = 100,
) => {
  const where = { status: 'Ordered' as const };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.medication.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            hospitalPatientId: true,
            currentLocation: true,
          },
        },
        prescribedByStaff: { select: { id: true, name: true, role: true } },
      },
    }),
    prisma.medication.count({ where }),
  ]);

  return {
    items: items.map((m) => ({
      id: m.id,
      patientId: m.patient.id,
      patientName: `${m.patient.firstName} ${m.patient.lastName}`,
      patientDisplayId: m.patient.hospitalPatientId,
      currentLocation: m.patient.currentLocation,

      medicationName: m.name,
      dose: m.dosage,
      frequency: m.frequency,
      route: m.route,
      administeredAt: m.administeredAt,

      prescribingClinician: m.prescribedByStaff.name,
      prescribedById: m.prescribedByStaff.id,

      dateOrdered: m.createdAt,
      status: m.status,
    })),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Pharmacist queue — single order detail
// ─────────────────────────────────────────────────────────────
export const getMedicationOrderById = async (medicationId: string) => {
  const id = toId(medicationId, 'medication id');

  const med = await prisma.medication.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          age: true,
          sex: true,
          hospitalPatientId: true,
          currentLocation: true,
        },
      },
      prescribedByStaff: { select: { id: true, name: true, role: true } },
    },
  });

  if (!med) throw new ApiError(404, 'Medication order not found');

  return {
    id: med.id,
    patientId: med.patient.id,
    patientName: `${med.patient.firstName} ${med.patient.lastName}`,
    patientDisplayId: med.patient.hospitalPatientId,
    age: med.patient.age,
    sex: med.patient.sex,
    currentLocation: med.patient.currentLocation,

    medicationName: med.name,
    dose: med.dosage,
    frequency: med.frequency,
    route: med.route,
    administeredAt: med.administeredAt,

    prescribingClinician: med.prescribedByStaff.name,
    prescribedById: med.prescribedByStaff.id,

    dateOrdered: med.createdAt,
    status: med.status,
  };
};

// ─────────────────────────────────────────────────────────────
// Pharmacist queue — mark as Given
//
// Reuses the patient-scoped updater but skips the patient guard
// because the pharmacist already sees the order in their queue.
// ─────────────────────────────────────────────────────────────
export const markMedicationGivenByQueue = async (
  medicationId: string,
  pharmacistId: string | number,
) => {
  const mid = toId(medicationId, 'medication id');
  const sid = toId(pharmacistId, 'pharmacist id');

  const existing = await prisma.medication.findUnique({
    where: { id: mid },
    select: { id: true, status: true },
  });
  if (!existing) throw new ApiError(404, 'Medication order not found');
  if (existing.status === 'Given') {
    throw new ApiError(400, 'Medication is already marked as given');
  }

  const updated = await prisma.medication.update({
    where: { id: mid },
    data: {
      status: 'Given',
      updatedByStaffId: sid,   // ← route to the Staff FK
      // updatedBy stays null — it's for admins
    },
  });

  return { id: updated.id, status: updated.status, updatedAt: updated.updatedAt };
};

export default {
  getAllMedications,
  orderMedication,
  getMedications,
  getMedicationById,
  updateMedicationStatus,
  deleteMedication,
  restoreMedication,
  getPendingMedicationOrders,
  getMedicationOrderById,
  markMedicationGivenByQueue,
};