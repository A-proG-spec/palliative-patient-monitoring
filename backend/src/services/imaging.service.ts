import { ImagingOrder } from '@models/ImagingOrder.js';
import { Patient } from '@models/Patient.js';
import { Staff } from '@models/Staff.js';
import { ApiError } from '@utils/ApiError.js';

// ─────────────────────────────────────────────────────────────
// Order imaging
// ─────────────────────────────────────────────────────────────
export const orderImaging = async (
  patientId: string,
  data: any,
  staffId: string
) => {
  const [patient, staff] = await Promise.all([
    Patient.findById(patientId),
    Staff.findById(staffId),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const order = await ImagingOrder.create({
    patientId,
    // Snapshot patient identity at order time
    patientName: `${patient.firstName} ${patient.lastName}`,
    medicalRecordNo: patient.patientDisplayId,
    ...data,
    orderedBy: staffId,
    status: 'Ordered',
  });

  return {
    id: order._id.toString(),
    patientId: order.patientId.toString(),
    patientName: order.patientName,
    modality: order.modality,
    bodyRegion: order.bodyRegion,
    priority: order.priority,
    status: order.status,
    orderedBy: {
      id: staff._id.toString(),
      name: staff.name,
    },
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
  limit: number = 20
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const query: any = { patientId };
  if (filters.status) query.status = filters.status;
  if (filters.modality) query.modality = filters.modality;
  if (filters.priority) query.priority = filters.priority;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ImagingOrder.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('orderedBy', 'name role'),
    ImagingOrder.countDocuments(query),
  ]);

  return {
    items: items.map((o) => ({
      id: o._id.toString(),
      patientId: o.patientId.toString(),
      modality: o.modality,
      bodyRegion: o.bodyRegion,
      specificSite: o.specificSite,
      laterality: o.laterality,
      priority: o.priority,
      contrastRequested: o.contrastRequested,
      status: o.status,
      hasReport: !!(o.report && o.report.findings),
      dateOrdered: o.createdAt,
      performedAt: o.performedAt,
      orderedBy: {
        id: (o.orderedBy as any)?._id?.toString() || '',
        name: (o.orderedBy as any)?.name || 'Unknown',
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
  imagingId: string
) => {
  const order = await ImagingOrder.findOne({ _id: imagingId, patientId })
    .populate('patientId', 'firstName lastName patientDisplayId age sex dateOfBirth')
    .populate('orderedBy', 'name role email');

  if (!order) throw new ApiError(404, 'Imaging order not found');

  const p = order.patientId as any;

  return {
    id: order._id.toString(),
    patientId: p?._id?.toString(),
    patientName:
      order.patientName || `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim(),
    medicalRecordNo: order.medicalRecordNo || p?.patientDisplayId,
    age: p?.age,
    sex: p?.sex,
    dateOfBirth: p?.dateOfBirth,

    // Section 2
    provisionalDiagnosis: order.provisionalDiagnosis,
    presentingSymptoms: order.presentingSymptoms,
    medicalHistory: order.medicalHistory,
    previousImaging: order.previousImaging,
    previousImagingDetails: order.previousImagingDetails,

    // Section 3
    modality: order.modality,
    modalityOtherText: order.modalityOtherText,
    bodyRegion: order.bodyRegion,
    bodyRegionOtherText: order.bodyRegionOtherText,
    laterality: order.laterality,
    contrastRequested: order.contrastRequested,

    // Section 4
    specificSite: order.specificSite,
    protocolViews: order.protocolViews,
    specialClinicalQuestion: order.specialClinicalQuestion,

    // Section 5
    previousContrastReaction: order.previousContrastReaction,
    previousContrastReactionDetails: order.previousContrastReactionDetails,
    knownAllergies: order.knownAllergies,
    creatinine: order.creatinine,
    egfr: order.egfr,
    otherRelevantMedicationOrCondition: order.otherRelevantMedicationOrCondition,

    // Section 6
    pregnancyStatus: order.pregnancyStatus,
    implantedMedicalDevice: order.implantedMedicalDevice,
    deviceImplantDetails: order.deviceImplantDetails,
    metallicForeignBody: order.metallicForeignBody,
    otherSafetyConsiderations: order.otherSafetyConsiderations,

    // Section 7
    preparation: order.preparation,
    preparationInstructions: order.preparationInstructions,

    // Section 8
    priority: order.priority,
    reasonForUrgency: order.reasonForUrgency,

    // Section 9
    clinicianName: order.clinicianName,
    clinicianDepartment: order.clinicianDepartment,
    clinicianLicenseNo: order.clinicianLicenseNo,
    clinicianContact: order.clinicianContact,
    clinicianSignature: order.clinicianSignature,
    clinicianSignedAt: order.clinicianSignedAt,

    // Section 10
    examinationPerformed: order.examinationPerformed,
    performedModality: order.performedModality,
    performedProtocol: order.performedProtocol,
    performedContrast: order.performedContrast,
    technologistName: order.technologistName,
    radiologistName: order.radiologistName,
    performedAt: order.performedAt,
    imageQuality: order.imageQuality,

    // Report
    report: order.report,

    status: order.status,

    orderedBy: order.orderedBy
      ? {
          id: (order.orderedBy as any)._id.toString(),
          name: (order.orderedBy as any).name,
          role: (order.orderedBy as any).role,
          email: (order.orderedBy as any).email,
        }
      : null,

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Update imaging report (finalizes order)
// ─────────────────────────────────────────────────────────────
export const updateImagingReport = async (
  patientId: string,
  imagingId: string,
  reportData: any,
  staffId: string
) => {
  const order = await ImagingOrder.findOne({ _id: imagingId, patientId });
  if (!order) throw new ApiError(404, 'Imaging order not found');

  order.report = {
    reportNo: reportData.reportNo,
    findings: reportData.findings,
    impression: reportData.impression,
    recommendations: reportData.recommendations,
    reportingPhysician: reportData.reportingPhysician,
    signature: reportData.signature,
    reportDate: reportData.reportDate ? new Date(reportData.reportDate) : new Date(),
    hospitalDepartmentStamp: reportData.hospitalDepartmentStamp,
  };
  order.status = 'Completed';
  await order.save();

  return {
    id: order._id.toString(),
    status: order.status,
    report: order.report,
    updatedAt: order.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Record imaging department use (Section 10)
// ─────────────────────────────────────────────────────────────
export const recordImagingPerformed = async (
  patientId: string,
  imagingId: string,
  departmentData: any,
  staffId: string
) => {
  const order = await ImagingOrder.findOne({ _id: imagingId, patientId });
  if (!order) throw new ApiError(404, 'Imaging order not found');

  order.examinationPerformed = true;
  order.performedModality = departmentData.performedModality;
  order.performedProtocol = departmentData.performedProtocol;
  order.performedContrast = departmentData.performedContrast;
  order.technologistName = departmentData.technologistName;
  order.radiologistName = departmentData.radiologistName;
  order.performedAt = departmentData.performedAt
    ? new Date(departmentData.performedAt)
    : new Date();
  order.imageQuality = departmentData.imageQuality;

  await order.save();

  return {
    id: order._id.toString(),
    examinationPerformed: order.examinationPerformed,
    performedAt: order.performedAt,
    imageQuality: order.imageQuality,
  };
};

// ─────────────────────────────────────────────────────────────
// Update status (Ordered ⇄ Completed ⇄ Cancelled)
// ─────────────────────────────────────────────────────────────
export const updateImagingStatus = async (
  patientId: string,
  imagingId: string,
  status: 'Ordered' | 'Completed' | 'Cancelled'
) => {
  const order = await ImagingOrder.findOne({ _id: imagingId, patientId });
  if (!order) throw new ApiError(404, 'Imaging order not found');

  order.status = status;
  await order.save();

  return {
    id: order._id.toString(),
    status: order.status,
    updatedAt: order.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Delete (admin-only, only if not yet completed)
// ─────────────────────────────────────────────────────────────
export const deleteImagingOrder = async (
  patientId: string,
  imagingId: string
) => {
  const order = await ImagingOrder.findOne({ _id: imagingId, patientId });
  if (!order) throw new ApiError(404, 'Imaging order not found');

  if (order.status === 'Completed') {
    throw new ApiError(400, 'Cannot delete a completed imaging order');
  }

  await order.deleteOne();
  return { id: imagingId, success: true };
};

export default {
  orderImaging,
  getImagingOrders,
  getImagingOrderById,
  updateImagingReport,
  recordImagingPerformed,
  updateImagingStatus,
  deleteImagingOrder,
};