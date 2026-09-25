import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';
// ─────────────────────────────────────────────────────────────
// GET ALL imaging orders for a patient
// ─────────────────────────────────────────────────────────────
export const getAllImagingOrders = async (
  patientId: string,
  filters: {
    status?: string;
    modality?: string;
    priority?: string;
    includeDeleted?: boolean;
  } = {},
  page: number = 1,
  limit: number = 20,
) => {
  const pid = toId(patientId, 'patient id');
  const client = filters.includeDeleted ? prismaBase : prisma;

  const patient = await prisma.patient.findUnique({
    where: { id: pid },
    select: { id: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const where: any = { patientId: pid };
  if (filters.status) where.status = filters.status;
  if (filters.modality) where.modality = filters.modality;
  if (filters.priority) where.priority = filters.priority;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    client.imagingOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        orderedByStaff: { select: { id: true, name: true, role: true } },
      },
    }),
    client.imagingOrder.count({ where }),
  ]);

  return {
    items: items.map((o) => ({
      id: o.id,
      patientId: o.patientId,
      modality: o.modality,
      bodyRegion: o.bodyRegion,
      specificSite: o.specificSite,
      laterality: o.laterality,
      priority: o.priority,
      contrastRequested: o.contrastRequested,
      status: o.status,
      hasReport: !!(o.findings || o.impression),
      dateOrdered: o.createdAt,
      performedAt: o.performedAt,
      orderedBy: {
        id: o.orderedByStaff.id,
        name: o.orderedByStaff.name,
      },
      deletedAt: o.deletedAt ?? null,
      deletionReason: o.deletionReason ?? null,
    })),
    page,
    limit,
    total,
  };
};

