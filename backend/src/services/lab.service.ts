import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import { prisma, prismaBase } from '../lib/prisma.js';
import { resolveStaffAttribution, adminCreatorId } from '@utils/actor.js';
import type { Actor } from '../types/index.js';

const VALID_STATUSES = ['Ordered', 'Completed', 'Cancelled'] as const;
const VALID_PRIORITIES = ['Routine', 'Urgent', 'Emergency'] as const;
const getEnteredBy = (record: any) =>
  record.createdByAdmin
    ? { id: record.createdByAdmin.id, name: record.createdByAdmin.name, type: 'admin' as const }
    : record.orderedByStaff
      ? { id: record.orderedByStaff.id, name: record.orderedByStaff.name, type: 'staff' as const }
      : null;
// ─────────────────────────────────────────────────────────────
// DTO mappers
// ─────────────────────────────────────────────────────────────
const toLabListDto = (lab: any) => ({
  id: lab.id,
  patientId: lab.patientId,
  patient: lab.patient
    ? {
      id: lab.patient.id,
      firstName: lab.patient.firstName,
      lastName: lab.patient.lastName,
      age: lab.patient.age,
      sex: lab.patient.sex,
      dateOfBirth: lab.patient.dateOfBirth,
      hospitalPatientId: lab.patient.hospitalPatientId,
      currentLocation: lab.patient.currentLocation,
    }
    : null,

  hospitalClinic: lab.hospitalClinic,
  departmentLaboratory: lab.departmentLaboratory,
  dateOfRequest: lab.dateOfRequest,

  wardClinic: lab.wardClinic,
  physicianRequester: lab.physicianRequester,
  contactExtension: lab.contactExtension,

  category: lab.category,
  testName: lab.testName,
  specimenType: lab.specimenType,
  specimenSite: lab.specimenSite,

  priority: lab.priority,
  dateOrdered: lab.dateOrdered,
  datePerformed: lab.datePerformed,
  result: lab.result,
  abnormalFlag: lab.abnormalFlag,

  location: lab.location,
  status: lab.status,

  enteredBy: getEnteredBy(lab),

  createdAt: lab.createdAt,
});

const toLabDto = (lab: any) => ({
  ...toLabListDto(lab),
  clinicalHistory: lab.clinicalHistory,
  otherText: lab.otherText,
  collectionDate: lab.collectionDate,
  collectionTime: lab.collectionTime,
  receivedDate: lab.receivedDate,
  receivedTime: lab.receivedTime,
  referenceRange: lab.referenceRange,
  resultNotes: lab.resultNotes,
  performedBy: lab.performedBy,
  hospitalAdmissionId: lab.hospitalAdmissionId,
  updatedBy: lab.updatedByAdmin
    ? { id: lab.updatedByAdmin.id, name: lab.updatedByAdmin.name }
    : null,
  labResult: lab.labResult ?? null,
  updatedAt: lab.updatedAt,
});

