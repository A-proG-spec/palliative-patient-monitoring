import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';
import { resolveStaffAttribution, adminCreatorId } from '@utils/actor.js';
import type { Actor } from '../types/index.js';

// ─────────────────────────────────────────────────────────────
// Attribution helpers
// ─────────────────────────────────────────────────────────────

/** Who physically typed the record (staff OR admin). */
const getEnteredBy = (record: any) =>
  record.createdByAdmin
    ? { id: record.createdByAdmin.id, name: record.createdByAdmin.name, type: 'admin' as const }
    : record.orderedByStaff
      ? { id: record.orderedByStaff.id, name: record.orderedByStaff.name, type: 'staff' as const }
      : null;

/**
 * Resolve the ordering clinician with the same fallback chain the
 * medication/patient/referral services use:
 *   staff ordered  → { id: staff.id, name: staff.name, type: 'staff' }
 *   admin ordered  → { id: admin.id, name: admin.name, type: 'admin' }
 *   neither        → null
 *
 * Returned both as an object AND as flat fields so the frontend can
 * read whichever shape it prefers.
 */
const getOrderingClinician = (record: any): {
  orderedById: number | null;
  orderedByName: string | null;
  orderedByType: 'staff' | 'admin' | null;
  orderedBy: { id: number; name: string; type: 'staff' | 'admin' } | null;
} => {
  if (record.orderedByStaff) {
    return {
      orderedById: record.orderedByStaff.id,
      orderedByName: record.orderedByStaff.name,
      orderedByType: 'staff',
      orderedBy: {
        id: record.orderedByStaff.id,
        name: record.orderedByStaff.name,
        type: 'staff',
      },
    };
  }
  if (record.createdByAdmin) {
    return {
      orderedById: record.createdByAdmin.id,
      orderedByName: record.createdByAdmin.name,
      orderedByType: 'admin',
      orderedBy: {
        id: record.createdByAdmin.id,
        name: record.createdByAdmin.name,
        type: 'admin',
      },
    };
  }
  return { orderedById: null, orderedByName: null, orderedByType: null, orderedBy: null };
};

// ═════════════════════════════════════════════════════════════
// PATIENT-SCOPED
// ═════════════════════════════════════════════════════════════

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
        orderedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    client.imagingOrder.count({ where }),
  ]);

  return {
    items: items.map((o) => {
      const clinician = getOrderingClinician(o);
      return {
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

        orderedById: clinician.orderedById,
        orderedByName: clinician.orderedByName,
        orderedByType: clinician.orderedByType,
        orderedBy: clinician.orderedBy,
        requestingClinician: clinician.orderedByName ?? '—',

        enteredBy: getEnteredBy(o),

        deletedAt: o.deletedAt ?? null,
        deletionReason: o.deletionReason ?? null,
      };
    }),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Order imaging
//
// Staff  → orderedBy = their staff id, createdByAdminId = null
// Admin  → orderedBy = null,            createdByAdminId = admin.id
//          (unless actingAsStaffId is sent)
// ─────────────────────────────────────────────────────────────
export const orderImaging = async (
  patientId: string,
  data: any,
  actor: Actor,
) => {
  const pid = toId(patientId, 'patient id');

  const hasActingAsStaffId =
    data.actingAsStaffId !== undefined &&
    data.actingAsStaffId !== null &&
    data.actingAsStaffId !== '';

  const sid = actor.type === 'staff' || hasActingAsStaffId
    ? resolveStaffAttribution(actor, data.actingAsStaffId)
    : undefined;

  const [patient, staff] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: pid },
      select: { id: true, firstName: true, lastName: true, hospitalPatientId: true },
    }),
    sid !== undefined
      ? prisma.staff.findUnique({ where: { id: sid }, select: { id: true, name: true } })
      : Promise.resolve(null),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (sid !== undefined && !staff) throw new ApiError(404, 'Staff member not found');

  const { actingAsStaffId: _actingAsStaffId, ...orderData } = data;

  const order = await prisma.imagingOrder.create({
    data: {
      patientId: pid,
      patientName: `${patient.firstName} ${patient.lastName}`,
      medicalRecordNo: patient.hospitalPatientId,
      ...orderData,
      orderedBy: sid ?? null,
      createdByAdminId: adminCreatorId(actor),
      status: 'Ordered',
    },
    include: {
      orderedByStaff: { select: { id: true, name: true } },
      createdByAdmin: { select: { id: true, name: true } },
    },
  });

  const clinician = getOrderingClinician(order);

  return {
    id: order.id,
    patientId: order.patientId,
    patientName: order.patientName,
    modality: order.modality,
    bodyRegion: order.bodyRegion,
    priority: order.priority,
    status: order.status,

    orderedById: clinician.orderedById,
    orderedByName: clinician.orderedByName,
    orderedByType: clinician.orderedByType,
    orderedBy: clinician.orderedBy,
    requestingClinician: clinician.orderedByName ?? '—',

    enteredBy: getEnteredBy(order),
    createdAt: order.createdAt,
  };
};

