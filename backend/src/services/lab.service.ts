import { LaboratoryTest } from '@models/LaboratoryTest.js';
import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Order lab test
// ─────────────────────────────────────────────────────────────
export const orderLabTest = async (
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

  const labTest = await LaboratoryTest.create({
    patientId,
    ...data,
    orderedBy: staffId,
  });

  return {
    id: labTest._id.toString(),
    patientId: labTest.patientId.toString(),
    testName: labTest.testName,
    dateOrdered: labTest.dateOrdered,
    location: labTest.location,
    status: 'Ordered',
    orderedBy: {
      id: staff._id.toString(),
      name: staff.name,
    },
    createdAt: labTest.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// List lab tests for a patient
// ─────────────────────────────────────────────────────────────
export const getLabTests = async (
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
    LaboratoryTest.find(filter)
      .sort({ dateOrdered: -1 })
      .skip(skip)
      .limit(limit)
      .populate('orderedBy', 'name'),
    LaboratoryTest.countDocuments(filter),
  ]);

  return {
    items: items.map((lab) => ({
      id: lab._id.toString(),
      testName: lab.testName,
      dateOrdered: lab.dateOrdered,
      datePerformed: lab.datePerformed,
      result: lab.result,
      location: lab.location,
      status: lab.status,
      orderedBy: {
        id: (lab.orderedBy as any)?._id?.toString() || '',
        name: (lab.orderedBy as any)?.name || 'Unknown',
      },
      createdAt: lab.createdAt,
    })),
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
    .populate('orderedBy', 'name');

  if (!labTest) throw new ApiError(404, 'Lab test not found');

  return {
    id: labTest._id.toString(),
    patientId: labTest.patientId.toString(),
    testName: labTest.testName,
    dateOrdered: labTest.dateOrdered,
    datePerformed: labTest.datePerformed,
    result: labTest.result,
    location: labTest.location,
    status: labTest.status,
    orderedBy: {
      id: (labTest.orderedBy as any)?._id?.toString() || '',
      name: (labTest.orderedBy as any)?.name || 'Unknown',
    },
    visitId: labTest.visitId?.toString(),
    admissionId: labTest.admissionId?.toString(),
    createdAt: labTest.createdAt,
    updatedAt: labTest.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update lab result — records who made the change
// ─────────────────────────────────────────────────────────────
export const updateLabResult = async (
  patientId: string,
  labId: string,
  data: any,
  adminId: string,
) => {
  const [patient, admin] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(adminId),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!admin) throw new ApiError(404, 'Staff member not found');

  const labTest = await LaboratoryTest.findOne({ _id: labId, patientId });
  if (!labTest) throw new ApiError(404, 'Lab test not found');

  if (labTest.status === 'Completed') {
    throw new ApiError(400, 'Lab test is already completed');
  }

  labTest.datePerformed = new Date(data.datePerformed);
  labTest.result = data.result;
  labTest.status = 'Completed';
  labTest.updatedBy = adminId as any;   // ← audit
  await labTest.save();

  return {
    id: labTest._id.toString(),
    patientId: labTest.patientId.toString(),
    testName: labTest.testName,
    dateOrdered: labTest.dateOrdered,
    datePerformed: labTest.datePerformed,
    result: labTest.result,
    location: labTest.location,
    status: labTest.status,
    orderedBy: {
      id: admin._id.toString(),
      name: admin.name,
    },
    updatedAt: labTest.updatedAt,
  };
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
  labTest.deletionReason = reason;
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
  labTest.deletionReason = undefined;
  labTest.updatedBy = adminId as any;
  await labTest.save();

  return { id: labId, restored: true };
};

export default {
  orderLabTest,
  getLabTests,
  getLabTestById,
  updateLabResult,
  deleteLabTest,
  restoreLabTest,
};