export const orderImaging = async (
  patientId: string,
  data: any,
  staffId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = toId(staffId, 'staff id');

  const [patient, staff] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: pid },
      select: { id: true, firstName: true, lastName: true, hospitalPatientId: true },
    }),
    prisma.staff.findUnique({
      where: { id: sid },
      select: { id: true, name: true },
    }),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const order = await prisma.imagingOrder.create({
    data: {
      patientId: pid,
      patientName: `${patient.firstName} ${patient.lastName}`,
      medicalRecordNo: patient.hospitalPatientId,
      ...data,
      orderedBy: sid,
      status: 'Ordered',
    },
  });

  return {
    id: order.id,
    patientId: order.patientId,
    patientName: order.patientName,
    modality: order.modality,
    bodyRegion: order.bodyRegion,
    priority: order.priority,
    status: order.status,
    orderedBy: { id: staff.id, name: staff.name },
    createdAt: order.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// List imaging orders for a patient
// ─────────────────────────────────────────────────────────────
export const getImagingOrders = async (
  patientId: string,
  filters: { status?: string; modality?: string; priority?: string } = {},
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
  if (filters.status) where.status = filters.status;
  if (filters.modality) where.modality = filters.modality;
  if (filters.priority) where.priority = filters.priority;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.imagingOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        orderedByStaff: { select: { id: true, name: true, role: true } },
      },
    }),
    prisma.imagingOrder.count({ where }),
  ]);

  return {
    items: items.map((o) => ({
      id: o.id,
      patientId: o.patientId,
      modality: o.modality,
      bodyRegion: o.bodyRegion,
      specificSite: o.specificSite,
      laterality: o.laterality,
      priority: o.priority,
      contrastRequested: o.contrastRequested,
      status: o.status,
      hasReport: !!(o.findings || o.impression),
      dateOrdered: o.createdAt,
      performedAt: o.performedAt,
      orderedBy: {
        id: o.orderedByStaff.id,
        name: o.orderedByStaff.name,
      },
    })),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Get one imaging order
// ─────────────────────────────────────────────────────────────
export const getImagingOrderById = async (
  patientId: string,
  imagingId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');

  const order = await prisma.imagingOrder.findFirst({
    where: { id: oid, patientId: pid },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true, sex: true,
          dateOfBirth: true, hospitalPatientId: true,
        },
      },
      orderedByStaff: { select: { id: true, name: true, role: true, email: true } },
      updatedByAdmin: { select: { id: true, name: true } },
    },
  });

  if (!order) throw new ApiError(404, 'Imaging order not found');

  return {
    id: order.id,
    patientId: order.patientId,
    patientName:
      order.patientName ??
      `${order.patient.firstName} ${order.patient.lastName}`,
    medicalRecordNo: order.medicalRecordNo ?? order.patient.hospitalPatientId,
    age: order.patient.age,
    sex: order.patient.sex,
    dateOfBirth: order.patient.dateOfBirth,

    hospital: order.hospital,
    department: order.department,

    provisionalDiagnosis: order.provisionalDiagnosis,
    presentingSymptoms: order.presentingSymptoms,
    medicalHistory: order.medicalHistory,
    previousImaging: order.previousImaging,
    previousImagingDetails: order.previousImagingDetails,

    modality: order.modality,
    modalityOtherText: order.modalityOtherText,
    bodyRegion: order.bodyRegion,
    bodyRegionOtherText: order.bodyRegionOtherText,
    laterality: order.laterality,
    contrastRequested: order.contrastRequested,

    specificSite: order.specificSite,
    protocolViews: order.protocolViews,
    specialClinicalQuestion: order.specialClinicalQuestion,

    previousContrastReaction: order.previousContrastReaction,
    previousContrastReactionDetails: order.previousContrastReactionDetails,
    knownAllergies: order.knownAllergies,
    creatinine: order.creatinine,
    egfr: order.egfr,
    otherRelevantMedicationOrCondition: order.otherRelevantMedicationOrCondition,

    pregnancyStatus: order.pregnancyStatus,
    implantedMedicalDevice: order.implantedMedicalDevice,
    deviceImplantDetails: order.deviceImplantDetails,
    metallicForeignBody: order.metallicForeignBody,
    otherSafetyConsiderations: order.otherSafetyConsiderations,

    preparation: order.preparation,
    preparationInstructions: order.preparationInstructions,

    priority: order.priority,
    reasonForUrgency: order.reasonForUrgency,

    clinicianName: order.clinicianName,
    clinicianDepartment: order.clinicianDepartment,
    clinicianLicenseNo: order.clinicianLicenseNo,
    clinicianContact: order.clinicianContact,

    examinationPerformed: order.examinationPerformed,
    performedModality: order.performedModality,
    performedProtocol: order.performedProtocol,
    performedContrast: order.performedContrast,
    technologistName: order.technologistName,
    radiologistName: order.radiologistName,
    performedAt: order.performedAt,
    imageQuality: order.imageQuality,

    findings: order.findings,
    impression: order.impression,
    recommendation: order.recommendation,
    reportDate: order.reportDate,

    status: order.status,

    orderedBy: {
      id: order.orderedByStaff.id,
      name: order.orderedByStaff.name,
      role: order.orderedByStaff.role,
      email: order.orderedByStaff.email,
    },

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update imaging report — flat fields now, not a nested JSON
// ─────────────────────────────────────────────────────────────
export const updateImagingReport = async (
  patientId: string,
  imagingId: string,
  reportData: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');
  const aid = toId(adminId, 'admin id');

  const existing = await prisma.imagingOrder.findFirst({
    where: { id: oid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Imaging order not found');

  const updated = await prisma.imagingOrder.update({
    where: { id: oid },
    data: {
      findings: reportData.findings,
      impression: reportData.impression,
      recommendation: reportData.recommendation ?? null,
      reportDate: reportData.reportDate
        ? new Date(reportData.reportDate)
        : new Date(),
      status: 'Completed',
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    findings: updated.findings,
    impression: updated.impression,
    recommendation: updated.recommendation,
    reportDate: updated.reportDate,
    updatedAt: updated.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Record imaging department use (Section 10)
// ─────────────────────────────────────────────────────────────
export const recordImagingPerformed = async (
  patientId: string,
  imagingId: string,
  departmentData: any,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');
  const aid = toId(adminId, 'admin id');

  const existing = await prisma.imagingOrder.findFirst({
    where: { id: oid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Imaging order not found');

  const updated = await prisma.imagingOrder.update({
    where: { id: oid },
    data: {
      examinationPerformed: true,
      performedModality: departmentData.performedModality,
      performedProtocol: departmentData.performedProtocol,
      performedContrast: departmentData.performedContrast ?? 'None',
      technologistName: departmentData.technologistName,
      radiologistName: departmentData.radiologistName,
      performedAt: departmentData.performedAt
        ? new Date(departmentData.performedAt)
        : new Date(),
      imageQuality: departmentData.imageQuality,
    },
  });

  return {
    id: updated.id,
    examinationPerformed: updated.examinationPerformed,
    performedAt: updated.performedAt,
    imageQuality: updated.imageQuality,
  };
};

// ─────────────────────────────────────────────────────────────
// Update status
// ─────────────────────────────────────────────────────────────
export const updateImagingStatus = async (
  patientId: string,
  imagingId: string,
  status: 'Ordered' | 'Completed' | 'Cancelled',
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');
  const aid = toId(adminId, 'admin id');

  const existing = await prisma.imagingOrder.findFirst({
    where: { id: oid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Imaging order not found');

  const updated = await prisma.imagingOrder.update({
    where: { id: oid },
    data: { status },
  });

  return {
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Soft delete (admin only)
// ─────────────────────────────────────────────────────────────
export const deleteImagingOrder = async (
  patientId: string,
  imagingId: string,
  adminId: string | number,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');
  const aid = toId(adminId, 'admin id');

  const order = await prisma.imagingOrder.findFirst({
    where: { id: oid, patientId: pid },
  });
  if (!order) throw new ApiError(404, 'Imaging order not found');

  if (order.deletedAt) {
    throw new ApiError(400, 'Imaging order is already deleted');
  }

  const updated = await prisma.imagingOrder.update({
    where: { id: oid },
    data: {
      deletedAt: new Date(),
      deletedBy: aid,
      deletionReason: reason ?? null,
      updatedBy: aid,
    },
  });

  return { id: imagingId, success: true, deletedAt: updated.deletedAt };
};

// ─────────────────────────────────────────────────────────────
// Restore
// ─────────────────────────────────────────────────────────────
export const restoreImagingOrder = async (
  patientId: string,
  imagingId: string,
  adminId: string | number,
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');
  const aid = toId(adminId, 'admin id');

  const order = await prisma.imagingOrder.findFirst({
    where: { id: oid, patientId: pid },
  });
  if (!order) throw new ApiError(404, 'Imaging order not found');
  if (!order.deletedAt) throw new ApiError(400, 'Imaging order is not deleted');

  await prisma.imagingOrder.update({
    where: { id: oid },
    data: {
      deletedAt: null,
      deletedBy: null,
      deletionReason: null,
      updatedBy: aid,
    },
  });

  return { id: imagingId, restored: true };
};

// ═════════════════════════════════════════════════════════════
// RADIOLOGIST QUEUE
//
// These functions power the /imaging/pending-orders and
// /imaging/queue/:id endpoints. They are NOT patient-scoped —
// they operate across all patients so the radiologist can see
// their work queue.
// ═════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// Pending orders — flat list across all patients
// ─────────────────────────────────────────────────────────────
export const getPendingImagingOrders = async (
  page: number = 1,
  limit: number = 100,
) => {
  const where = { status: 'Ordered' as const };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.imagingOrder.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      skip,
      take: limit,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            hospitalPatientId: true,
          },
        },
        orderedByStaff: { select: { id: true, name: true, role: true } },
      },
    }),
    prisma.imagingOrder.count({ where }),
  ]);

  return {
    items: items.map((o) => ({
      id: o.id,
      patientId: o.patient.id,
      patientName: `${o.patient.firstName} ${o.patient.lastName}`,
      patientDisplayId: o.patient.hospitalPatientId,

      modality: o.modality,
      bodyRegion: o.bodyRegion,
      specificSite: o.specificSite,
      provisionalDiagnosis: o.provisionalDiagnosis,
      specialClinicalQuestion: o.specialClinicalQuestion,

      requestingClinician: o.orderedByStaff.name,
      orderedById: o.orderedByStaff.id,

      priority: o.priority,
      dateOrdered: o.createdAt,
      status: o.status,
    })),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Order detail — NOT patient-scoped (used by the queue detail page)
// ─────────────────────────────────────────────────────────────
export const getImagingOrderDetailForQueue = async (imagingId: string) => {
  const oid = toId(imagingId, 'imaging id');

  const order = await prisma.imagingOrder.findUnique({
    where: { id: oid },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          age: true,
          sex: true,
          hospitalPatientId: true,
        },
      },
      orderedByStaff: { select: { id: true, name: true, role: true } },
    },
  });

  if (!order) throw new ApiError(404, 'Imaging order not found');

  return {
    id: order.id,
    patientId: order.patient.id,
    patientName: `${order.patient.firstName} ${order.patient.lastName}`,
    patientDisplayId: order.patient.hospitalPatientId,
    age: order.patient.age,
    sex: order.patient.sex,

    modality: order.modality,
    bodyRegion: order.bodyRegion,
    specificSite: order.specificSite,
    laterality: order.laterality,
    provisionalDiagnosis: order.provisionalDiagnosis,
    presentingSymptoms: order.presentingSymptoms,
    specialClinicalQuestion: order.specialClinicalQuestion,

    requestingClinician: order.orderedByStaff.name,
    dateOrdered: order.createdAt,

    priority: order.priority,
    status: order.status,

    findings: order.findings,
    impression: order.impression,
    recommendation: order.recommendation,
    reportDate: order.reportDate,
  };
};

// ─────────────────────────────────────────────────────────────
// Submit report — NOT patient-scoped (used by the queue detail page)
// ─────────────────────────────────────────────────────────────
export const submitImagingReportFromQueue = async (
  imagingId: string,
  data: { findings: string; impression: string; recommendation?: string },
  staffId: string | number,
) => {
  const oid = toId(imagingId, 'imaging id');
  const sid = toId(staffId, 'staff id');

  const order = await prisma.imagingOrder.findUnique({ where: { id: oid } });
  if (!order) throw new ApiError(404, 'Imaging order not found');
  if (order.status === 'Cancelled') {
    throw new ApiError(400, 'Cannot submit a report for a cancelled order');
  }

  const updated = await prisma.imagingOrder.update({
    where: { id: oid },
    data: {
      findings: data.findings,
      impression: data.impression,
      recommendation: data.recommendation ?? null,
      reportDate: new Date(),
      status: 'Completed',
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    findings: updated.findings,
    impression: updated.impression,
    recommendation: updated.recommendation,
    reportDate: updated.reportDate,
  };
};

export default {
  getAllImagingOrders,
  orderImaging,
  getImagingOrders,
  getImagingOrderById,
  updateImagingReport,
  recordImagingPerformed,
  updateImagingStatus,
  deleteImagingOrder,
  restoreImagingOrder,
  // Radiologist queue
  getPendingImagingOrders,
  getImagingOrderDetailForQueue,
  submitImagingReportFromQueue,
};