// ═════════════════════════════════════════════════════════════
// Radiologist queue — completed orders (status: 'Completed')
// ═════════════════════════════════════════════════════════════
export const getCompletedImagingOrders = async (
  page: number = 1,
  limit: number = 100,
) => {
  const where = { status: 'Completed' as const };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.imagingOrder.findMany({
      where,
      orderBy: { reportDate: 'desc' },
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
        orderedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.imagingOrder.count({ where }),
  ]);

  return {
    items: items.map((o) => {
      const clinician = getOrderingClinician(o);
      return {
        id: o.id,
        patientId: o.patient.id,
        patientName: `${o.patient.firstName} ${o.patient.lastName}`,
        patientDisplayId: o.patient.hospitalPatientId,

        modality: o.modality,
        bodyRegion: o.bodyRegion,
        specificSite: o.specificSite,
        provisionalDiagnosis: o.provisionalDiagnosis,
        specialClinicalQuestion: o.specialClinicalQuestion,

        orderedById: clinician.orderedById,
        orderedByName: clinician.orderedByName,
        orderedByType: clinician.orderedByType,
        orderedBy: clinician.orderedBy,
        requestingClinician: clinician.orderedByName ?? '—',

        enteredBy: getEnteredBy(o),

        priority: o.priority,
        dateOrdered: o.createdAt,
        dateCompleted: o.reportDate,
        status: o.status,

        hasReport: !!(o.findings || o.impression),
      };
    }),
    page,
    limit,
    total,
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
        orderedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.imagingOrder.count({ where }),
  ]);

  return {
    items: items.map((o) => {
      const clinician = getOrderingClinician(o);
      return {
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

        orderedById: clinician.orderedById,
        orderedByName: clinician.orderedByName,
        orderedByType: clinician.orderedByType,
        orderedBy: clinician.orderedBy,
        requestingClinician: clinician.orderedByName ?? '—',

        enteredBy: getEnteredBy(o),
      };
    }),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Get one imaging order (patient-scoped)
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
      orderedByStaff: { select: { id: true, name: true } },
      createdByAdmin: { select: { id: true, name: true } },
      updatedByAdmin: { select: { id: true, name: true } },
    },
  });

  if (!order) throw new ApiError(404, 'Imaging order not found');

  const clinician = getOrderingClinician(order);
  const reportText = [order.findings, order.impression, order.recommendation]
    .filter(Boolean)
    .join('\n\n');

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
    indication: order.provisionalDiagnosis,
    presentingSymptoms: order.presentingSymptoms,
    medicalHistory: order.medicalHistory,
    previousImaging: order.previousImaging,
    previousImagingDetails: order.previousImagingDetails,

    modality: order.modality,
    imagingType: order.modality,
    modalityOtherText: order.modalityOtherText,
    bodyRegion: order.bodyRegion,
    bodyPart: order.bodyRegion,
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

    // Composite alias the frontend can read directly.
    report: (order.findings || order.impression)
      ? {
          findings: order.findings,
          impression: order.impression,
          recommendation: order.recommendation,
          reportDate: order.reportDate,
          reportText,
        }
      : null,

    status: order.status,

    orderedById: clinician.orderedById,
    orderedByName: clinician.orderedByName,
    orderedByType: clinician.orderedByType,
    orderedBy: clinician.orderedBy,
    requestingClinician: clinician.orderedByName ?? '—',

    enteredBy: getEnteredBy(order),

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update imaging report (patient-scoped)
// ─────────────────────────────────────────────────────────────
export const updateImagingReport = async (
  patientId: string,
  imagingId: string,
  reportData: any,
  actor: Actor,          // ← no longer ignored
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');

  const existing = await prisma.imagingOrder.findFirst({
    where: { id: oid, patientId: pid },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Imaging order not found');

  // ── Resolve who is submitting the report so we can attribute it ──
  let radiologistName: string | undefined;
  if (actor.type === 'staff') {
    const staff = await prisma.staff.findUnique({
      where: { id: actor.id },
      select: { name: true },
    });
    radiologistName = staff?.name;
  }

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
      ...(radiologistName ? { radiologistName } : {}),
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    findings: updated.findings,
    impression: updated.impression,
    recommendation: updated.recommendation,
    reportDate: updated.reportDate,
    radiologistName: updated.radiologistName,
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
  _actor: Actor,
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');

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
  _actor: Actor,
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');

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
  actor: Actor,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');
  const aid = toId(actor.id, 'admin id');

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
  actor: Actor,
) => {
  const pid = toId(patientId, 'patient id');
  const oid = toId(imagingId, 'imaging id');
  const aid = toId(actor.id, 'admin id');

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
// RADIOLOGIST QUEUE — NOT patient-scoped
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
        orderedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.imagingOrder.count({ where }),
  ]);

  return {
    items: items.map((o) => {
      const clinician = getOrderingClinician(o);
      return {
        id: o.id,
        patientId: o.patient.id,
        patientName: `${o.patient.firstName} ${o.patient.lastName}`,
        patientDisplayId: o.patient.hospitalPatientId,

        modality: o.modality,
        imagingType: o.modality,
        bodyRegion: o.bodyRegion,
        bodyPart: o.bodyRegion,
        specificSite: o.specificSite,
        provisionalDiagnosis: o.provisionalDiagnosis,
        indication: o.provisionalDiagnosis,
        specialClinicalQuestion: o.specialClinicalQuestion,

        orderedById: clinician.orderedById,
        orderedByName: clinician.orderedByName,
        orderedByType: clinician.orderedByType,
        orderedBy: clinician.orderedBy,
        requestingClinician: clinician.orderedByName ?? '—',

        enteredBy: getEnteredBy(o),

        priority: o.priority,
        dateOrdered: o.createdAt,
        status: o.status,
      };
    }),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Order detail — NOT patient-scoped (queue detail page)
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
      orderedByStaff: { select: { id: true, name: true } },
      createdByAdmin: { select: { id: true, name: true } },
    },
  });

  if (!order) throw new ApiError(404, 'Imaging order not found');

  const clinician = getOrderingClinician(order);

  // Composite report text — the frontend can render this directly.
  const reportText = [order.findings, order.impression, order.recommendation]
    .filter(Boolean)
    .join('\n\n');

  return {
    id: order.id,
    patientId: order.patient.id,
    patientName: `${order.patient.firstName} ${order.patient.lastName}`,
    patientDisplayId: order.patient.hospitalPatientId,
    age: order.patient.age,
    sex: order.patient.sex,

    // ── Exam identification ──
    modality: order.modality,
    imagingType: order.modality,           // alias
    bodyRegion: order.bodyRegion,
    bodyPart: order.bodyRegion,            // alias
    specificSite: order.specificSite,
    laterality: order.laterality,

    // ── Clinical context ──
    provisionalDiagnosis: order.provisionalDiagnosis,
    indication: order.provisionalDiagnosis, // alias
    presentingSymptoms: order.presentingSymptoms,
    clinicalHistory: order.medicalHistory,
    specialClinicalQuestion: order.specialClinicalQuestion,
    notes: order.otherRelevantMedicationOrCondition ?? null,

    // ── Ordering clinician (all shapes) ──
    orderedById: clinician.orderedById,
    orderedByName: clinician.orderedByName,
    orderedByType: clinician.orderedByType,
    orderedBy: clinician.orderedBy,
    requestingClinician: clinician.orderedByName ?? '—',
    enteredBy: getEnteredBy(order),

    dateOrdered: order.createdAt,
    priority: order.priority,
    status: order.status,

    // ── Report (flat fields, matching the Prisma model) ──
    findings: order.findings,
    impression: order.impression,
    recommendation: order.recommendation,
    reportDate: order.reportDate,

    // ── Composite alias so the frontend "Report" card can
    //    render without branching on field names. ──
    report: (order.findings || order.impression)
      ? {
          findings: order.findings,
          impression: order.impression,
          recommendation: order.recommendation,
          reportDate: order.reportDate,
          reportText,
        }
      : null,
  };
};

