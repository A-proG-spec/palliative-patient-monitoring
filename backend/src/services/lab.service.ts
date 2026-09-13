import { LaboratoryTest, LabCategory } from '@models/LaboratoryTest.js';
import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const VALID_STATUSES = ['Ordered', 'Completed', 'Cancelled'] as const;
const VALID_PRIORITIES = ['Routine', 'Urgent', 'Emergency'] as const;

// ─────────────────────────────────────────────────────────────
// Shape helpers — keep response DTOs consistent across endpoints
// ─────────────────────────────────────────────────────────────
const populatedPatient = (p: any) => {
  if (!p || typeof p !== 'object') return undefined;
  return {
    id: p._id?.toString() ?? '',
    firstName: p.firstName ?? '',
    lastName: p.lastName ?? '',
    age: p.age ?? null,
    sex: p.sex ?? '',
    dateOfBirth: p.dateOfBirth ?? null,
    patientDisplayId: p.patientDisplayId ?? null,
    hospitalPatientId: p.hospitalPatientId ?? null,
    currentLocation: p.currentLocation ?? null,
  };
};

const populatedStaff = (s: any) => {
  if (!s || typeof s !== 'object') return undefined;
  return {
    id: s._id?.toString() ?? '',
    name: s.name ?? 'Unknown',
    role: s.role ?? undefined,
  };
};

/**
 * Full DTO — used by getLabTestById and after create/update.
 */
const toLabDto = (lab: any) => ({
  id: lab._id.toString(),
  patientId: lab.patientId?._id?.toString() ?? lab.patientId?.toString() ?? '',
  patient: populatedPatient(lab.patientId),

  // Header
  hospitalClinic: lab.hospitalClinic,
  departmentLaboratory: lab.departmentLaboratory,
  requestNo: lab.requestNo,
  dateOfRequest: lab.dateOfRequest,

  // Section 1
  wardClinic: lab.wardClinic,
  physicianRequester: lab.physicianRequester,
  contactExtension: lab.contactExtension,

  // Section 2
  category: lab.category,
  testName: lab.testName,
  otherText: lab.otherText,
  specimenType: lab.specimenType,
  specimenSite: lab.specimenSite,

  // Section 3
  clinicalHistory: lab.clinicalHistory,

  // Section 4
  priority: lab.priority,

  // Section 5
  collectionDate: lab.collectionDate,
  collectionTime: lab.collectionTime,
  receivedDate: lab.receivedDate,
  receivedTime: lab.receivedTime,

  // Core
  dateOrdered: lab.dateOrdered,
  location: lab.location,
  status: lab.status,

  // Result
  datePerformed: lab.datePerformed,
  result: lab.result,
  referenceRange: lab.referenceRange,
  abnormalFlag: lab.abnormalFlag,
  resultNotes: lab.resultNotes,
  performedBy: lab.performedBy,

  // Links
  admissionId: lab.admissionId?.toString() ?? null,

  // Actors
  orderedBy: populatedStaff(lab.orderedBy),
  updatedBy: populatedStaff(lab.updatedBy),

  // Meta
  createdAt: lab.createdAt,
  updatedAt: lab.updatedAt,
});

/**
 * Lean DTO — used by list endpoints. Keeps payload small.
 */
const toLabListDto = (lab: any) => ({
  id: lab._id.toString(),
  patientId: lab.patientId?._id?.toString() ?? lab.patientId?.toString() ?? '',
  patient: populatedPatient(lab.patientId),

  requestNo: lab.requestNo,
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

  wardClinic: lab.wardClinic,
  physicianRequester: lab.physicianRequester,

  orderedBy: populatedStaff(lab.orderedBy),

  createdAt: lab.createdAt,
});

