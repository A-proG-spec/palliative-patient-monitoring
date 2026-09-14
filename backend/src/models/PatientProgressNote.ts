import mongoose, { Schema, Document } from 'mongoose';
import { applySoftDeleteFilter } from '@middlewares/softDelete.middleware.js';

// ─────────────────────────────────────────────────────────────
// Sub-document types
// ─────────────────────────────────────────────────────────────

export interface IVitalsPair {
  current: string;
  previous: string;
}

export type SymptomSeverity = 'None' | 'Mild' | 'Moderate' | 'Severe';

export interface ISymptomRow {
  severity: SymptomSeverity;
  notes: string;
}

export interface IMedicationRow {
  medicationTreatment: string;
  dose: string;
  route: string;
  frequency: string;
  reasonResponse: string;
}

export interface IAdditionalNoteRow {
  date: string;
  time: string;
  note: string;
  clinicianName: string;
}

export interface IMDTReviewRow {
  discipline: string;
  reviewIntervention: string;
  followUpRequired: 'No' | 'Yes' | '';
}

// ─────────────────────────────────────────────────────────────
// Signature sub-document — same shape as HomeVisit signatures
// ─────────────────────────────────────────────────────────────
export interface IProgressNoteSignature {
  staffId: mongoose.Types.ObjectId;      // → Staff
  name: string;                          // snapshot for display
  role: 'Physician' | 'Nurse' | 'Reviewer';
  signedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Main document
// ─────────────────────────────────────────────────────────────

export interface IPatientProgressNote extends Document {
  // ── Relationships ──
  patientId: mongoose.Types.ObjectId;         // → Patient
  admissionId?: mongoose.Types.ObjectId;
  palliativeCareUnit: string

  // ── Header ──
  attendingClinician: string;                 // the name printed at the top of the form

  // ═════════════════════════════════════════════════════════════
  // 1. CURRENT CLINICAL STATUS
  // ═════════════════════════════════════════════════════════════
  generalCondition: 'Stable' | 'Improving' | 'Deteriorating' | 'Critical' | 'ActivelyDying' | '';
  levelOfConsciousness: 'Alert' | 'Drowsy' | 'Confused' | 'Delirious' | 'Unresponsive' | '';
  orientation: 'Oriented' | 'PartiallyOriented' | 'Disoriented' | 'UnableToAssess' | '';
  functionalStatus: 'Independent' | 'RequiresAssistance' | 'Bedbound' | 'FullyDependent' | '';
  changesSincePreviousReview: string;

  // ═════════════════════════════════════════════════════════════
  // 2. VITAL SIGNS
  // ═════════════════════════════════════════════════════════════
  vitals: {
    temperature: IVitalsPair;
    pulse: IVitalsPair;
    respiratoryRate: IVitalsPair;
    bloodPressure: IVitalsPair;
    spo2: IVitalsPair;
    oxygenFlow: IVitalsPair;
  };
otherRelevantObservations:string;
  // ═════════════════════════════════════════════════════════════
  // 3. SYMPTOM ASSESSMENT
  // ═════════════════════════════════════════════════════════════
  symptoms: Record<string, ISymptomRow>;
  painScore: string;
  painLocation: string;
  painCharacter: string;
  currentPainManagement: string;
  responseToTreatment: 'Good' | 'Partial' | 'Poor' | 'NotApplicable' | '';
  breakthroughPainEpisodes: 'No' | 'Yes' | '';
  breakthroughPainFrequency: string;

  // ═════════════════════════════════════════════════════════════
  // 4. RESPIRATORY STATUS
  // ═════════════════════════════════════════════════════════════
  breathing: 'Comfortable' | 'MildDistress' | 'ModerateDistress' | 'SevereDistress' | '';
  oxygenTherapy: 'No' | 'Yes' | '';
  oxygenDelivery: 'NasalCannula' | 'Mask' | 'Other' | '';
  oxygenDeliveryOther: string;
  respiratorySecretions: 'None' | 'Mild' | 'Moderate' | 'Excessive' | '';
  cough: 'No' | 'Yes' | '';
  otherRespiratoryFindings: string;