// ─────────────────────────────────────────────────────────────
// Order lab test
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// GET ALL lab tests for a patient
// ─────────────────────────────────────────────────────────────
export const getAllLabTests = async (
  patientId: string,
  status?: string,
  page: number = 1,
  limit: number = 20,
  extras?: {
    category?: string;
    priority?: string;
    includeDeleted?: boolean;
  },
) => {
  const pid = toId(patientId, 'patient id');
  const includeDeleted = extras?.includeDeleted === true;
  const client = includeDeleted ? prismaBase : prisma;

  const patient = await prisma.patient.findUnique({
    where: { id: pid },
    select: { id: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const where: any = { patientId: pid };
  if (status) where.status = status;
  if (extras?.category) where.category = extras.category;
  if (extras?.priority) where.priority = extras.priority;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    client.laboratoryTest.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dateOrdered: 'desc' }],
      skip,
      take: limit,
      include: {
        patient: {
          select: {
            id: true, firstName: true, lastName: true, age: true, sex: true,
            dateOfBirth: true, hospitalPatientId: true, currentLocation: true,
          },
        },
        orderedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    client.laboratoryTest.count({ where }),
  ]);

  return {
    items: items.map((lab) => ({
      ...toLabListDto(lab),
      deletedAt: lab.deletedAt ?? null,
      deletionReason: lab.deletionReason ?? null,
    })),
    page,
    limit,
    total,
  };
};
export const orderLabTest = async (
  patientId: string,
  data: any,
  actor: Actor,
) => {
  const pid = toId(patientId, 'patient id');
  const sid = resolveStaffAttribution(actor, data.actingAsStaffId);

  const [patient, staff] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: pid },
      select: { id: true, currentLocation: true },
    }),
    sid
      ? prisma.staff.findUnique({ where: { id: sid }, select: { id: true } })
      : Promise.resolve(null),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (sid && !staff) throw new ApiError(404, 'Staff member not found');

  if (!data.physicianRequester?.trim()) {
    throw new ApiError(400, 'Physician/Requester is required');
  }
  if (!data.testName?.trim()) {
    throw new ApiError(400, 'Test name is required');
  }
  if (!data.location) {
    throw new ApiError(400, 'Location is required');
  }
  if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
    throw new ApiError(400, `Invalid priority: ${data.priority}`);
  }

  const derivedLocation: 'Home' | 'Hospital' =
    data.hospitalAdmissionId ? 'Hospital' : data.location;

  const derivedWardClinic =
    data.wardClinic ??
    (patient.currentLocation === 'ReferredHospital'
      ? 'Palliative Care Ward'
      : 'Home Care Unit');

  const labTest = await prisma.laboratoryTest.create({
    data: {
      patientId: pid,
      orderedBy: sid ?? null,
      createdByAdminId: adminCreatorId(actor),

      ...(data.hospitalClinic && { hospitalClinic: data.hospitalClinic }),
      ...(data.departmentLaboratory && {
        departmentLaboratory: data.departmentLaboratory,
      }),

      wardClinic: derivedWardClinic,
      physicianRequester: data.physicianRequester.trim(),
      contactExtension: data.contactExtension,

      category: data.category,
      testName: data.testName.trim(),
      otherText: data.otherText,
      specimenType: data.specimenType,
      specimenSite: data.specimenSite,

      clinicalHistory: data.clinicalHistory,

      priority: data.priority ?? 'Routine',

      ...(data.collectionDate && {
        collectionDate: new Date(data.collectionDate),
      }),
      collectionTime: data.collectionTime,

      dateOrdered: data.dateOrdered ? new Date(data.dateOrdered) : new Date(),
      dateOfRequest: data.dateOrdered ? new Date(data.dateOrdered) : new Date(),
      location: derivedLocation,

      ...(data.hospitalAdmissionId && {
        hospitalAdmissionId: toId(data.hospitalAdmissionId, 'admission id'),
      }),

      status: 'Ordered',
    },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true, sex: true,
          dateOfBirth: true, hospitalPatientId: true, currentLocation: true,
        },
      },
      orderedByStaff: { select: { id: true, name: true } },
      createdByAdmin: { select: { id: true, name: true } },
    },
  });

  return toLabDto(labTest);
};

// ─────────────────────────────────────────────────────────────
// List lab tests for a patient
// ─────────────────────────────────────────────────────────────
export const getLabTests = async (
  patientId: string,
  status?: string,
  page: number = 1,
  limit: number = 20,
  extras?: { category?: string; priority?: string },
) => {
  const pid = toId(patientId, 'patient id');

  const patient = await prisma.patient.findUnique({
    where: { id: pid },
    select: { id: true },
  });
  if (!patient) throw new ApiError(404, 'Patient not found');

  const where: any = { patientId: pid };
  if (status) {
    if (!VALID_STATUSES.includes(status as any)) {
      throw new ApiError(400, `Invalid status: ${status}`);
    }
    where.status = status;
  }
  if (extras?.category) where.category = extras.category;
  if (extras?.priority) where.priority = extras.priority;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.laboratoryTest.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dateOrdered: 'desc' }],
      skip,
      take: limit,
      include: {
        patient: {
          select: {
            id: true, firstName: true, lastName: true, age: true, sex: true,
            dateOfBirth: true, hospitalPatientId: true, currentLocation: true,
          },
        },
        orderedByStaff: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.laboratoryTest.count({ where }),
  ]);

  return {
    items: items.map(toLabListDto),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Get one lab test (with its LabResult, if any)
// ─────────────────────────────────────────────────────────────
export const getLabTestById = async (
  patientId: string,
  labId: string,
) => {
  const pid = toId(patientId, 'patient id');
  const lid = toId(labId, 'lab id');

  const labTest = await prisma.laboratoryTest.findFirst({
    where: { id: lid, patientId: pid },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true, sex: true,
          dateOfBirth: true, hospitalPatientId: true, currentLocation: true,
        },
      },
      orderedByStaff: { select: { id: true, name: true } },
      createdByAdmin: { select: { id: true, name: true } },
      updatedByAdmin: { select: { id: true, name: true } },
      labResult: true,
    },
  });

  if (!labTest) throw new ApiError(404, 'Lab test not found');

  return toLabDto(labTest);
};