// ─────────────────────────────────────────────────────────────
// Order lab test
// ─────────────────────────────────────────────────────────────
export const orderLabTest = async (
  patientId: string,
  data: {
    // Section 1
    wardClinic?: string;
    physicianRequester: string;
    contactExtension?: string;

    // Section 2
    category: LabCategory;
    testName: string;
    otherText?: string;
    specimenType?: string;
    specimenSite?: string;

    // Section 3
    clinicalHistory?: string;

    // Section 4
    priority?: 'Routine' | 'Urgent' | 'Emergency';

    // Section 5
    collectionDate?: string | Date;
    collectionTime?: string;

    // Core
    dateOrdered?: string | Date;
    location: 'Home' | 'Hospital';

    // Header overrides (rare)
    hospitalClinic?: string;
    departmentLaboratory?: string;

    // Optional links
    admissionId?: string;
  },
  staffId: string,
) => {
  const [patient, staff] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(staffId),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  // Validate required fields the model enforces
  if (!data.physicianRequester?.trim()) {
    throw new ApiError(400, 'Physician/Requester is required');
  }
  if (!data.location) {
    throw new ApiError(400, 'Location is required');
  }
  if (!data.testName?.trim()) {
    throw new ApiError(400, 'Test name is required');
  }
  if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
    throw new ApiError(400, `Invalid priority: ${data.priority}`);
  }

  // Derive location from admissionId if not explicitly set
  const derivedLocation: 'Home' | 'Hospital' =
    data.admissionId ? 'Hospital' : data.location;

  // Auto-fill wardClinic from patient context if not provided
  const derivedWardClinic =
    data.wardClinic ??
    (patient.currentLocation === 'ReferredHospital'
      ? 'Palliative Care Ward'
      : 'Home Care Unit');

  const labTest = await LaboratoryTest.create({
    patientId,
    orderedBy: staffId,

    // Header
    ...(data.hospitalClinic && { hospitalClinic: data.hospitalClinic }),
    ...(data.departmentLaboratory && {
      departmentLaboratory: data.departmentLaboratory,
    }),

    // Section 1
    wardClinic: derivedWardClinic,
    physicianRequester: data.physicianRequester.trim(),
    contactExtension: data.contactExtension,

    // Section 2
    category: data.category,
    testName: data.testName.trim(),
    otherText: data.otherText,
    specimenType: data.specimenType,
    specimenSite: data.specimenSite,

    // Section 3
    clinicalHistory: data.clinicalHistory,

    // Section 4
    priority: data.priority ?? 'Routine',

    // Section 5
    ...(data.collectionDate && {
      collectionDate: new Date(data.collectionDate),
    }),
    collectionTime: data.collectionTime,

    // Core
    dateOrdered: data.dateOrdered ? new Date(data.dateOrdered) : new Date(),
    dateOfRequest: data.dateOrdered ? new Date(data.dateOrdered) : new Date(),
    location: derivedLocation,

    // Links
    ...(data.admissionId && { admissionId: data.admissionId }),

    // Workflow
    status: 'Ordered',
  });

  // Re-fetch with populated fields for the response
  const populated = await LaboratoryTest.findById(labTest._id)
    .populate('patientId', 'firstName lastName age sex dateOfBirth patientDisplayId hospitalPatientId currentLocation')
    .populate('orderedBy', 'name role');

  return toLabDto(populated);
};

// ─────────────────────────────────────────────────────────────
// List lab tests for a patient
// ─────────────────────────────────────────────────────────────
export const getLabTests = async (
  patientId: string,
  status?: string,
  page: number = 1,
  limit: number = 20,
  extras?: {
    category?: LabCategory;
    priority?: 'Routine' | 'Urgent' | 'Emergency';
  },
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const filter: Record<string, unknown> = { patientId };

  if (status) {
    if (!VALID_STATUSES.includes(status as any)) {
      throw new ApiError(400, `Invalid status: ${status}`);
    }
    filter.status = status;
  }

  if (extras?.category) filter.category = extras.category;
  if (extras?.priority) filter.priority = extras.priority;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    LaboratoryTest.find(filter)
      .sort({ priority: -1, dateOrdered: -1 }) // urgent first, then newest
      .skip(skip)
      .limit(limit)
      .populate('patientId', 'firstName lastName age sex dateOfBirth patientDisplayId hospitalPatientId currentLocation')
      .populate('orderedBy', 'name role'),
    LaboratoryTest.countDocuments(filter),
  ]);

  return {
    items: items.map(toLabListDto),
    page,
    limit,
    total,
  };
};

// ─────────────────────────────────────────────────────────────
// Get one lab test
// ─────────────────────────────────────────────────────────────
export const getLabTestById = async (
  patientId: string,
  labId: string,
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const labTest = await LaboratoryTest
    .findOne({ _id: labId, patientId })
    .populate('patientId', 'firstName lastName age sex dateOfBirth patientDisplayId hospitalPatientId currentLocation')
    .populate('orderedBy', 'name role')
    .populate('updatedBy', 'name role');

  if (!labTest) throw new ApiError(404, 'Lab test not found');

  return toLabDto(labTest);
};