  // ═════════════════════════════════════════════════════════════
  // 5. NUTRITION AND HYDRATION
  // ═════════════════════════════════════════════════════════════
  oralIntake: 'Good' | 'Reduced' | 'Minimal' | 'None' | '';
  diet: string;
  fluidIntake: string;
  feedingAssistance: 'No' | 'Yes' | '';
  enteralFeeding: 'No' | 'Yes' | '';
  ivFluids: 'No' | 'Yes' | '';
  nauseaVomitingAffectingIntake: 'No' | 'Yes' | '';
  nutritionHydrationConcerns: string;

  // ═════════════════════════════════════════════════════════════
  // 6. ELIMINATION
  // ═════════════════════════════════════════════════════════════
  urineOutput: 'Normal' | 'Reduced' | 'Minimal' | 'UnableToAssess' | '';
  urinaryCatheter: 'No' | 'Yes' | '';
  bowelMovement: 'Normal' | 'Constipated' | 'Diarrhea' | 'NoRecentBM' | '';
  lastBowelMovement: string;
  otherEliminationConcerns: string;

  // ═════════════════════════════════════════════════════════════
  // 7. SKIN AND WOUND STATUS
  // ═════════════════════════════════════════════════════════════
  skin: 'Intact' | 'Dry' | 'Fragile' | 'Edematous' | 'Other' | '';
  skinOther: string;
  pressureInjury: 'No' | 'Yes' | '';
  pressureInjuryLocationStage: string;
  woundCareProvided: 'No' | 'Yes' | '';
  woundPressureInjuryChanges: string;

  // ═════════════════════════════════════════════════════════════
  // 8. PSYCHOLOGICAL / EMOTIONAL STATUS
  // ═════════════════════════════════════════════════════════════
  moodBehavior: Array<'Calm' | 'Anxious' | 'Fearful' | 'Sad' | 'Depressed' | 'Agitated' | 'Withdrawn'>;
  psychologicalDistress: 'None' | 'Mild' | 'Moderate' | 'Severe' | '';
  patientsMainConcernsToday: string;
  counselingPsychologicalSupportProvided: 'No' | 'Yes' | '';

  // ═════════════════════════════════════════════════════════════
  // 9. SPIRITUAL / CULTURAL NEEDS
  // ═════════════════════════════════════════════════════════════
  spiritualDistressIdentified: 'No' | 'Yes' | '';
  patientsSpiritualCulturalConcerns: string;
  spiritualCareProvided: 'No' | 'Yes' | '';
  spiritualReferralRequired: 'No' | 'Yes' | '';
  spiritualNotes: string;

  // ═════════════════════════════════════════════════════════════
  // 10. FAMILY / CAREGIVER UPDATE
  // ═════════════════════════════════════════════════════════════
  familyCaregiverPresent: 'No' | 'Yes' | '';
  familyCaregiverConcerns: string;
  familyEducationSupportProvided: string;
  familyMeetingHeld: 'No' | 'Yes' | '';
  familyMeetingParticipants: string;

  // ═════════════════════════════════════════════════════════════
  // 11. GOALS OF CARE REVIEW
  // ═════════════════════════════════════════════════════════════
  currentGoalsOfCare: Array<
    | 'ComfortSymptomControl'
    | 'QualityOfLife'
    | 'FunctionalSupport'
    | 'DiseaseDirectedTreatment'
    | 'EndOfLifeCare'
    | 'HomeHospiceCare'
    | 'Other'
  >;
  currentGoalsOfCareOther: string;
  goalsReviewedToday: 'No' | 'Yes' | '';
  changeInGoalsIdentified: 'No' | 'Yes' | '';
  patientDecisionMakerPreferences: string;
  codeStatus: 'FullResuscitation' | 'DNAR' | 'Other' | '';
  codeStatusOther: string;
  advanceCarePlanReviewed: 'No' | 'Yes' | '';

