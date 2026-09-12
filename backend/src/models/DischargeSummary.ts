import mongoose, { Schema, Document } from 'mongoose';

// ─────────────────────────────────────────────────────────────
// Sub-document types
// ─────────────────────────────────────────────────────────────

export type DischargeSymptomSeverity = 'None' | 'Mild' | 'Moderate' | 'Severe';

export interface IDischargeSymptomRow {
  severity: DischargeSymptomSeverity;
  managementNotes: string;
}

export interface IDischargeMedRow {
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  purpose: string;
  instructions: string;
}

// ─────────────────────────────────────────────────────────────
// Main document
// ─────────────────────────────────────────────────────────────

export interface IDischargeSummary extends Document {
  // ── Relationships ──
  patientId: mongoose.Types.ObjectId;         // → Patient
  admissionId?: mongoose.Types.ObjectId;      // → HospitalAdmission (the admission being closed)

  // ── Header ──
  hospitalName: string;
  palliativeCareUnit: string;
  dateOfAdmission?: string;                   // YYYY-MM-DD
  dateOfDischarge: string;                    // YYYY-MM-DD (required)
  timeOfDischarge?: string;                   // HH:mm
  dischargeType:
    | 'PlannedDischarge'
    | 'Transfer'
    | 'DischargeToHome'
    | 'DischargeToHospice'
    | 'DischargeToLongTermCare'
    | 'TransferToAnotherHospital'
    | 'Other'
    | '';
  dischargeTypeOther?: string;

  // ── Patient Identification (snapshot from Patient) ──
  fullName?: string;
  dateOfBirth?: string;
  age?: string;
  sex?: string;
  address?: string;
  telephone?: string;
  primaryCaregiver?: string;
  caregiverRelationship?: string;
  caregiverTelephone?: string;

  // ── 2. Admission Information ──
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string;                // free text list
  reasonForAdmission?: string;
  referringPhysicianFacility?: string;

  // ── 3. Discharge Diagnosis / Clinical Summary ──
  finalDischargeDiagnosis?: string;
  clinicalProblemsManaged: string[];          // list of problems
  summaryOfClinicalCourse?: string;
  importantInvestigations?: string;

  // ── 4. Condition at Discharge ──
  overallCondition:
    | 'Stable'
    | 'Improved'
    | 'Unchanged'
    | 'Deteriorating'
    | 'RequiresOngoingPalliativeCare'
    | '';
  levelOfConsciousness: 'Alert' | 'Drowsy' | 'Confused' | 'Delirious' | 'Unresponsive' | '';
  functionalStatus: 'Independent' | 'RequiresAssistance' | 'Bedbound' | 'FullyDependent' | '';
  mobility: 'Independent' | 'Assisted' | 'Wheelchair' | 'Bedbound' | '';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal' | 'None' | '';

  // ── 5. Discharge Vital Signs ──
  temperature?: string;
  pulse?: string;
  respiratoryRate?: string;
  bloodPressure?: string;
  oxygenSaturation?: string;
  oxygenRequirement?: string;

  // ── 6. Symptom Status at Discharge ──
  symptoms: Record<string, IDischargeSymptomRow>;   // keyed by symptom name
  painScore?: string;
  painControl: 'WellControlled' | 'PartiallyControlled' | 'PoorlyControlled' | '';

  // ── 7. Discharge Medications ──
  dischargeMedications: IDischargeMedRow[];
  prnMedications?: string;
  medicationChanges?: string;
  medicationReconciliationCompleted: 'No' | 'Yes' | '';

  // ── 8. Symptom Management Instructions ──
  painManagementInstructions?: string;
  breathlessnessManagement?: string;
  nauseaVomitingManagement?: string;
  constipationManagement?: string;
  anxietyAgitationDeliriumManagement?: string;
  otherSymptomManagement?: string;

  // ── 9. Nutrition and Hydration Plan ──
  diet: 'Regular' | 'Soft' | 'Pureed' | 'Modified' | 'Other' | '';
  dietOther?: string;
  feedingAssistance: 'NotRequired' | 'Required' | '';
  enteralFeeding: 'No' | 'Yes' | '';
  feedingTube: 'None' | 'NG' | 'PEG' | 'Other' | '';
  feedingTubeOther?: string;
  hydrationInstructions?: string;
  nutritionDietitianFollowUp: 'No' | 'Yes' | '';