// ─────────────────────────────────────────────────────────────
// Update lab result — records who made the change
// ─────────────────────────────────────────────────────────────
export const updateLabResult = async (
  patientId: string,
  labId: string,
  data: {
    datePerformed: string | Date;
    result: string;
    referenceRange?: string;
    abnormalFlag?: 'Low' | 'High' | 'Critical' | 'Normal';
    resultNotes?: string;
    performedBy?: string;
  },
  staffId: string,
) => {
  const [patient, staff] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(staffId),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const labTest = await LaboratoryTest.findOne({ _id: labId, patientId });
  if (!labTest) throw new ApiError(404, 'Lab test not found');

  if (labTest.status === 'Cancelled') {
    throw new ApiError(400, 'Cannot update a cancelled lab test');
  }
  if (labTest.status === 'Completed') {
    throw new ApiError(400, 'Lab test is already completed');
  }

  if (!data.datePerformed) {
    throw new ApiError(400, 'Date performed is required');
  }
  if (!data.result?.trim()) {
    throw new ApiError(400, 'Result is required');
  }

  labTest.datePerformed = new Date(data.datePerformed);
  labTest.result = data.result.trim();
  if (data.referenceRange !== undefined) labTest.referenceRange = data.referenceRange;
  if (data.abnormalFlag !== undefined) labTest.abnormalFlag = data.abnormalFlag;
  if (data.resultNotes !== undefined) labTest.resultNotes = data.resultNotes;
  if (data.performedBy !== undefined) labTest.performedBy = data.performedBy;
  labTest.status = 'Completed';
  labTest.updatedBy = staffId as any;

  await labTest.save();

  const populated = await LaboratoryTest.findById(labTest._id)
    .populate('patientId', 'firstName lastName age sex dateOfBirth patientDisplayId hospitalPatientId currentLocation')
    .populate('orderedBy', 'name role')
    .populate('updatedBy', 'name role');

  return toLabDto(populated);
};

// ─────────────────────────────────────────────────────────────
// Cancel a lab test (before result entry)
// ─────────────────────────────────────────────────────────────
export const cancelLabTest = async (
  patientId: string,
  labId: string,
  staffId: string,
) => {
  const labTest = await LaboratoryTest.findOne({ _id: labId, patientId });
  if (!labTest) throw new ApiError(404, 'Lab test not found');

  if (labTest.status === 'Completed') {
    throw new ApiError(400, 'Cannot cancel a completed lab test');
  }
  if (labTest.status === 'Cancelled') {
    throw new ApiError(400, 'Lab test is already cancelled');
  }

  labTest.status = 'Cancelled';
  labTest.updatedBy = staffId as any;
  await labTest.save();

  const populated = await LaboratoryTest.findById(labTest._id)
    .populate('patientId', 'firstName lastName age sex dateOfBirth patientDisplayId hospitalPatientId currentLocation')
    .populate('orderedBy', 'name role')
    .populate('updatedBy', 'name role');

  return toLabDto(populated);
};

// ─────────────────────────────────────────────────────────────
// Soft delete lab test (admin only)
// ─────────────────────────────────────────────────────────────
export const deleteLabTest = async (
  patientId: string,
  labId: string,
  adminId: string,
  reason?: string,
) => {
  const labTest = await LaboratoryTest.findOne({ _id: labId, patientId });
  if (!labTest) throw new ApiError(404, 'Lab test not found');

  if (labTest.deletedAt) {
    throw new ApiError(400, 'Lab test is already deleted');
  }

  labTest.deletedAt = new Date();
  labTest.deletedBy = adminId as any;
  labTest.deletionReason = reason ?? null;
  labTest.updatedBy = adminId as any;
  await labTest.save();

  return { id: labId, success: true, deletedAt: labTest.deletedAt };
};

// ─────────────────────────────────────────────────────────────
// Restore a soft-deleted lab test (admin only)
// ─────────────────────────────────────────────────────────────
export const restoreLabTest = async (
  patientId: string,
  labId: string,
  adminId: string,
) => {
  const labTest = await LaboratoryTest
    .findOne({ _id: labId, patientId })
    .setOptions({ includeDeleted: true });

  if (!labTest) throw new ApiError(404, 'Lab test not found');
  if (!labTest.deletedAt) {
    throw new ApiError(400, 'Lab test is not deleted');
  }

  labTest.deletedAt = null;
  labTest.deletedBy = null as any;
  labTest.deletionReason = null;
  labTest.updatedBy = adminId as any;
  await labTest.save();

  return { id: labId, restored: true };
};

export default {
  orderLabTest,
  getLabTests,
  getLabTestById,
  updateLabResult,
  cancelLabTest,
  deleteLabTest,
  restoreLabTest,
};