  // ═════════════════════════════════════════════════════════════
  // 12. MEDICATION REVIEW
  // ═════════════════════════════════════════════════════════════
  currentMedicationRegimenReviewed: 'No' | 'Yes' | '';
  changesMade: 'No' | 'Yes' | '';
  medications: IMedicationRow[];
  prnBreakthroughMedicationUsed: 'No' | 'Yes' | '';
  prnEffectiveness: 'Effective' | 'PartiallyEffective' | 'Ineffective' | '';
  medicationSideEffects: 'None' | 'Yes' | '';
  medicationSideEffectsDetail: string;

  // ═════════════════════════════════════════════════════════════
  // 13. NURSING / SUPPORTIVE CARE PROVIDED
  // ═════════════════════════════════════════════════════════════
  nursingSupportiveCareProvided: Array<
    | 'PositioningComfortMeasures'
    | 'PersonalHygiene'
    | 'OralCare'
    | 'PressureInjuryPrevention'
    | 'WoundCare'
    | 'OxygenTherapy'
    | 'SymptomMonitoring'
    | 'MedicationAdministration'
    | 'NutritionHydrationSupport'
    | 'EmotionalSupport'
    | 'FamilyCaregiverEducation'
    | 'Other'
  >;
  nursingSupportiveCareOther: string;
  responseToSupportiveCare: string;

  // ═════════════════════════════════════════════════════════════
  // 14. INVESTIGATIONS / RESULTS
  // ═════════════════════════════════════════════════════════════
  investigationsPerformedReviewed: Array<
    | 'LaboratoryTests'
    | 'Imaging'
    | 'ECGOtherDiagnosticTest'
    | 'None'
    | 'Other'
  >;
  investigationsPerformedReviewedOther: string;
  significantResults: string;
  clinicalSignificanceActionTaken: string;

  // ═════════════════════════════════════════════════════════════
  // 15. MULTIDISCIPLINARY TEAM REVIEW
  // ═════════════════════════════════════════════════════════════
  multidisciplinaryTeamReview: IMDTReviewRow[];

  // ═════════════════════════════════════════════════════════════
  // 16. CLINICAL ASSESSMENT
  // ═════════════════════════════════════════════════════════════
  overallAssessment: string;
  problemsIdentifiedToday: string[];

  // ═════════════════════════════════════════════════════════════
  // 17. PLAN FOR NEXT PERIOD
  // ═════════════════════════════════════════════════════════════
  symptomManagementPlan: string;
  medicationPlan: string;
  nursingSupportiveCarePlan: string;
  investigationsMonitoring: string;
  familyCaregiverPlan: string;
  referralsConsultations: string;
  dischargeTransferHospicePlanning: string;

  // ═════════════════════════════════════════════════════════════
  // 18. SOAP FORMAT
  // ═════════════════════════════════════════════════════════════
  soapSubjective: string;
  soapObjective: string;
  soapAssessment: string;
  soapPlan: string;

  // ═════════════════════════════════════════════════════════════
  // 19. ADDITIONAL PROGRESS NOTES
  // ═════════════════════════════════════════════════════════════
  additionalProgressNotes: IAdditionalNoteRow[];

  // ═════════════════════════════════════════════════════════════
  // 20. AUTHORIZATION + SIGNATURES
  // ═════════════════════════════════════════════════════════════
  // The responsible clinician is auto-signed at creation (same pattern
  // as the team leader on a home visit). All other signatures are
  // captured later via the bcrypt-verified /sign endpoint.
  responsibleClinicianId: mongoose.Types.ObjectId;   // → Staff (auto-signed)
  signatures: IProgressNoteSignature[];              // Physician, Nurse, Reviewer

  // Facility metadata (informational — not a signature)
  facilityStamp: string;