// ─────────────────────────────────────────────────────────────
// Update lab result
//
// Upserts the LabResult row (1:1 with LaboratoryTest via labTestOrderId)
// and flips the header to Completed.
// ─────────────────────────────────────────────────────────────
export const updateLabResult = async (
  patientId: string,
  labId: string,
  data: any,
  _actor: Actor,
) => {
  const pid = toId(patientId, 'patient id');
  const lid = toId(labId, 'lab id');

  const labTest = await prisma.laboratoryTest.findFirst({
    where: { id: lid, patientId: pid },
  });
  if (!labTest) throw new ApiError(404, 'Lab test not found');

  if (labTest.status === 'Cancelled') {
    throw new ApiError(400, 'Cannot update a cancelled lab test');
  }

  // Result header fields on LaboratoryTest
  const headerUpdate: any = {
    status: 'Completed',
  };
  if (data.datePerformed) headerUpdate.datePerformed = new Date(data.datePerformed);
  if (data.result !== undefined) headerUpdate.result = data.result;
  if (data.referenceRange !== undefined) headerUpdate.referenceRange = data.referenceRange;
  if (data.abnormalFlag !== undefined) headerUpdate.abnormalFlag = data.abnormalFlag;
  if (data.resultNotes !== undefined) headerUpdate.resultNotes = data.resultNotes;
  if (data.performedBy !== undefined) headerUpdate.performedBy = data.performedBy;
  if (data.receivedDate) headerUpdate.receivedDate = new Date(data.receivedDate);
  if (data.receivedTime !== undefined) headerUpdate.receivedTime = data.receivedTime;

  // Fields that go on LabResult (everything else in the payload)
  const labResultFields = { ...data };
  delete labResultFields.datePerformed;
  delete labResultFields.result;
  delete labResultFields.referenceRange;
  delete labResultFields.abnormalFlag;
  delete labResultFields.resultNotes;
  delete labResultFields.performedBy;
  delete labResultFields.receivedDate;
  delete labResultFields.receivedTime;
  delete labResultFields.actingAsStaffId;

  // Coerce date strings on LabResult
  for (const key of ['collectedAt', 'reportedAt', 'verifiedAt']) {
    if (labResultFields[key]) labResultFields[key] = new Date(labResultFields[key]);
  }

  await prisma.$transaction(async (tx) => {
    await tx.laboratoryTest.update({
      where: { id: lid },
      data: headerUpdate,
    });

    await tx.labResult.upsert({
      where: { labTestOrderId: lid },
      update: labResultFields,
      create: {
        labTestOrderId: lid,
        ...labResultFields,
      },
    });
  });

  const populated = await prisma.laboratoryTest.findUnique({
    where: { id: lid },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true, sex: true,
          dateOfBirth: true, hospitalPatientId: true, currentLocation: true,
        },
      },
      orderedByStaff: { select: { id: true, name: true } },
      createdByAdmin: { select: { id: true, name: true } },
      updatedByAdmin: { select: { id: true, name: true } },
      labResult: true,
    },
  });

  return toLabDto(populated);
};

// ─────────────────────────────────────────────────────────────
// Cancel lab test
// ─────────────────────────────────────────────────────────────
export const cancelLabTest = async (
  patientId: string,
  labId: string,
  _actor: Actor,
) => {
  const pid = toId(patientId, 'patient id');
  const lid = toId(labId, 'lab id');

  const labTest = await prisma.laboratoryTest.findFirst({
    where: { id: lid, patientId: pid },
  });
  if (!labTest) throw new ApiError(404, 'Lab test not found');

  if (labTest.status === 'Completed') {
    throw new ApiError(400, 'Cannot cancel a completed lab test');
  }
  if (labTest.status === 'Cancelled') {
    throw new ApiError(400, 'Lab test is already cancelled');
  }

  const updated = await prisma.laboratoryTest.update({
    where: { id: lid },
    data: { status: 'Cancelled' },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, age: true, sex: true,
          dateOfBirth: true, hospitalPatientId: true, currentLocation: true,
        },
      },
      orderedByStaff: { select: { id: true, name: true } },
      createdByAdmin: { select: { id: true, name: true } },
      updatedByAdmin: { select: { id: true, name: true } },
      labResult: true,
    },
  });

  return toLabDto(updated);
};

// ─────────────────────────────────────────────────────────────
// Soft delete (admin only)
// ─────────────────────────────────────────────────────────────
export const deleteLabTest = async (
  patientId: string,
  labId: string,
  actor: Actor,
  reason?: string,
) => {
  const pid = toId(patientId, 'patient id');
  const lid = toId(labId, 'lab id');
  const aid = toId(actor.id, 'admin id');

  const labTest = await prisma.laboratoryTest.findFirst({
    where: { id: lid, patientId: pid },
  });
  if (!labTest) throw new ApiError(404, 'Lab test not found');

  if (labTest.deletedAt) {
    throw new ApiError(400, 'Lab test is already deleted');
  }

  const updated = await prisma.laboratoryTest.update({
    where: { id: lid },
    data: {
      deletedAt: new Date(),
      deletedBy: aid,
      deletionReason: reason ?? null,
      updatedBy: aid,
    },
  });

  return { id: labId, success: true, deletedAt: updated.deletedAt };
};