  // ── 10. Wound / Skin Care ──
  woundPresent: 'No' | 'Yes' | '';
  woundLocation?: string;
  woundCareInstructions?: string;
  dressingChanges?: string;
  pressureInjuryPrevention?: string;

  // ── 11. Oxygen / Medical Equipment ──
  oxygenRequired: 'No' | 'Yes' | '';
  oxygenDeliveryMethod: 'NasalCannula' | 'Mask' | 'Other' | '';
  oxygenDeliveryMethodOther?: string;
  oxygenFlowRate?: string;
  equipmentRequired: string[];                // multi-select
  equipmentOther?: string;
  equipmentArranged: 'No' | 'Yes' | '';

  // ── 12. Goals of Care ──
  currentGoalsOfCare: string[];
  currentGoalsOfCareOther?: string;
  goalsOfCareReviewed: 'No' | 'Yes' | '';
  patientDecisionMakerPreferences?: string;
  codeStatus: 'FullResuscitation' | 'DNAR' | 'Other' | '';
  codeStatusOther?: string;
  advanceCarePlan: 'NotAvailable' | 'Completed' | 'Reviewed' | 'Updated' | '';

  // ── 13. Discharge Destination ──
  dischargedTo:
    | 'Home'
    | 'FamilyCaregiverHome'
    | 'Hospice'
    | 'NursingLongTermCare'
    | 'AnotherHospital'
    | 'Other'
    | '';
  dischargedToOther?: string;
  destinationAddress?: string;
  transport: 'FamilyPrivateTransport' | 'Ambulance' | 'MedicalTransport' | 'Other' | '';
  transportOther?: string;
  escortCaregiver?: string;

  // ── 14. Home / Hospice Care Plan ──
  homePalliativeCareRequired: 'No' | 'Yes' | '';
  hospiceReferral: 'No' | 'Yes' | 'AlreadyEnrolled' | '';
  communityNursingRequired: 'No' | 'Yes' | '';
  homeVisitsRequired: 'No' | 'Yes' | '';
  caregiverSupportRequired: 'No' | 'Yes' | '';
  servicesArranged?: string;
  responsibleProvider?: string;
  responsibleProviderPhone?: string;

  // ── 15. Patient and Caregiver Education ──
  educationTopics: string[];
  educationOther?: string;
  patientUnderstanding:
    | 'VerbalizedUnderstanding'
    | 'DemonstratedUnderstanding'
    | 'RequiresFurtherEducation'
    | '';
  additionalEducationRequired?: string;

  // ── 16. Warning Signs / When to Seek Help ──
  warningSigns: string[];
  warningSignsOther?: string;
  warningSignsSpecificInstructions?: string;

  // ── 17. Follow-up Plan ──
  palliativeCareFollowUp: 'No' | 'Yes' | '';
  palliativeCareFollowUpDate?: string;
  palliativeCareFollowUpTime?: string;
  physicianSpecialistFollowUp?: string;
  primaryCareFollowUp?: string;
  hospiceHomeCareFollowUp?: string;
  otherAppointments?: string;

  // ── 18. Contact Information ──
  palliativeCareUnitContact?: string;
  palliativeCareUnitPhone?: string;
  attendingClinician?: string;
  attendingClinicianPhone?: string;
  emergencyContactInfo?: string;
  homeHospiceService?: string;
  homeHospiceServicePhone?: string;

  // ── 19. Discharge Notes ──
  dischargeNotes?: string;

  // ── Workflow ──
  status: 'Draft' | 'Final';                  // Draft allows editing before finalization

  // ── Meta ──
  createdBy: mongoose.Types.ObjectId;         // → Staff (admin)
  createdAt: Date;
  updatedAt: Date;
  
}

// ─────────────────────────────────────────────────────────────
// Sub-schemas
// ─────────────────────────────────────────────────────────────

const SymptomRowSchema = new Schema<IDischargeSymptomRow>(
  {
    severity: {
      type: String,
      enum: ['None', 'Mild', 'Moderate', 'Severe'],
      default: 'None',
    },
    managementNotes: { type: String, default: '' },
  },
  { _id: false }
);