  // ── Meta ──
  createdBy: mongoose.Types.ObjectId;    // → Staff who saved the note
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  deletedBy: mongoose.Types.ObjectId | null;
  deletionReason?: string | null;
  updatedBy: mongoose.Types.ObjectId | null;
}

// ─────────────────────────────────────────────────────────────
// Sub-schemas
// ─────────────────────────────────────────────────────────────

const VitalsPairSchema = new Schema<IVitalsPair>(
  {
    current: { type: String, default: '' },
    previous: { type: String, default: '' },
  },
  { _id: false }
);

const SymptomRowSchema = new Schema<ISymptomRow>(
  {
    severity: {
      type: String,
      enum: ['None', 'Mild', 'Moderate', 'Severe'],
      default: 'None',
    },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const MedicationRowSchema = new Schema<IMedicationRow>(
  {
    medicationTreatment: { type: String, default: '' },
    dose: { type: String, default: '' },
    route: { type: String, default: '' },
    frequency: { type: String, default: '' },
    reasonResponse: { type: String, default: '' },
  },
  { _id: false }
);

const AdditionalNoteRowSchema = new Schema<IAdditionalNoteRow>(
  {
    date: { type: String, default: '' },
    time: { type: String, default: '' },
    note: { type: String, default: '' },
    clinicianName: { type: String, default: '' },
  },
  { _id: false }
);

const MDTReviewRowSchema = new Schema<IMDTReviewRow>(
  {
    discipline: { type: String, default: '' },
    reviewIntervention: { type: String, default: '' },
    followUpRequired: { type: String, enum: ['No', 'Yes', ''], default: '' },
  },
  { _id: false }
);

// Same shape as VisitSignatureSchema on HomeVisit — keeps the two
// signing systems symmetric.
const ProgressNoteSignatureSchema = new Schema<IProgressNoteSignature>(
  {
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['Physician', 'Nurse', 'Reviewer'],
      required: true,
    },
    signedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────
// Main schema
// ─────────────────────────────────────────────────────────────

const PatientProgressNoteSchema = new Schema<IPatientProgressNote>(
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
    attendingClinician: { type: String, required: true },
    palliativeCareUnit: { type: String },
    // ── 1. Current Clinical Status ──
    generalCondition: {
      type: String,
      enum: ['Stable', 'Improving', 'Deteriorating', 'Critical', 'ActivelyDying', ''],
      default: '',
    },
    levelOfConsciousness: {
      type: String,
      enum: ['Alert', 'Drowsy', 'Confused', 'Delirious', 'Unresponsive', ''],
      default: '',
    },
    orientation: {
      type: String,
      enum: ['Oriented', 'PartiallyOriented', 'Disoriented', 'UnableToAssess', ''],
      default: '',
    },
    functionalStatus: {
      type: String,
      enum: ['Independent', 'RequiresAssistance', 'Bedbound', 'FullyDependent', ''],
      default: '',
    },
    changesSincePreviousReview: { type: String, default: '' },

    // ── 2. Vital Signs ──
    vitals: {
      temperature: { type: VitalsPairSchema, default: () => ({ current: '', previous: '' }) },
      pulse: { type: VitalsPairSchema, default: () => ({ current: '', previous: '' }) },
      respiratoryRate: { type: VitalsPairSchema, default: () => ({ current: '', previous: '' }) },
      bloodPressure: { type: VitalsPairSchema, default: () => ({ current: '', previous: '' }) },
      spo2: { type: VitalsPairSchema, default: () => ({ current: '', previous: '' }) },
      oxygenFlow:{type: VitalsPairSchema, default:() =>({current:'', previous:''})}
    },
    otherRelevantObservations:{type:String, default:''},

    // ── 3. Symptom Assessment ──
    symptoms: { type: Schema.Types.Mixed, default: {} },

    painScore: { type: String, default: '' },
    painLocation: { type: String, default: '' },
    painCharacter: { type: String, default: '' },
    currentPainManagement: { type: String, default: '' },
    responseToTreatment: {
      type: String,
      enum: ['Good', 'Partial', 'Poor', 'NotApplicable', ''],
      default: '',
    },
    breakthroughPainEpisodes: { type: String, enum: ['No', 'Yes', ''], default: '' },
    breakthroughPainFrequency: { type: String, default: '' },

    // ── 4. Respiratory ──
    breathing: {
      type: String,
      enum: ['Comfortable', 'MildDistress', 'ModerateDistress', 'SevereDistress', ''],
      default: '',
    },
    oxygenTherapy: { type: String, enum: ['No', 'Yes', ''], default: '' },
    oxygenDelivery: { type: String, enum: ['NasalCannula', 'Mask', 'Other', ''], default: '' },
    oxygenDeliveryOther: { type: String, default: '' },
    respiratorySecretions: {
      type: String,
      enum: ['None', 'Mild', 'Moderate', 'Excessive', ''],
      default: '',
    },
    cough: { type: String, enum: ['No', 'Yes', ''], default: '' },
    otherRespiratoryFindings: { type: String, default: '' },

    // ── 5. Nutrition ──
    oralIntake: {
      type: String,
      enum: ['Good', 'Reduced', 'Minimal', 'None', ''],
      default: '',
    },
    diet: { type: String, default: '' },
    fluidIntake: { type: String, default: '' },
    feedingAssistance: { type: String, enum: ['No', 'Yes', ''], default: '' },
    enteralFeeding: { type: String, enum: ['No', 'Yes', ''], default: '' },
    ivFluids: { type: String, enum: ['No', 'Yes', ''], default: '' },
    nauseaVomitingAffectingIntake: { type: String, enum: ['No', 'Yes', ''], default: '' },
    nutritionHydrationConcerns: { type: String, default: '' },

    // ── 6. Elimination ──
    urineOutput: {
      type: String,
      enum: ['Normal', 'Reduced', 'Minimal', 'UnableToAssess', ''],
      default: '',
    },
    urinaryCatheter: { type: String, enum: ['No', 'Yes', ''], default: '' },
    bowelMovement: {
      type: String,
      enum: ['Normal', 'Constipated', 'Diarrhea', 'NoRecentBM', ''],
      default: '',
    },
    lastBowelMovement: { type: String, default: '' },
    otherEliminationConcerns: { type: String, default: '' },

    // ── 7. Skin ──
    skin: {
      type: String,
      enum: ['Intact', 'Dry', 'Fragile', 'Edematous', 'Other', ''],
      default: '',
    },
    skinOther: { type: String, default: '' },
    pressureInjury: { type: String, enum: ['No', 'Yes', ''], default: '' },
    pressureInjuryLocationStage: { type: String, default: '' },
    woundCareProvided: { type: String, enum: ['No', 'Yes', ''], default: '' },
    woundPressureInjuryChanges: { type: String, default: '' },

    // ── 8. Psychological ──
    moodBehavior: { type: [String], default: [] },
    psychologicalDistress: {
      type: String,
      enum: ['None', 'Mild', 'Moderate', 'Severe', ''],
      default: '',
    },
    patientsMainConcernsToday: { type: String, default: '' },
    counselingPsychologicalSupportProvided: {
      type: String,
      enum: ['No', 'Yes', ''],
      default: '',
    },

    // ── 9. Spiritual ──
    spiritualDistressIdentified: { type: String, enum: ['No', 'Yes', ''], default: '' },
    patientsSpiritualCulturalConcerns: { type: String, default: '' },
    spiritualCareProvided: { type: String, enum: ['No', 'Yes', ''], default: '' },
    spiritualReferralRequired: { type: String, enum: ['No', 'Yes', ''], default: '' },
    spiritualNotes: { type: String, default: '' },

    // ── 10. Family ──
    familyCaregiverPresent: { type: String, enum: ['No', 'Yes', ''], default: '' },
    familyCaregiverConcerns: { type: String, default: '' },
    familyEducationSupportProvided: { type: String, default: '' },
    familyMeetingHeld: { type: String, enum: ['No', 'Yes', ''], default: '' },
    familyMeetingParticipants: { type: String, default: '' },

    // ── 11. Goals of Care ──
    currentGoalsOfCare: { type: [String], default: [] },
    currentGoalsOfCareOther: { type: String, default: '' },
    goalsReviewedToday: { type: String, enum: ['No', 'Yes', ''], default: '' },
    changeInGoalsIdentified: { type: String, enum: ['No', 'Yes', ''], default: '' },
    patientDecisionMakerPreferences: { type: String, default: '' },
    codeStatus: {
      type: String,
      enum: ['FullResuscitation', 'DNAR', 'Other', ''],
      default: '',
    },
    codeStatusOther: { type: String, default: '' },
    advanceCarePlanReviewed: { type: String, enum: ['No', 'Yes', ''], default: '' },

    // ── 12. Medication Review ──
    currentMedicationRegimenReviewed: { type: String, enum: ['No', 'Yes', ''], default: '' },
    changesMade: { type: String, enum: ['No', 'Yes', ''], default: '' },
    medications: { type: [MedicationRowSchema], default: [] },
    prnBreakthroughMedicationUsed: { type: String, enum: ['No', 'Yes', ''], default: '' },
    prnEffectiveness: {
      type: String,
      enum: ['Effective', 'PartiallyEffective', 'Ineffective', ''],
      default: '',
    },
    medicationSideEffects: { type: String, enum: ['None', 'Yes', ''], default: '' },
    medicationSideEffectsDetail: { type: String, default: '' },

    // ── 13. Nursing / Supportive Care ──
    nursingSupportiveCareProvided: { type: [String], default: [] },
    nursingSupportiveCareOther: { type: String, default: '' },
    responseToSupportiveCare: { type: String, default: '' },

    // ── 14. Investigations ──
    investigationsPerformedReviewed: { type: [String], default: [] },
    investigationsPerformedReviewedOther: { type: String, default: '' },
    significantResults: { type: String, default: '' },
    clinicalSignificanceActionTaken: { type: String, default: '' },

    // ── 15. MDT Review ──
    multidisciplinaryTeamReview: { type: [MDTReviewRowSchema], default: [] },

    // ── 16. Assessment ──
    overallAssessment: { type: String, default: '' },
    problemsIdentifiedToday: { type: [String], default: [] },

    // ── 17. Plan ──
    symptomManagementPlan: { type: String, default: '' },
    medicationPlan: { type: String, default: '' },
    nursingSupportiveCarePlan: { type: String, default: '' },
    investigationsMonitoring: { type: String, default: '' },
    familyCaregiverPlan: { type: String, default: '' },
    referralsConsultations: { type: String, default: '' },
    dischargeTransferHospicePlanning: { type: String, default: '' },

    // ── 18. SOAP ──
    soapSubjective: { type: String, default: '' },
    soapObjective: { type: String, default: '' },
    soapAssessment: { type: String, default: '' },
    soapPlan: { type: String, default: '' },

    // ── 19. Additional Progress Notes ──
    additionalProgressNotes: { type: [AdditionalNoteRowSchema], default: [] },

    // ── 20. Authorization + Signatures ──
    responsibleClinicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    signatures: { type: [ProgressNoteSignatureSchema], default: [] },

    facilityStamp: { type: String, default: '' },

    // ── Meta ──
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    updatedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    deletionReason: { type: String, default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },

  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────
PatientProgressNoteSchema.index({ patientId: 1, createdAt: -1 });
PatientProgressNoteSchema.index({ admissionId: 1, createdAt: -1 });
PatientProgressNoteSchema.index({ createdBy: 1 });
PatientProgressNoteSchema.index({ responsibleClinicianId: 1 });
PatientProgressNoteSchema.index({ 'signatures.staffId': 1 });
applySoftDeleteFilter(PatientProgressNoteSchema)
// ── Virtual: all required roles have signed ──
// Required signers on a progress note: Physician + Nurse.
// (Responsible clinician is auto-signed, like the team leader on a visit.)
PatientProgressNoteSchema.virtual('allSigned').get(function (this: IPatientProgressNote) {
  const roles = new Set(this.signatures.map((s) => s.role));
  return roles.has('Physician') && roles.has('Nurse');
});

PatientProgressNoteSchema.set('toJSON', { virtuals: true });
PatientProgressNoteSchema.set('toObject', { virtuals: true });

export const PatientProgressNote = mongoose.model<IPatientProgressNote>(
  'PatientProgressNote',
  PatientProgressNoteSchema
);
export default PatientProgressNote;