// ─────────────────────────────────────────────────────────────
// Submit report — NOT patient-scoped (queue detail page)
// ─────────────────────────────────────────────────────────────
export const submitImagingReportFromQueue = async (
  imagingId: string,
  data: {
    findings?: string;
    impression?: string;
    recommendation?: string;
    reportText?: string;
  },
  actor: Actor,          // ← no longer ignored
) => {
  const oid = toId(imagingId, 'imaging id');

  const order = await prisma.imagingOrder.findUnique({ where: { id: oid } });
  if (!order) throw new ApiError(404, 'Imaging order not found');
  if (order.status === 'Cancelled') {
    throw new ApiError(400, 'Cannot submit a report for a cancelled order');
  }

  let findings = data.findings;
  let impression = data.impression;

  if (!findings && !impression && data.reportText?.trim()) {
    const text = data.reportText.trim();
    const [first, ...rest] = text.split(/\n\s*\n/);
    findings = first;
    impression = rest.join('\n\n') || first;
  }

  if (!findings && !impression) {
    throw new ApiError(400, 'Report text is required');
  }

  // ── Resolve who is submitting the report so we can attribute it ──
  let radiologistName: string | undefined;
  if (actor.type === 'staff') {
    const staff = await prisma.staff.findUnique({
      where: { id: actor.id },
      select: { name: true },
    });
    radiologistName = staff?.name;
  }

  const updated = await prisma.imagingOrder.update({
    where: { id: oid },
    data: {
      findings: findings ?? null,
      impression: impression ?? null,
      recommendation: data.recommendation ?? null,
      reportDate: new Date(),
      status: 'Completed',
      ...(radiologistName ? { radiologistName } : {}),
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    findings: updated.findings,
    impression: updated.impression,
    recommendation: updated.recommendation,
    reportDate: updated.reportDate,
    radiologistName: updated.radiologistName,
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
  getCompletedImagingOrders,
  // Radiologist queue
  getPendingImagingOrders,
  getImagingOrderDetailForQueue,
  submitImagingReportFromQueue,
};