// ─────────────────────────────────────────────────────────────
// Restore
// ─────────────────────────────────────────────────────────────
export const restoreLabTest = async (
  patientId: string,
  labId: string,
  actor: Actor,
) => {
  const pid = toId(patientId, 'patient id');
  const lid = toId(labId, 'lab id');
  const aid = toId(actor.id, 'admin id');

  const labTest = await prisma.laboratoryTest.findFirst({
    where: { id: lid, patientId: pid },
  });
  if (!labTest) throw new ApiError(404, 'Lab test not found');
  if (!labTest.deletedAt) throw new ApiError(400, 'Lab test is not deleted');

  await prisma.laboratoryTest.update({
    where: { id: lid },
    data: {
      deletedAt: null,
      deletedBy: null,
      deletionReason: null,
      updatedBy: aid,
    },
  });

  return { id: labId, restored: true };
};
// ─────────────────────────────────────────────────────────────
// Lab technician queue — all `Ordered` lab tests across patients
// ─────────────────────────────────────────────────────────────
export const getPendingLabRequests = async (
  page: number = 1,
  limit: number = 100,
) => {
  const where = { status: 'Ordered' as const };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.laboratoryTest.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dateOrdered: 'asc' }],
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
    prisma.laboratoryTest.count({ where }),
  ]);

  return {
    items: items.map((l) => ({
      id: l.id,
      patientId: l.patient.id,
      patientName: `${l.patient.firstName} ${l.patient.lastName}`,
      patientDisplayId: l.patient.hospitalPatientId,

      testName: l.testName,
      category: l.category,
      specimenType: l.specimenType,
      specimenSite: l.specimenSite,
      clinicalHistory: l.clinicalHistory,

      enteredBy: getEnteredBy(l),

      priority: l.priority,
      dateRequested: l.dateOrdered,
      status: l.status,
    })),
    page,
    limit,
    total,
  };
};

export const getLabRequestById = async (labId: string) => {
  const lid = toId(labId, 'lab id');

  const lab = await prisma.laboratoryTest.findUnique({
    where: { id: lid },
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

  if (!lab) throw new ApiError(404, 'Lab request not found');

  return {
    id: lab.id,
    patientId: lab.patient.id,
    patientName: `${lab.patient.firstName} ${lab.patient.lastName}`,
    // Prefer the real hospital MRN; fall back to a system-generated ID
    patientDisplayId:
      lab.patient.hospitalPatientId ??
      `PAT-${String(lab.patient.id).padStart(4, '0')}`,
    age: lab.patient.age,
    sex: lab.patient.sex,

    testName: lab.testName,
    category: lab.category,
    specimenType: lab.specimenType,
    specimenSite: lab.specimenSite,
    clinicalHistory: lab.clinicalHistory,

    enteredBy: getEnteredBy(lab),
    dateRequested: lab.dateOrdered,

    priority: lab.priority,
    status: lab.status,
    result: lab.result,
    datePerformed: lab.datePerformed,
    performedBy: lab.performedBy,
  };
};

export const enterLabResultFromQueue = async (
  labId: string,
  data: { result: string; datePerformed?: string; performedBy?: string },
  actor: Actor,
) => {
  const lid = toId(labId, 'lab id');

  const lab = await prisma.laboratoryTest.findUnique({ where: { id: lid } });
  if (!lab) throw new ApiError(404, 'Lab request not found');
  if (lab.status === 'Cancelled') {
    throw new ApiError(400, 'Cannot enter a result for a cancelled lab test');
  }

  const updated = await prisma.laboratoryTest.update({
    where: { id: lid },
    data: {
      status: 'Completed',
      result: data.result,
      datePerformed: data.datePerformed ? new Date(data.datePerformed) : new Date(),
      performedBy: data.performedBy ?? (actor.type === 'staff' ? undefined : null),
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    result: updated.result,
    datePerformed: updated.datePerformed,
  };
};

export default {
  getAllLabTests,
  orderLabTest,
  getLabTests,
  getLabTestById,
  updateLabResult,
  cancelLabTest,
  deleteLabTest,
  restoreLabTest,
  getPendingLabRequests,
  getLabRequestById,
  enterLabResultFromQueue
};