const MedRowSchema = new Schema<IDischargeMedRow>(
  {
    medication: { type: String, default: '' },
    dose: { type: String, default: '' },
    route: { type: String, default: '' },
    frequency: { type: String, default: '' },
    purpose: { type: String, default: '' },
    instructions: { type: String, default: '' },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────
// Main schema
// ─────────────────────────────────────────────────────────────

const DischargeSummarySchema = new Schema<IDischargeSummary>(
  {
    // ── Relationships ──
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    admissionId: {
      type: Schema.Types.ObjectId,
      ref: 'HospitalAdmission',
    },

    // ── Header ──
    hospitalName: { type: String, default: '' },
    palliativeCareUnit: { type: String, default: '' },
    dateOfAdmission: String,
    dateOfDischarge: { type: String, required: true },
    timeOfDischarge: String,
    dischargeType: {
      type: String,
      enum: [
        'PlannedDischarge',
        'Transfer',
        'DischargeToHome',
        'DischargeToHospice',
        'DischargeToLongTermCare',
        'TransferToAnotherHospital',
        'Other',
        '',
      ],
      default: '',
    },
    dischargeTypeOther: String,

    // ── Patient ID snapshot ──
    fullName: String,
    dateOfBirth: String,
    age: String,
    sex: String,
    address: String,
    telephone: String,
    primaryCaregiver: String,
    caregiverRelationship: String,
    caregiverTelephone: String,

    // ── 2. Admission Info ──
    primaryDiagnosis: String,
    secondaryDiagnoses: String,
    reasonForAdmission: String,
    referringPhysicianFacility: String,

    // ── 3. Clinical Summary ──
    finalDischargeDiagnosis: String,
    clinicalProblemsManaged: { type: [String], default: [] },
    summaryOfClinicalCourse: String,
    importantInvestigations: String,

    // ── 4. Condition at Discharge ──
    overallCondition: {
      type: String,
      enum: [
        'Stable',
        'Improved',
        'Unchanged',
        'Deteriorating',
        'RequiresOngoingPalliativeCare',
        '',
      ],
      default: '',
    },
    levelOfConsciousness: {
      type: String,
      enum: ['Alert', 'Drowsy', 'Confused', 'Delirious', 'Unresponsive', ''],
      default: '',
    },
    functionalStatus: {
      type: String,
      enum: ['Independent', 'RequiresAssistance', 'Bedbound', 'FullyDependent', ''],
      default: '',
    },
    mobility: {
      type: String,
      enum: ['Independent', 'Assisted', 'Wheelchair', 'Bedbound', ''],
      default: '',
    },
    oralIntake: {
      type: String,
      enum: ['Adequate', 'Reduced', 'Minimal', 'None', ''],
      default: '',
    },

    // ── 5. Vital Signs ──
    temperature: String,
    pulse: String,
    respiratoryRate: String,
    bloodPressure: String,
    oxygenSaturation: String,
    oxygenRequirement: String,

    // ── 6. Symptoms ──
    symptoms: { type: Schema.Types.Mixed, default: {} },
    painScore: String,
    painControl: {
      type: String,
      enum: ['WellControlled', 'PartiallyControlled', 'PoorlyControlled', ''],
      default: '',
    },

    // ── 7. Medications ──
    dischargeMedications: { type: [MedRowSchema], default: [] },
    prnMedications: String,
    medicationChanges: String,
    medicationReconciliationCompleted: {
      type: String,
      enum: ['No', 'Yes', ''],
      default: '',
    },

    // ── 8. Symptom Management Instructions ──
    painManagementInstructions: String,
    breathlessnessManagement: String,
    nauseaVomitingManagement: String,
    constipationManagement: String,
    anxietyAgitationDeliriumManagement: String,
    otherSymptomManagement: String,

    // ── 9. Nutrition ──
    diet: {
      type: String,
      enum: ['Regular', 'Soft', 'Pureed', 'Modified', 'Other', ''],
      default: '',
    },
    dietOther: String,
    feedingAssistance: { type: String, enum: ['NotRequired', 'Required', ''], default: '' },
    enteralFeeding: { type: String, enum: ['No', 'Yes', ''], default: '' },
    feedingTube: { type: String, enum: ['None', 'NG', 'PEG', 'Other', ''], default: '' },
    feedingTubeOther: String,
    hydrationInstructions: String,
    nutritionDietitianFollowUp: { type: String, enum: ['No', 'Yes', ''], default: '' },

    // ── 10. Wound / Skin ──
    woundPresent: { type: String, enum: ['No', 'Yes', ''], default: '' },
    woundLocation: String,
    woundCareInstructions: String,
    dressingChanges: String,
    pressureInjuryPrevention: String,

    // ── 11. Oxygen / Equipment ──
    oxygenRequired: { type: String, enum: ['No', 'Yes', ''], default: '' },
    oxygenDeliveryMethod: {
      type: String,
      enum: ['NasalCannula', 'Mask', 'Other', ''],
      default: '',
    },
    oxygenDeliveryMethodOther: String,
    oxygenFlowRate: String,
    equipmentRequired: { type: [String], default: [] },
    equipmentOther: String,
    equipmentArranged: { type: String, enum: ['No', 'Yes', ''], default: '' },

    // ── 12. Goals of Care ──
    currentGoalsOfCare: { type: [String], default: [] },
    currentGoalsOfCareOther: String,
    goalsOfCareReviewed: { type: String, enum: ['No', 'Yes', ''], default: '' },
    patientDecisionMakerPreferences: String,
    codeStatus: {
      type: String,
      enum: ['FullResuscitation', 'DNAR', 'Other', ''],
      default: '',
    },
    codeStatusOther: String,
    advanceCarePlan: {
      type: String,
      enum: ['NotAvailable', 'Completed', 'Reviewed', 'Updated', ''],
      default: '',
    },

    // ── 13. Destination ──
    dischargedTo: {
      type: String,
      enum: [
        'Home',
        'FamilyCaregiverHome',
        'Hospice',
        'NursingLongTermCare',
        'AnotherHospital',
        'Other',
        '',
      ],
      default: '',
    },
    dischargedToOther: String,
    destinationAddress: String,
    transport: {
      type: String,
      enum: ['FamilyPrivateTransport', 'Ambulance', 'MedicalTransport', 'Other', ''],
      default: '',
    },
    transportOther: String,
    escortCaregiver: String,

    // ── 14. Home / Hospice ──
    homePalliativeCareRequired: { type: String, enum: ['No', 'Yes', ''], default: '' },
    hospiceReferral: {
      type: String,
      enum: ['No', 'Yes', 'AlreadyEnrolled', ''],
      default: '',
    },
    communityNursingRequired: { type: String, enum: ['No', 'Yes', ''], default: '' },
    homeVisitsRequired: { type: String, enum: ['No', 'Yes', ''], default: '' },
    caregiverSupportRequired: { type: String, enum: ['No', 'Yes', ''], default: '' },
    servicesArranged: String,
    responsibleProvider: String,
    responsibleProviderPhone: String,

    // ── 15. Education ──
    educationTopics: { type: [String], default: [] },
    educationOther: String,
    patientUnderstanding: {
      type: String,
      enum: [
        'VerbalizedUnderstanding',
        'DemonstratedUnderstanding',
        'RequiresFurtherEducation',
        '',
      ],
      default: '',
    },
    additionalEducationRequired: String,

    // ── 16. Warning Signs ──
    warningSigns: { type: [String], default: [] },
    warningSignsOther: String,
    warningSignsSpecificInstructions: String,

    // ── 17. Follow-up ──
    palliativeCareFollowUp: { type: String, enum: ['No', 'Yes', ''], default: '' },
    palliativeCareFollowUpDate: String,
    palliativeCareFollowUpTime: String,
    physicianSpecialistFollowUp: String,
    primaryCareFollowUp: String,
    hospiceHomeCareFollowUp: String,
    otherAppointments: String,

    // ── 18. Contacts ──
    palliativeCareUnitContact: String,
    palliativeCareUnitPhone: String,
    attendingClinician: String,
    attendingClinicianPhone: String,
    emergencyContactInfo: String,
    homeHospiceService: String,
    homeHospiceServicePhone: String,

    // ── 19. Notes ──
    dischargeNotes: String,

    // ── Workflow ──
    status: {
      type: String,
      enum: ['Draft', 'Final'],
      default: 'Final',
    },

    // ── Meta ──
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────
DischargeSummarySchema.index({ patientId: 1 });
DischargeSummarySchema.index({ admissionId: 1 }, { unique: true, sparse: true });
DischargeSummarySchema.index({ dateOfDischarge: -1 });
DischargeSummarySchema.index({ status: 1 });
DischargeSummarySchema.index({ createdBy: 1 });

export const DischargeSummary = mongoose.model<IDischargeSummary>(
  'DischargeSummary',
  DischargeSummarySchema
);
export default DischargeSummary;